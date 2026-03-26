<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "myfits_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["status" => 500, "message" => "Database connection failed."]);
    exit();
}