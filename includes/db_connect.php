<?php

$is_localhost = ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1');

if ($is_localhost) {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "myfits_db";
} else {
    $host = "sql104.infinityfree.com";
    $user = "if0_41441519";   
    $pass = "Accountmyfits1";    
    $dbname = "if0_41441519_myfits";
}

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

?>