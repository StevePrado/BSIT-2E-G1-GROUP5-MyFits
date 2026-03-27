<?php
// Step 1: Detect the environment
$is_localhost = ($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1');

if ($is_localhost) {
    // If on laptop, use local settings
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "myfits_db";
} else {
    // If online, use InfinityFree settings
    $host = "sql104.infinityfree.com";
    $user = "if0_41441519";   
    $pass = "Accountmyfits1";    
    $dbname = "if0_41441519_myfits";
}

try {
    // Connect using PDO (another way to talk to the database)
    $db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    
    // Check if the 'outfits' table exists
    $stmt = $db->query("SHOW CREATE TABLE outfits");
    print_r($stmt->fetch());
    
    // Also test adding a fake outfit to see if it works
    $stmt = $db->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $res = $stmt->execute([1, "PDO Test Outfit", null, null, null, "Summer", "Casual", "Blue"]);
    echo "Insert result: " . ($res ? "Success" : "Failed") . "\n";
    if (!$res) print_r($stmt->errorInfo());
} catch (Exception $e) {
    // If anything goes wrong, catch the error and show it
    echo "Error: " . $e->getMessage();
}
?>
