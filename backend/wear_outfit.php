<?php

//
//
//   Transitions:

// Security Guard
require_once '../includes/session_guard.php';

// Database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 405, "message" => "Method not allowed"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$schedule_id = isset($_POST['schedule_id']) ? intval($_POST['schedule_id']) : 0;
$scheduled_date = isset($_POST['scheduled_date']) ? $_POST['scheduled_date'] : ''; 
$action = isset($_POST['action']) ? $_POST['action'] : '';    // "wear", "laundry", or "undo"

if (!$schedule_id || !in_array($action, ['wear', 'laundry', 'undo'])) {
    echo json_encode(["status" => 400, "message" => "Missing schedule_id or invalid action."]);
    exit();
}

$stmt = $conn->prepare("SELECT s.*, o.top_id, o.bottom_id, o.shoes_id 
    FROM schedule s 
    JOIN outfits o ON s.outfit_id = o.id 
    WHERE s.id = ? AND s.user_id = ?");
$stmt->bind_param("ii", $schedule_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$schedule = $result->fetch_assoc();
$stmt->close();

// Verifies the schedule exists
if (!$schedule) {
    echo json_encode(["status" => 404, "message" => "Schedule not found."]);
    exit();
}

$outfit_id = $schedule['outfit_id'];
$target_id = $schedule_id;

/* --- PRESENTATION SCRIPT: TRANSACTIONS (ACID Properties) ---
 * WHAT IT IS: Database Transactions lock the database to ensure multiple queries succeed or fail together.
 * WHY IT IS LIKE THAT: Wearing an outfit requires us to update the Schedule, AND update the wear_count on the Top, 
 * Bottom, and Shoes. If we just ran basic queries, and the server crashed after updating the Top, our database 
 * would be permanently corrupted with mismatched numbers.
 * WHY IN PHP: PHP interfaces cleanly with MySQLi transactions using `begin_transaction()`. We wrap all our 
 * updates in a `try` block. If every single `UPDATE` succeeds, we call `commit()`. If ANY error happens, 
 * the `catch` block catches it and fires `rollback()`, reversing all partial updates perfectly.
 */
$conn->begin_transaction();

try {
    // SMART RECURRENCE LOGIC
    if ($schedule['is_recurring'] == 1 && $action !== 'undo') {
        if (empty($scheduled_date)) {
            throw new Exception("Date required for recurring items.");
        }
        
        $stmt = $conn->prepare("SELECT id FROM schedule WHERE user_id = ? AND outfit_id = ? AND scheduled_date = ? AND is_recurring = 0");
        $stmt->bind_param("iis", $user_id, $outfit_id, $scheduled_date);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($existing) {
            $target_id = $existing['id'];
        } else {
            $stmt = $conn->prepare("INSERT INTO schedule (user_id, outfit_id, scheduled_date, is_worn, is_recurring) VALUES (?, ?, ?, 1, 0)");
            $stmt->bind_param("iis", $user_id, $outfit_id, $scheduled_date);
            if (!$stmt->execute()) throw new Exception("Error inserting schedule exception.");
            $target_id = $conn->insert_id;
            $stmt->close();
        }
    }

    // STATE TRANSITIONS
    if ($action === 'wear') {
        $stmt = $conn->prepare("UPDATE schedule SET is_worn = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $target_id, $user_id);
        if (!$stmt->execute()) throw new Exception("Error updating schedule status.");
        $stmt->close();
        
        // --- TRACK WEAR FREQUENCY ---
        // Increment wear_count for the clothing items attached to this outfit
        $clothIds = [];
        if ($schedule['top_id']) $clothIds[] = $schedule['top_id'];
        if ($schedule['bottom_id']) $clothIds[] = $schedule['bottom_id'];
        if ($schedule['shoes_id']) $clothIds[] = $schedule['shoes_id'];

        if (count($clothIds) > 0) {
            $placeholders = implode(',', array_fill(0, count($clothIds), '?'));
            $types = str_repeat('i', count($clothIds));
            $stmt = $conn->prepare("UPDATE clothes SET wear_count = wear_count + 1, last_worn = CURRENT_DATE() WHERE id IN ($placeholders) AND user_id = ?");
            $clothIds[] = $user_id;
            $types .= 'i';
            $stmt->bind_param($types, ...$clothIds);
            if (!$stmt->execute()) throw new Exception("Error updating wear frequency.");
            $stmt->close();
        }
        // ----------------------------
        
        $conn->commit();
        echo json_encode(["status" => 200, "message" => "Outfit marked as worn!", "new_state" => 1]);

    } else if ($action === 'laundry') {
        $stmt = $conn->prepare("UPDATE schedule SET is_worn = 2 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $target_id, $user_id);
        if (!$stmt->execute()) throw new Exception("Error updating schedule status.");
        $stmt->close();

        $clothIds = [];
        if ($schedule['top_id']) $clothIds[] = $schedule['top_id'];
        if ($schedule['bottom_id']) $clothIds[] = $schedule['bottom_id'];
        // Shoes purposefully excluded from automatic laundry
        
        if (count($clothIds) > 0) {
            $placeholders = implode(',', array_fill(0, count($clothIds), '?'));
            $types = str_repeat('i', count($clothIds));
            $stmt = $conn->prepare("UPDATE clothes SET status = 'laundry' WHERE id IN ($placeholders) AND user_id = ?");
            $clothIds[] = $user_id;
            $types .= 'i';
            $stmt->bind_param($types, ...$clothIds);
            if (!$stmt->execute()) throw new Exception("Error syncing clothes to laundry.");
            $stmt->close();
        }

        $stmt = $conn->prepare("UPDATE outfits SET status = 'laundry' WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $outfit_id, $user_id);
        if (!$stmt->execute()) throw new Exception("Error syncing outfit to laundry.");
        $stmt->close();

        // EXECUTE COMMIT: If the script reaches this line without throwing any Exceptions, the transaction was 100% successful.
        // WHY IT IS THERE: This securely locks all the separate schedule and clothing updates into the MySQL database permanently together.
        $conn->commit();
        echo json_encode(["status" => 200, "message" => "Outfit sent to laundry!", "new_state" => 2]);

    } else if ($action === 'undo') {
        $current_state = intval($schedule['is_worn']);

        if ($current_state == 2) {
            $new_state = 1;
            $stmt = $conn->prepare("UPDATE schedule SET is_worn = 1 WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $schedule_id, $user_id);
            if (!$stmt->execute()) throw new Exception("Error reverting schedule.");
            $stmt->close();

            $clothIds = [];
            if ($schedule['top_id']) $clothIds[] = $schedule['top_id'];
            if ($schedule['bottom_id']) $clothIds[] = $schedule['bottom_id'];
            // Shoes do not automatically come out of laundry on undo

            if (count($clothIds) > 0) {
                $placeholders = implode(',', array_fill(0, count($clothIds), '?'));
                $types = str_repeat('i', count($clothIds));
                $stmt = $conn->prepare("UPDATE clothes SET status = 'available' WHERE id IN ($placeholders) AND user_id = ?");
                $clothIds[] = $user_id;
                $types .= 'i';
                $stmt->bind_param($types, ...$clothIds);
                if (!$stmt->execute()) throw new Exception("Error reverting clothes status.");
                $stmt->close();
            }

            $stmt = $conn->prepare("UPDATE outfits SET status = 'ready' WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $outfit_id, $user_id);
            if (!$stmt->execute()) throw new Exception("Error reverting outfit status.");
            $stmt->close();

            $conn->commit();
            echo json_encode(["status" => 200, "message" => "Reverted to 'Worn' state.", "new_state" => 1]);

        } else if ($current_state == 1) {
            $new_state = 0;
            $stmt = $conn->prepare("UPDATE schedule SET is_worn = 0 WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $schedule_id, $user_id);
            if (!$stmt->execute()) throw new Exception("Error reverting schedule.");
            $stmt->close();
            
            $conn->commit();
            echo json_encode(["status" => 200, "message" => "Reverted to default.", "new_state" => 0]);

        } else {
            $conn->commit(); // Just commit the NO-OP
            echo json_encode(["status" => 200, "message" => "Already at default state.", "new_state" => 0]);
        }
    }
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Date required') !== false) {
        // Validation error, not a DB crash, we don't return 500
        $conn->rollback();
        echo json_encode(["status" => 400, "message" => $e->getMessage()]);
    } else {
        // EXECUTE ROLLBACK: If ANY error occurred in the massive transaction block above, reverse everything!
        // WHY IT IS THERE: This prevents data corruption. If the Top was updated but the Bottom wasn't, rollback() magically erases the partial Top update so inventory stays mathematically perfect.
        $conn->rollback();
        echo json_encode(["status" => 500, "message" => "Transaction error: " . $e->getMessage()]);
    }
}
?>
