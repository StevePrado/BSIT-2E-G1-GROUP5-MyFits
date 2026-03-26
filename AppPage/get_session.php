<?php
session_start();

$response = array();

if (isset($_SESSION['user_id']) && isset($_SESSION['user_name'])) {
    $response['status'] = 200;
    $response['userId'] = $_SESSION['user_id'];
    $response['userName'] = $_SESSION['user_name'];
} else {
    $response['status'] = 401;
    $response['userName'] = 'User';
}

echo json_encode($response);
?>
