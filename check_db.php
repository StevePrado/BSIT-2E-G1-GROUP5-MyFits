<?php
require 'db_connect.php';

$res = $conn->query("SHOW CREATE TABLE outfits");
$row = $res->fetch_row();
echo $row[1] . "\n\n";

$res = $conn->query("SHOW CREATE TABLE clothes");
$row = $res->fetch_row();
echo $row[1] . "\n\n";
?>
