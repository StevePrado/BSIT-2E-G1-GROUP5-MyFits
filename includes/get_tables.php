<?php
$conn = mysqli_connect("localhost", "root", "", "myfits_db");
if (!$conn) die(mysqli_connect_error());

$tables = $conn->query("SHOW TABLES");
$out = "";
while ($row = $tables->fetch_row()) {
    $res = $conn->query("SHOW CREATE TABLE " . $row[0]);
    $create = $res->fetch_row();
    $out .= $create[1] . ";\n\n";
}
echo $out;
?>
