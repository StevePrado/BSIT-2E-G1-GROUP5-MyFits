<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$query = "SELECT 
    o.id, o.name, o.season, o.occasion, o.color, o.status,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, t.status as top_status,
    b.image as bottom_image, b.status as bottom_status,
    s.image as shoes_image, s.status as shoes_status
    FROM outfits o
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes s ON o.shoes_id = s.id
    WHERE o.user_id = ? 
    ORDER BY o.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$outfits = [];
while ($row = $result->fetch_assoc()) {
    $row['in_laundry'] = ($row['top_status'] === 'laundry' || $row['bottom_status'] === 'laundry' || $row['shoes_status'] === 'laundry' || $row['status'] === 'laundry');
    $outfits[] = $row;
}

$stmt->close();

echo json_encode(["status" => 200, "outfits" => $outfits]);
?>
