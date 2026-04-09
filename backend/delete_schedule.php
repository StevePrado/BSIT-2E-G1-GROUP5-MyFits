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
$schedule_id = isset($_POST['schedule_id']) ? intval($_POST['schedule_id']) : 0;

if (!$schedule_id) {
    echo json_encode(["status" => 400, "message" => "Missing schedule_id."]);
    exit();
}

$stmt = $conn->prepare("DELETE FROM schedule WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $schedule_id, $user_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["status" => 200, "message" => "Schedule deleted."]);
    } else {
        echo json_encode(["status" => 404, "message" => "Schedule not found."]);
    }
} else {
    echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
}

$stmt->close();
?>
