<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT id, name, category, image, season, occasion, color, status FROM clothes WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$clothes = [];
while ($row = $result->fetch_assoc()) {
    $clothes[] = $row;
}

$stmt->close();

echo json_encode(["status" => 200, "clothes" => $clothes]);
?>
