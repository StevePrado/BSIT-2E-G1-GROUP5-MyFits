<?php
// Wardrobe Stats backend - Uses SQL COUNT/SUM for advanced reporting
require_once '../includes/session_guard.php';
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT 
        (SELECT COUNT(*) FROM clothes WHERE user_id = ?) as total_items,
        (SELECT COUNT(*) FROM clothes WHERE user_id = ? AND category = 'top') as total_tops,
        (SELECT COUNT(*) FROM clothes WHERE user_id = ? AND category = 'bottom') as total_bottoms,
        (SELECT COUNT(*) FROM clothes WHERE user_id = ? AND category = 'shoes') as total_shoes,
        (SELECT COUNT(*) FROM outfits WHERE user_id = ?) as total_outfits
");
$stmt->bind_param("iiiii", $user_id, $user_id, $user_id, $user_id, $user_id);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
$stmt->close();

echo json_encode(["status" => 200, "stats" => $result]);
?>
