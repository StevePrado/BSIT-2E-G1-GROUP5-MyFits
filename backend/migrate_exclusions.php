<?php

// DB migration — add excluded_dates column for recurring schedule exclusions
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$sql = "ALTER TABLE schedule ADD COLUMN IF NOT EXISTS excluded_dates TEXT DEFAULT NULL";

if ($conn->query($sql)) {
    echo json_encode(["status" => 200, "message" => "Migration complete: excluded_dates column added."]);
} else {
    echo json_encode(["status" => 500, "message" => "Migration error: " . $conn->error]);
}
?>
