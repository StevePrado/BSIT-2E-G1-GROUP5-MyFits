<?php
// Standalone migration — run via browser: http://localhost/MyFitsAds/run_advanced_migration.php
$_SERVER['SERVER_NAME'] = $_SERVER['SERVER_NAME'] ?? 'localhost';
require_once __DIR__ . '/includes/db_connect.php';

echo "<h2>Advanced Database Migration</h2>";

// 1. ADD ROLE COLUMN FOR USER ROLES
// (Advanced Feature: User Roles & Privileges — controls who is admin vs regular user)
$result1 = $conn->query("SHOW COLUMNS FROM users LIKE 'role'");
if ($result1->num_rows == 0) {
    if ($conn->query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'")) {
        echo "<p>✅ Added 'role' column to users table successfully.</p>";
    } else {
        echo "<p>❌ Failed to add 'role' column: " . $conn->error . "</p>";
    }
} else {
    echo "<p>✅ 'role' column already exists in users table.</p>";
}

// 2. ADD WEAR COUNT COLUMN FOR WEAR FREQUENCY TRACKING
// (Advanced Feature: Wear Frequency Tracking — counts how many times each clothing item has been worn)
$result2 = $conn->query("SHOW COLUMNS FROM clothes LIKE 'wear_count'");
if ($result2->num_rows == 0) {
    if ($conn->query("ALTER TABLE clothes ADD COLUMN wear_count INT DEFAULT 0")) {
        echo "<p>✅ Added 'wear_count' column to clothes table successfully.</p>";
    } else {
        echo "<p>❌ Failed to add 'wear_count' column: " . $conn->error . "</p>";
    }
} else {
    echo "<p>✅ 'wear_count' column already exists in clothes table.</p>";
}

// 3. ADD LAST WORN DATE FOR TRACKING
// (Advanced Feature: Tracks exactly when the system recorded the clothing as worn)
$result3 = $conn->query("SHOW COLUMNS FROM clothes LIKE 'last_worn'");
if ($result3->num_rows == 0) {
    if ($conn->query("ALTER TABLE clothes ADD COLUMN last_worn DATE NULL DEFAULT NULL")) {
        echo "<p>✅ Added 'last_worn' column to clothes table successfully.</p>";
    } else {
        echo "<p>❌ Failed to add 'last_worn' column: " . $conn->error . "</p>";
    }
} else {
    echo "<p>✅ 'last_worn' column already exists in clothes table.</p>";
}

// 4. CREATE A 'VIEW' FOR REPORT GENERATION
// A "VIEW" is a virtual table that pulls and summarizes data from other tables dynamically.
$viewQuery = "
CREATE OR REPLACE VIEW user_inventory_report AS
SELECT 
    u.id AS user_id,
    CONCAT(u.fname, ' ', u.lname) AS user_name,
    u.email,
    (SELECT COUNT(*) FROM clothes c WHERE c.user_id = u.id) as total_clothes,
    (SELECT COUNT(*) FROM outfits o WHERE o.user_id = u.id) as total_outfits,
    (SELECT COUNT(*) FROM schedule s WHERE s.user_id = u.id) as total_schedules
FROM users u;
";

if ($conn->query($viewQuery)) {
    echo "<p>✅ Created 'user_inventory_report' VIEW successfully.</p>";
} else {
    echo "<p>❌ Failed to create view: " . $conn->error . "</p>";
}

// Optional: Make the first user an admin for easy testing.
if ($conn->query("UPDATE users SET role = 'admin' ORDER BY id ASC LIMIT 1")) {
    echo "<p>✅ Set the first registered user as 'admin' for testing purposes.</p>";
}

echo "<hr><a href='AppPage/mycloset.html'>Return to MyFits</a>";
?>
