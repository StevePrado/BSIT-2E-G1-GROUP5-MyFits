<?php

// Loads the database connection
require_once '../includes/db_connect.php';

$result = $conn->query("SHOW COLUMNS FROM outfits LIKE 'preview_image'");
if ($result->num_rows == 0) {
    $conn->query("ALTER TABLE outfits ADD COLUMN preview_image VARCHAR(255) DEFAULT NULL");
    echo "Column 'preview_image' added successfully.\n";
} else {
    echo "Column 'preview_image' already exists.\n";
}

$result2 = $conn->query("SHOW COLUMNS FROM schedule LIKE 'is_worn'");
if ($result2->num_rows > 0) {
    $col = $result2->fetch_assoc();
    if (strpos($col['Type'], 'tinyint') !== false || strpos($col['Type'], 'int') !== false) {
        echo "Column 'is_worn' already supports integer values (0,1,2).\n";
    }
}

echo "Database migration complete!\n";
?>
