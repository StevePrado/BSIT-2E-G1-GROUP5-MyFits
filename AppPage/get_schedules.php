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
    s.id, s.outfit_id, s.scheduled_date, s.is_worn, s.is_recurring, s.recurrence_day,
    o.name as outfit_name, o.season, o.occasion, o.color,
    o.top_id, o.bottom_id, o.shoes_id,
    t.image as top_image, b.image as bottom_image, sh.image as shoes_image,
    t.status as top_status, b.status as bottom_status, sh.status as shoes_status
    FROM schedule s
    JOIN outfits o ON s.outfit_id = o.id
    LEFT JOIN clothes t ON o.top_id = t.id
    LEFT JOIN clothes b ON o.bottom_id = b.id
    LEFT JOIN clothes sh ON o.shoes_id = sh.id
    WHERE s.user_id = ?
    ORDER BY s.scheduled_date ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$all_rows = [];
while ($row = $result->fetch_assoc()) {
    $row['in_laundry'] = ($row['top_status'] === 'laundry' || $row['bottom_status'] === 'laundry' || $row['shoes_status'] === 'laundry') ? true : false;
    $all_rows[] = $row;
}
$stmt->close();

$schedules = [];
$start = new DateTime($start_date);
$end = new DateTime($end_date);
$end->modify('+1 day'); // Inclusive

$interval = new DateInterval('P1D');
$period = new DatePeriod($start, $interval, $end);

foreach ($period as $date) {
    $current_date_str = $date->format('Y-m-d');
    $day_of_week = $date->format('l');

    // 1. Check for specific (non-recurring) items today
    $today_items = array_filter($all_rows, function($r) use ($current_date_str) {
        return $r['is_recurring'] == 0 && $r['scheduled_date'] === $current_date_str;
    });

    if (!empty($today_items)) {
        foreach($today_items as $item) $schedules[] = $item;
    } else {
        // 2. If no specific item exists, check for recurring items that match this day of week
        // AND ensuring the recurring record started on or before today
        $recurring_items = array_filter($all_rows, function($r) use ($day_of_week, $current_date_str) {
            return $r['is_recurring'] == 1 && $r['recurrence_day'] === $day_of_week && $r['scheduled_date'] <= $current_date_str;
        });

        foreach($recurring_items as $item) {
            $item['scheduled_date'] = $current_date_str; // Project it to today
            $schedules[] = $item;
        }
    }
}

echo json_encode(["status" => 200, "schedules" => $schedules]);
?>
