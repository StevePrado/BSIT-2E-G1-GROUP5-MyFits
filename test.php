<?php
$conn = new mysqli("localhost", "root", "", "myfits_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$result = $conn->query("SHOW CREATE TABLE outfits");
$row = $result->fetch_assoc();
echo "TABLE OUTFITS:\n" . $row['Create Table'] . "\n\n";

$result2 = $conn->query("SHOW CREATE TABLE clothes");
$row2 = $result2->fetch_assoc();
echo "TABLE CLOTHES:\n" . $row2['Create Table'] . "\n\n";

$result3 = $conn->query("SELECT * FROM outfits ORDER BY id DESC LIMIT 5");
echo "RECENT OUTFITS:\n";
while ($r = $result3->fetch_assoc()) {
    print_r($r);
}
?>
