<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(["status" => 401, "message" => "Unauthorized. Please log in."]);
    exit();
}

$user_id = $_SESSION['user_id'];
?>
