<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

// Setup
if (!isset($_GET['id'])) {
    echo json_encode(["status" => 400, "message" => "Missing outfit ID"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$outfit_id = intval($_GET['id']);

// Fetch outfit query

$query = "SELECT 
    o.id, o.name, o.season, o.occasion, o.color, o.status,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, t.status as top_status,
    b.image as bottom_image, b.status as bottom_status,
    s.image as shoes_image, s.status as shoes_status,
    sch.scheduled_date, sch.is_recurring, sch.recurrence_day
    FROM outfits o
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes s ON o.shoes_id = s.id
    LEFT JOIN schedule sch ON o.id = sch.outfit_id AND sch.is_worn = 0 AND sch.scheduled_date >= CURDATE()
    WHERE o.id = ? AND o.user_id = ?
    ORDER BY sch.scheduled_date ASC LIMIT 1";

// Execute query
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $outfit_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Laundry flag
    $row['in_laundry'] = ($row['top_status'] === 'laundry' || $row['bottom_status'] === 'laundry' || $row['shoes_status'] === 'laundry');
    echo json_encode(["status" => 200, "outfit" => $row]);
} else {
    // Not found
    echo json_encode(["status" => 404, "message" => "Outfit not found"]);
}

$stmt->close();
?>
