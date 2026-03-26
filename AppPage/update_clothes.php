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
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $category = isset($_POST['category']) ? $_POST['category'] : '';
    $season = isset($_POST['season']) ? $_POST['season'] : '';
    $occasion = isset($_POST['occasion']) ? $_POST['occasion'] : '';
    $color = isset($_POST['color']) ? $_POST['color'] : '';

    if (!$cloth_id || !$name) {
        echo json_encode(["status" => 400, "message" => "Missing required fields."]);
        exit();
    }

    $stmt = $conn->prepare("UPDATE clothes SET name=?, category=?, season=?, occasion=?, color=? WHERE id=? AND user_id=?");
    $stmt->bind_param("sssssii", $name, $category, $season, $occasion, $color, $cloth_id, $user_id);

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
