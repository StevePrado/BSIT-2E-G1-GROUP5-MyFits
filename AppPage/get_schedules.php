<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d');
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d', strtotime('+6 days'));

$query = "SELECT 
    s.id, s.outfit_id, s.scheduled_date, s.is_worn,
    o.name as outfit_name, o.season, o.occasion, o.color,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, b.image as bottom_image, sh.image as shoes_image,
    t.status as top_status, b.status as bottom_status, sh.status as shoes_status
    FROM schedule s
    JOIN outfits o ON s.outfit_id = o.id
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes sh ON o.shoes_id = sh.id
    WHERE s.user_id = ? AND s.scheduled_date BETWEEN ? AND ?
    ORDER BY s.scheduled_date ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("iss", $user_id, $start_date, $end_date);
$stmt->execute();
$result = $stmt->get_result();

$schedules = [];
while ($row = $result->fetch_assoc()) {
    $row['in_laundry'] = ($row['top_status'] === 'laundry' || $row['bottom_status'] === 'laundry' || $row['shoes_status'] === 'laundry') ? true : false;
    $schedules[] = $row;
}

$stmt->close();

echo json_encode(["status" => 200, "schedules" => $schedules]);
?>
