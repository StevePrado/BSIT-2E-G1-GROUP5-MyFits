<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cloth_id = isset($_POST['cloth_id']) ? intval($_POST['cloth_id']) : null;  // Which item to update
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $category = isset($_POST['category']) ? $_POST['category'] : '';
    $season = isset($_POST['season']) ? $_POST['season'] : '';
    $occasion = isset($_POST['occasion']) ? $_POST['occasion'] : '';
    $color = isset($_POST['color']) ? $_POST['color'] : '';
    $status = isset($_POST['status']) ? $_POST['status'] : 'ready';  // "ready" or "laundry"

    if (!$cloth_id || !$name) {
        echo json_encode(["status" => 400, "message" => "Missing required fields."]);
        exit();
    }

    $checkStmt = $conn->prepare("SELECT id FROM clothes WHERE user_id = ? AND name = ? AND id != ?");
    $checkStmt->bind_param("isi", $user_id, $name, $cloth_id);
    $checkStmt->execute();
    if ($checkStmt->get_result()->fetch_assoc()) {
        echo json_encode(["status" => 400, "message" => "Name already taken"]);
        exit();
    }
    $checkStmt->close();

    $stmt = $conn->prepare("UPDATE clothes SET name=?, category=?, season=?, occasion=?, color=?, status=? WHERE id=? AND user_id=?");
    $stmt->bind_param("ssssssii", $name, $category, $season, $occasion, $color, $status, $cloth_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Clothing item updated."]);
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
}
?>
