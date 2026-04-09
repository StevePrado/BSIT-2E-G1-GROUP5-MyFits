<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$outfit_id = isset($_POST['outfit_id']) ? intval($_POST['outfit_id']) : 0;
$scheduled_date = isset($_POST['scheduled_date']) ? $_POST['scheduled_date'] : '';

if (!$outfit_id || !$scheduled_date) {
    echo json_encode(["status" => 400, "message" => "Missing outfit_id or scheduled_date."]);
    exit();
}


$today = date('Y-m-d');
if ($scheduled_date <= $today) {
    $stmt_check = $conn->prepare("
        SELECT t.status as top_status, b.status as bottom_status, sh.status as shoes_status
        FROM outfits o
        LEFT JOIN clothes t ON o.top_id = t.id
        LEFT JOIN clothes b ON o.bottom_id = b.id
        LEFT JOIN clothes sh ON o.shoes_id = sh.id
        WHERE o.id = ? AND o.user_id = ?
    ");
    $stmt_check->bind_param("ii", $outfit_id, $user_id);
    $stmt_check->execute();
    $o_status = $stmt_check->get_result()->fetch_assoc();
    $stmt_check->close();

    if ($o_status && ($o_status['top_status'] === 'laundry' || $o_status['bottom_status'] === 'laundry' || $o_status['shoes_status'] === 'laundry')) {
        echo json_encode(["status" => 403, "message" => "You can't wear this today—items are still in the laundry!"]);
        exit();
    }
}


$check = $conn->prepare("SELECT id FROM schedule WHERE user_id = ? AND scheduled_date = ?");
$check->bind_param("is", $user_id, $scheduled_date);
$check->execute();
$existing = $check->get_result()->fetch_assoc();
$check->close();

if ($existing) {
    $stmt = $conn->prepare("UPDATE schedule SET outfit_id = ?, is_worn = 0 WHERE id = ? AND user_id = ?");
    $stmt->bind_param("iii", $outfit_id, $existing['id'], $user_id);
    $msg = "Schedule updated!";
} else {
    $stmt = $conn->prepare("INSERT INTO schedule (user_id, outfit_id, scheduled_date) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $user_id, $outfit_id, $scheduled_date);
    $msg = "Schedule saved!";
}

if ($stmt->execute()) {
    $schedule_id = $existing ? $existing['id'] : $conn->insert_id;
    echo json_encode(["status" => 200, "message" => $msg, "schedule_id" => $schedule_id]);
} else {
    echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
}

$stmt->close();
?>
