<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$schedule_id = isset($_POST['schedule_id']) ? intval($_POST['schedule_id']) : 0;
$scheduled_date = isset($_POST['scheduled_date']) ? $_POST['scheduled_date'] : ''; 
$action = isset($_POST['action']) ? $_POST['action'] : '';

if (!$schedule_id || !in_array($action, ['wear', 'laundry', 'undo'])) {
    echo json_encode(["status" => 400, "message" => "Missing schedule_id or invalid action."]);
    exit();
}

// Get the existing schedule record
$stmt = $conn->prepare("SELECT s.*, o.top_id, o.bottom_id, o.shoes_id 
    FROM schedule s 
    JOIN outfits o ON s.outfit_id = o.id 
    WHERE s.id = ? AND s.user_id = ?");
$stmt->bind_param("ii", $schedule_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$schedule = $result->fetch_assoc();
$stmt->close();

if (!$schedule) {
    echo json_encode(["status" => 404, "message" => "Schedule not found."]);
    exit();
}

$outfit_id = $schedule['outfit_id'];
$target_id = $schedule_id;

// SMART RECURRENCE LOGIC:
// If this is a recurring rule, we don't update the rule itself.
// We instead ensure a SPECIFIC row exists for this date.
if ($schedule['is_recurring'] == 1 && $action !== 'undo') {
    if (empty($scheduled_date)) {
        echo json_encode(["status" => 400, "message" => "Date required for recurring items."]);
        exit();
    }
    
    // Check if a specific entry already exists for this date
    $stmt = $conn->prepare("SELECT id FROM schedule WHERE user_id = ? AND outfit_id = ? AND scheduled_date = ? AND is_recurring = 0");
    $stmt->bind_param("iis", $user_id, $outfit_id, $scheduled_date);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($existing) {
        $target_id = $existing['id'];
    } else {
        // Create the "Exception" row for this specific date
        $stmt = $conn->prepare("INSERT INTO schedule (user_id, outfit_id, scheduled_date, is_worn, is_recurring) VALUES (?, ?, ?, 1, 0)");
        $stmt->bind_param("iis", $user_id, $outfit_id, $scheduled_date);
        $stmt->execute();
        $target_id = $conn->insert_id;
        $stmt->close();
    }
}

if ($action === 'wear' || $action === 'laundry') {
    // Mark target (specific) schedule as worn
    $stmt = $conn->prepare("UPDATE schedule SET is_worn = 1 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $target_id, $user_id);
    $stmt->execute();
    $stmt->close();

    // If laundry action, set clothing items to 'laundry'
    if ($action === 'laundry') {
        $clothIds = [];
        if ($schedule['top_id']) $clothIds[] = $schedule['top_id'];
        if ($schedule['bottom_id']) $clothIds[] = $schedule['bottom_id'];
        if ($schedule['shoes_id']) $clothIds[] = $schedule['shoes_id'];

        if (count($clothIds) > 0) {
            $placeholders = implode(',', array_fill(0, count($clothIds), '?'));
            $types = str_repeat('i', count($clothIds));
            $stmt = $conn->prepare("UPDATE clothes SET status = 'laundry' WHERE id IN ($placeholders) AND user_id = ?");
            $clothIds[] = $user_id;
            $types .= 'i';
            $stmt->bind_param($types, ...$clothIds);
            $stmt->execute();
            $stmt->close();
        }
        echo json_encode(["status" => 200, "message" => "Outfit sent to laundry!"]);
    } else {
        echo json_encode(["status" => 200, "message" => "Outfit marked as worn!"]);
    }

} else if ($action === 'undo') {
    // Revert wear status
    $stmt = $conn->prepare("UPDATE schedule SET is_worn = 0 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $schedule_id, $user_id);
    $stmt->execute();
    $stmt->close();

    // Revert clothing items to 'available'
    $clothIds = [];
    if ($schedule['top_id']) $clothIds[] = $schedule['top_id'];
    if ($schedule['bottom_id']) $clothIds[] = $schedule['bottom_id'];
    if ($schedule['shoes_id']) $clothIds[] = $schedule['shoes_id'];

    if (count($clothIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($clothIds), '?'));
        $types = str_repeat('i', count($clothIds));
        $stmt = $conn->prepare("UPDATE clothes SET status = 'available' WHERE id IN ($placeholders) AND user_id = ?");
        $clothIds[] = $user_id;
        $types .= 'i';
        $stmt->bind_param($types, ...$clothIds);
        $stmt->execute();
        $stmt->close();
    }
    echo json_encode(["status" => 200, "message" => "Action undone!"]);
}
?>
