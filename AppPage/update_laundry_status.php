<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cloth_id = isset($_POST['cloth_id']) ? intval($_POST['cloth_id']) : null;
    $bulk_action = isset($_POST['bulk_action']) ? $_POST['bulk_action'] : null;
    
    if ($bulk_action === 'mark_all_clean') {
        $stmt = $conn->prepare("UPDATE clothes SET status = 'ready' WHERE user_id = ? AND status = 'laundry'");
        $stmt->bind_param("i", $user_id);
    } else if ($cloth_id) {
        $stmt = $conn->prepare("UPDATE clothes SET status = 'ready' WHERE id = ? AND user_id = ? AND status = 'laundry'");
        $stmt->bind_param("ii", $cloth_id, $user_id);
    } else {
        echo json_encode(["status" => 400, "message" => "Invalid request. Provide cloth_id or bulk_action."]);
        exit();
    }
    
    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Laundry status updated successfully."]);
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed."]);
}
?>
