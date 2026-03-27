<?php
// This part detects if you are on your laptop or online
$is_localhost = ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1');

if ($is_localhost) {
    // --- XAMPP SETTINGS ---
    // If you're on your laptop, use these settings
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "myfits_db";
} else {
    // --- INFINITYFREE SETTINGS ---
    // If you're online (InfinityFree), use these settings instead
    $host = "sql104.infinityfree.com";
    $user = "if0_41441519";   
    $pass = "Accountmyfits1";    
    $dbname = "if0_41441519_myfits";
}

// This line actually connects to the database using the settings above
$conn = mysqli_connect($host, $user, $pass, $dbname);

// If the connection fails, this will stop the script and tell us why
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// If we got here, it means the connection is successful!
?>