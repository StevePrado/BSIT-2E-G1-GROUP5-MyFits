<?php

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

/* --- PRESENTATION SCRIPT: ROLES AND SECURITY ---
 * WHAT IT IS: This block implements strict Role-Based Access Control (RBAC). 
 * WHY IT IS LIKE THAT: Even if a normal user finds out the URL path to this API endpoint (`get_report.php`), 
 * they cannot run it. The database `users` table has a `role` ENUM column. The script checks it first.
 * WHY IN PHP: If we verified roles using Javascript, the user could simply hit F12 and bypass the check. 
 * Because it is done securely on the PHP backend, if their role is not strictly 'admin', we forcefully 
 * `exit()` the script and return a 403 Forbidden status.
 */
// GET SESSION ID: First, we pull the user_id securely from the active PHP session environment.
$user_id = $_SESSION['user_id'];

// PREPARE STATEMENT: Set up a secure SQL query to target the 'role' column in the users table.
$roleStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");

// BIND PARAMETER: Bind the session user_id to the question mark safely to prevent SQL Injection over the wire.
$roleStmt->bind_param("i", $user_id);

// EXECUTE QUERY: Execute the compiled statement directly against the relational database engine.
$roleStmt->execute();

// FETCH RESULT: Extract the returned row into an associative PHP array so we can parse the role string.
$roleResult = $roleStmt->get_result()->fetch_assoc();
$roleStmt->close();

// VERIFY ROLE (ACCESS CONTROL): If the user database row doesn't exist, OR their role is anything other than strictly 'admin'...
if (!$roleResult || $roleResult['role'] !== 'admin') {
    // DROP EXECUTION: Stop the PHP script immediately using exit() and throw a 403 Forbidden error protocol.
    // WHY IT'S THERE: This is strict server-side RBAC. It mathematically prevents normal users from tampering to access Admin reports.
    echo json_encode(["status" => 403, "message" => "Access Denied: You do not have administrator privileges to view this report."]);
    exit();
}

/* --- PRESENTATION SCRIPT: MATERIALIZED VIEWS ---
 * WHAT IT IS: A MySQL View is a virtual table that updates dynamically based on predefined SELECT logic.
 * WHY IT IS LIKE THAT: Generating a system-wide report requires massive, complex `JOIN` math and `COUNT()` operations. 
 * Instead of forcing PHP to do this heavy lifting and slowing down our API, we created a native View 
 * (`user_inventory_report`) inside the database engine.
 * WHY IN PHP / WHY CONVENIENT: As you can see, our PHP code is incredibly short. We do not have to write a single 
 * JOIN keyword here. We simply query the View exactly as if it were a normal table (`SELECT * FROM user_inventory_report`). 
 * The database engine handles the complex math behind the scenes.
 */

// EXECUTE QUERY: Because we built a MySQL View, we don't write any complex JOIN statements or math operations here.
// WHY IT'S THERE: The database engine handles the aggregration logic remotely. Our PHP is simply pulling from the pre-calculated 'user_inventory_report' table view structure.
$query = "SELECT * FROM user_inventory_report";
$result = $conn->query($query);

$reportData = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $reportData[] = $row;
    }
    echo json_encode(["status" => 200, "data" => $reportData]);
} else {
    echo json_encode(["status" => 500, "message" => "Failed to generate report from view. Make sure you ran the advanced migration!"]);
}
?>
