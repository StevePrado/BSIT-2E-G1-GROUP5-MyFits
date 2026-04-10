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
$mode = isset($_POST['mode']) ? $_POST['mode'] : 'all';
$date = isset($_POST['date']) ? $_POST['date'] : '';

if (!$schedule_id) {
    echo json_encode(["status" => 400, "message" => "Missing schedule_id."]);
    exit();
}

// Fetch the schedule to check ownership and recurrence
$check = $conn->prepare("SELECT id, is_recurring, excluded_dates FROM schedule WHERE id = ? AND user_id = ?");
$check->bind_param("ii", $schedule_id, $user_id);
$check->execute();
$schedule = $check->get_result()->fetch_assoc();
$check->close();

if (!$schedule) {
    echo json_encode(["status" => 404, "message" => "Schedule not found."]);
    exit();
}

if ($mode === 'single' && $schedule['is_recurring'] == 1 && $date) {
    // Single-instance delete: add date to exclusions list
    $excluded = $schedule['excluded_dates'] ? json_decode($schedule['excluded_dates'], true) : [];
    if (!is_array($excluded)) $excluded = [];
    if (!in_array($date, $excluded)) {
        $excluded[] = $date;
    }
    $excludedJson = json_encode($excluded);

    $stmt = $conn->prepare("UPDATE schedule SET excluded_dates = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $excludedJson, $schedule_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "This instance has been removed."]);
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    $stmt->close();

} else if ($mode === 'all_repeats' && $schedule['is_recurring'] == 1) {
    // Stop recurring: set is_recurring = 0
    $stmt = $conn->prepare("UPDATE schedule SET is_recurring = 0, recurrence_day = NULL WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $schedule_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "All future repeats have been removed."]);
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    $stmt->close();

} else {
    // Default: delete the entire schedule row
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
}
?>
