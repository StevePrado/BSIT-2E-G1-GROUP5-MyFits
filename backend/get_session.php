<?php

session_start();
require_once '../includes/db_connect.php';

$response = array();

if (isset($_SESSION['user_id']) && isset($_SESSION['user_name'])) {
    $user_id = $_SESSION['user_id'];
    
    // Fetch the role from database
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    $response['status'] = 200;
    $response['userId'] = $user_id;
    $response['userName'] = $_SESSION['user_name'];
    $response['role'] = $result ? $result['role'] : 'user';
    $stmt->close();
} else {
    $response['status'] = 401;
    $response['userName'] = 'User';
}

echo json_encode($response);
?>
