<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized. Please log in."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $outfit_id = isset($_POST['outfit_id']) ? intval($_POST['outfit_id']) : 0;
    $user_id = $_SESSION['user_id'];

    if ($outfit_id <= 0) {
        echo json_encode(["status" => 400, "message" => "Invalid outfit ID."]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM outfits WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $outfit_id, $user_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => 200, "message" => "Outfit deleted successfully."]);
        } else {
            echo json_encode(["status" => 404, "message" => "Outfit not found or already deleted."]);
        }
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed."]);
}
