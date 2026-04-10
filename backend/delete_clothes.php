<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cloth_id = isset($_POST['cloth_id']) ? intval($_POST['cloth_id']) : 0;
    $user_id = $_SESSION['user_id'];

    if ($cloth_id <= 0) {
        echo json_encode(["status" => 400, "message" => "Invalid item ID."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT image FROM clothes WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $cloth_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $imagePath = $row['image'];

        $deleteStmt = $conn->prepare("DELETE FROM clothes WHERE id = ? AND user_id = ?");
        $deleteStmt->bind_param("ii", $cloth_id, $user_id);

        if ($deleteStmt->execute()) {
            if (file_exists($imagePath)) {
                unlink($imagePath);    
            }
            echo json_encode(["status" => 200, "message" => "Item deleted successfully."]);
        } else {
            echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
        }
        $deleteStmt->close();
    } else {
        echo json_encode(["status" => 404, "message" => "Item not found or already deleted."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed."]);
}
