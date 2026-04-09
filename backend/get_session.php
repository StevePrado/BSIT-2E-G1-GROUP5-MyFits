<?php

session_start();

$response = array();

if (isset($_SESSION['user_id']) && isset($_SESSION['user_name'])) {
    $response['status'] = 200;            // 200 = "Success, you are logged in"
    $response['userId'] = $_SESSION['user_id'];
    $response['userName'] = $_SESSION['user_name'];
} else {
    $response['status'] = 401;            // 401 = "Not logged in"
    $response['userName'] = 'User';
}

echo json_encode($response);
?>
