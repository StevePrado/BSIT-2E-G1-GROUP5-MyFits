<?php
// Step 1: Detect the environment
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

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    
    $stmt = $db->query("SHOW CREATE TABLE outfits");
    print_r($stmt->fetch());
    
    $stmt = $db->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $res = $stmt->execute([1, "PDO Test Outfit", null, null, null, "Summer", "Casual", "Blue"]);
    echo "Insert result: " . ($res ? "Success" : "Failed") . "\n";
    if (!$res) print_r($stmt->errorInfo());
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
