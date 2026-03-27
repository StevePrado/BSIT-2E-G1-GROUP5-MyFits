<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

if (!isset($_GET['id'])) {
    echo json_encode(["status" => 400, "message" => "Missing outfit ID"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$outfit_id = intval($_GET['id']);

$query = "SELECT 
    o.id, o.name, o.season, o.occasion, o.color, o.status,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, b.image as bottom_image, s.image as shoes_image
    FROM outfits o
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes s ON o.shoes_id = s.id
    WHERE o.id = ? AND o.user_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $outfit_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["status" => 200, "outfit" => $row]);
} else {
    echo json_encode(["status" => 404, "message" => "Outfit not found"]);
}

$stmt->close();
?>
