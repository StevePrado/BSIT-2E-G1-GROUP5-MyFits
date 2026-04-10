<?php
// Standalone migration — run via browser: http://localhost/MyFitComments/run_migration.php
$_SERVER['SERVER_NAME'] = $_SERVER['SERVER_NAME'] ?? 'localhost';
require_once __DIR__ . '/includes/db_connect.php';

$result = $conn->query("ALTER TABLE schedule ADD COLUMN excluded_dates TEXT DEFAULT NULL");
if ($result) {
    echo "Migration successful: excluded_dates column added.\n";
} else {
    echo "Note: " . $conn->error . "\n";
}
?>
