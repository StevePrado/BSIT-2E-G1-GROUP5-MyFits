<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Input parameters
    $cloth_id = isset($_POST['cloth_id']) ? intval($_POST['cloth_id']) : null;
    $bulk_action = isset($_POST['bulk_action']) ? $_POST['bulk_action'] : null;
    
    if ($bulk_action === 'mark_all_clean') {
        // Bulk clean mode
        $stmt = $conn->prepare("UPDATE clothes SET status = 'ready' WHERE user_id = ? AND status = 'laundry'");
        $stmt->bind_param("i", $user_id);
    } else if ($cloth_id) {
        // Single clean mode
        $stmt = $conn->prepare("UPDATE clothes SET status = 'ready' WHERE id = ? AND user_id = ? AND status = 'laundry'");
        $stmt->bind_param("ii", $cloth_id, $user_id);
    } else {
        // Invalid input
        echo json_encode(["status" => 400, "message" => "Invalid request. Provide cloth_id or bulk_action."]);
        exit();
    }
    
    if ($stmt->execute()) {
        // Cascade outfit update
        $cascadeSql = "UPDATE outfits o
            LEFT JOIN clothes t ON o.top_id = t.id
            LEFT JOIN clothes b ON o.bottom_id = b.id
            LEFT JOIN clothes s ON o.shoes_id = s.id
            SET o.status = 'ready'
            WHERE o.user_id = ? AND o.status = 'laundry'
            AND (t.status IS NULL OR t.status != 'laundry')
            AND (b.status IS NULL OR b.status != 'laundry')
            AND (s.status IS NULL OR s.status != 'laundry')";
        $cascadeStmt = $conn->prepare($cascadeSql);
        $cascadeStmt->bind_param("i", $user_id);
        $cascadeStmt->execute();
        $cascadeStmt->close();

        echo json_encode(["status" => 200, "message" => "Laundry status updated successfully."]);
    } else {
        echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed."]);
}
?>
