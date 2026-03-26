<?php
// Let's use PDO since mysqli failed in CLI
try {
    $db = new PDO("mysql:host=localhost;dbname=myfits", "root", "");
    $stmt = $db->query("SHOW CREATE TABLE outfits");
    print_r($stmt->fetch());
    
    // Also test inserting
    $stmt = $db->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $res = $stmt->execute([1, "PDO Test Outfit", null, null, null, "Summer", "Casual", "Blue"]);
    echo "Insert result: " . ($res ? "Success" : "Failed") . "\n";
    if (!$res) print_r($stmt->errorInfo());
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
