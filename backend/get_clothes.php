<?php

// Security Guard check
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, name, category, image, season, occasion, color, status, wear_count, last_worn FROM clothes WHERE user_id = ?";
$params = [$user_id];    // Array of values to bind to the '?' placeholders
$types = "i";            // 'i' = integer (user_id is an integer)

if (!empty($_GET['status'])) {
    $statuses = array_map('trim', explode(',', $_GET['status']));
    $placeholders = implode(',', array_fill(0, count($statuses), '?'));
    $sql .= " AND status IN ($placeholders)";
    foreach ($statuses as $s) {
        $params[] = $s;
        $types .= "s";   // 's' = string (status values are strings)
    }
}

if (!empty($_GET['season'])) {
    $seasons = array_map('trim', explode(',', $_GET['season']));
    $seasons[] = 'all-season';    // Always include items tagged as "Any Season"
    $placeholders = implode(',', array_fill(0, count($seasons), '?'));
    $sql .= " AND season IN ($placeholders)";
    foreach ($seasons as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

if (!empty($_GET['occasion'])) {
    $occasions = array_map('trim', explode(',', $_GET['occasion']));
    $occasions[] = 'any-occasion';    // Always include items tagged as "Any Occasion"
    $placeholders = implode(',', array_fill(0, count($occasions), '?'));
    $sql .= " AND occasion IN ($placeholders)";
    foreach ($occasions as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

if (!empty($_GET['color'])) {
    $colors = array_map('trim', explode(',', $_GET['color']));
    $placeholders = implode(',', array_fill(0, count($colors), '?'));
    $sql .= " AND color IN ($placeholders)";
    foreach ($colors as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
    $sql .= " AND category = ?";
    $params[] = $_GET['category'];
    $types .= "s";
}

if (!empty($_GET['search'])) {
    $sql .= " AND name LIKE ?";
    $params[] = '%' . $_GET['search'] . '%';
    $types .= "s";
}

$sql .= " ORDER BY id DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$clothes = [];
while ($row = $result->fetch_assoc()) {
    $clothes[] = $row;
}

$stmt->close();

echo json_encode(["status" => 200, "clothes" => $clothes]);
?>
