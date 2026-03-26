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
$action = isset($_POST['action']) ? $_POST['action'] : '';

if (!$schedule_id || !in_array($action, ['wear', 'laundry'])) {
    echo json_encode(["status" => 400, "message" => "Missing schedule_id or invalid action."]);
    exit();
}

// Get the schedule and its outfit
$stmt = $conn->prepare("SELECT s.id, s.outfit_id, s.is_worn, o.top_id, o.bottom_id, o.shoes_id 
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

if ($action === 'wear') {
    // Mark schedule as worn
    $stmt = $conn->prepare("UPDATE schedule SET is_worn = 1 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $schedule_id, $user_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(["status" => 200, "message" => "Outfit marked as worn!"]);

} else if ($action === 'laundry') {
    // Mark schedule as worn
    $stmt = $conn->prepare("UPDATE schedule SET is_worn = 1 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $schedule_id, $user_id);
    $stmt->execute();
    $stmt->close();

    // Set all clothing items in this outfit to 'laundry' status
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

    echo json_encode(["status" => 200, "message" => "Outfit sent to laundry! All items marked as in laundry."]);
}
?>
