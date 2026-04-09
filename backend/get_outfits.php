<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

// Base query
$sql = "SELECT 
    o.id, o.name, o.season, o.occasion, o.color, o.status, o.preview_image,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, t.status as top_status,
    b.image as bottom_image, b.status as bottom_status,
    s.image as shoes_image, s.status as shoes_status
    FROM outfits o
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes s ON o.shoes_id = s.id
    WHERE o.user_id = ?";

$params = [$user_id];
$types = "i";

// Status filter
if (!empty($_GET['status'])) {
    $statuses = array_map('trim', explode(',', $_GET['status']));
    $placeholders = implode(',', array_fill(0, count($statuses), '?'));
    $sql .= " AND o.status IN ($placeholders)";
    foreach ($statuses as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

// Season filter

if (!empty($_GET['season'])) {
    $seasons = array_map('trim', explode(',', $_GET['season']));
    $seasons[] = 'all-season';
    $placeholders = implode(',', array_fill(0, count($seasons), '?'));
    $sql .= " AND o.season IN ($placeholders)";
    foreach ($seasons as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

// Occasion filter

if (!empty($_GET['occasion'])) {
    $occasions = array_map('trim', explode(',', $_GET['occasion']));
    $occasions[] = 'any-occasion';
    $placeholders = implode(',', array_fill(0, count($occasions), '?'));
    $sql .= " AND o.occasion IN ($placeholders)";
    foreach ($occasions as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

// Color filter
if (!empty($_GET['color'])) {
    $colors = array_map('trim', explode(',', $_GET['color']));
    $placeholders = implode(',', array_fill(0, count($colors), '?'));
    $sql .= " AND o.color IN ($placeholders)";
    foreach ($colors as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

// Search filter
if (!empty($_GET['search'])) {
    $sql .= " AND o.name LIKE ?";
    $params[] = '%' . $_GET['search'] . '%';
    $types .= "s";
}

// Order by descending
$sql .= " ORDER BY o.id DESC";

// Execute query
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$outfits = [];
while ($row = $result->fetch_assoc()) {
    // Laundry flag
    $row['in_laundry'] = ($row['top_status'] === 'laundry' || $row['bottom_status'] === 'laundry' || $row['shoes_status'] === 'laundry');
    $outfits[] = $row;
}

$stmt->close();

// Output JSON
echo json_encode(["status" => 200, "outfits" => $outfits]);
?>
