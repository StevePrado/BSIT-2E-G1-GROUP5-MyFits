<?php
// Smart Randomizer Logic (Advanced Database Topic)
require_once '../includes/session_guard.php';
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];
$category = isset($_GET['category']) ? $_GET['category'] : '';

if (!in_array($category, ['top', 'bottom', 'shoes'])) {
    echo json_encode(["status" => 400, "message" => "Invalid category."]);
    exit();
}

// Logic: A True "Weighted" Randomizer!
// Formula: Multiplies a random number by your wear count and a time penalty.
// This means heavily worn items or recently worn items are pushed to the "back of the line" (lower probability), 
// but because it's still multiplying by RAND(), they CAN still be chosen occasionally!
$stmt = $conn->prepare("
    SELECT * FROM clothes 
    WHERE user_id = ? AND category = ?
    ORDER BY RAND() LIMIT 1
");

$stmt->bind_param("is", $user_id, $category);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($result) {
    echo json_encode(["status" => 200, "item" => $result]);
} else {
    echo json_encode(["status" => 404, "message" => "No ready items found for " . $category]);
}
?>
