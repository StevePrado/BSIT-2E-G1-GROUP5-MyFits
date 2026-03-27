<?php
// Include your existing connection file
include 'db_connect.php';

if ($conn->ping()) {
    echo "<h1>Connection Successful!</h1>";
    echo "<p>Your system is successfully talking to the <strong>myfits_db</strong> database.</p>";
} else {
    echo "<h1>Connection Error</h1>";
    echo "<p>Error: " . $conn->error . "</p>";
}
?>