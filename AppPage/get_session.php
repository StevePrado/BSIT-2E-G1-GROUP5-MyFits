<?php
session_start();

$response = array();

if (isset($_SESSION['user_name'])) {
    $response['status'] = 200;
    $response['userName'] = $_SESSION['user_name'];
} else {
    $response['status'] = 401;
    $response['userName'] = 'User';
}

echo json_encode($response);
?>

