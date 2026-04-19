<?php

// Security Guard
require_once '../includes/session_guard.php';

// The "Smart Connector"
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // PHASE 1: UNPACK THE DATA

    $outfitDataString = isset($_POST['outfitData']) ? $_POST['outfitData'] : null;
    
    if($outfitDataString) {
        $data = json_decode($outfitDataString);
        $user_id = $_SESSION['user_id'];
        
        $id = !empty($data->id) ? $data->id : null;             // NULL = new outfit, NUMBER = editing existing
        $name = !empty($data->name) ? $data->name : 'Untitled Outfit';
        $top_id = !empty($data->top_id) ? $data->top_id : null;       // ID of the top clothing item
        $bottom_id = !empty($data->bottom_id) ? $data->bottom_id : null; // ID of the bottom clothing item
        $shoes_id = !empty($data->shoes_id) ? $data->shoes_id : null;   // ID of the shoes clothing item
        $season = !empty($data->season) ? $data->season : null;
        $occasion = !empty($data->occasion) ? $data->occasion : null;
        $color = !empty($data->color) ? $data->color : null;
        $status = !empty($data->status) ? $data->status : 'ready';

        // PHASE 2: DUPLICATE NAME CHECK

        $checkStmt = $conn->prepare("SELECT id FROM outfits WHERE user_id = ? AND name = ? AND id != ?");
        $checkId = $id ? $id : 0;  // Use 0 for new outfits (no ID to exclude yet)
        $checkStmt->bind_param("isi", $user_id, $name, $checkId);
        $checkStmt->execute();
        if ($checkStmt->get_result()->fetch_assoc()) {
            echo json_encode(["status" => 400, "message" => "Name already taken"]);
            exit();
        }
        $checkStmt->close();


        $conn->begin_transaction();

        try {
            if ($id) {
                $stmt = $conn->prepare("UPDATE outfits SET name=?, top_id=?, bottom_id=?, shoes_id=?, season=?, occasion=?, color=?, status=? WHERE id=? AND user_id=?");
                $stmt->bind_param("siiissssii", $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color, $status, $id, $user_id);
                $msg = "Outfit updated successfully!";
            } else {
                $stmt = $conn->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("isiiissss", $user_id, $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color, $status);
                $msg = "Outfit saved successfully!";
            }

            if (!$stmt->execute()) {
                throw new Exception("Error saving outfit: " . $stmt->error);
            }
            
            if (!$id) {
                $id = $conn->insert_id;
            }

            // PHASE 4: CALENDAR SCHEDULING
            if (!empty($data->scheduleDate)) {
                $scheduleDate = $data->scheduleDate;
                $repeatWeekly = !empty($data->repeatWeekly) ? 1 : 0;
                $recurrence_day = $repeatWeekly ? date('l', strtotime($scheduleDate)) : null;

                $schedStmt = $conn->prepare("INSERT INTO schedule (user_id, outfit_id, scheduled_date, is_recurring, recurrence_day) 
                                           VALUES (?, ?, ?, ?, ?) 
                                           ON DUPLICATE KEY UPDATE 
                                           scheduled_date=VALUES(scheduled_date), 
                                           is_recurring=VALUES(is_recurring), 
                                           recurrence_day=VALUES(recurrence_day)");
                if ($schedStmt) {
                    $schedStmt->bind_param("iisis", $user_id, $id, $scheduleDate, $repeatWeekly, $recurrence_day);
                    if (!$schedStmt->execute()) {
                         throw new Exception("Error saving schedule: " . $schedStmt->error);
                    }
                    $schedStmt->close();
                }
            }

            // PHASE 5: PREVIEW IMAGE SAVE
            if (!empty($data->preview_image)) {
                $imgData = $data->preview_image;
                if (strpos($imgData, ',') !== false) {
                    $imgData = explode(',', $imgData)[1];
                }
                $decoded = base64_decode($imgData);

                if ($decoded !== false) {
                    $filename = 'outfit_' . $id . '_' . time() . '.png';
                    $filepath = '../uploads/outfits/' . $filename;
                    
                    $oldStmt = $conn->prepare("SELECT preview_image FROM outfits WHERE id = ?");
                    $oldStmt->bind_param("i", $id);
                    $oldStmt->execute();
                    $oldResult = $oldStmt->get_result()->fetch_assoc();
                    $oldStmt->close();
                    if ($oldResult && $oldResult['preview_image']) {
                        $oldFile = '../' . $oldResult['preview_image'];
                        if (file_exists($oldFile)) unlink($oldFile);
                    }
                    
                    file_put_contents($filepath, $decoded);
                    $dbPath = 'uploads/outfits/' . $filename;
                    $imgStmt = $conn->prepare("UPDATE outfits SET preview_image = ? WHERE id = ?");
                    $imgStmt->bind_param("si", $dbPath, $id);
                    if (!$imgStmt->execute()) throw new Exception("Error saving image path.");
                    $imgStmt->close();
                }
            }

            // PHASE 6: CASCADING STATUS SYNC
            if ($status === 'laundry' || $status === 'ready') {
                $compStmt = $conn->prepare("UPDATE clothes SET status = ? WHERE id IN (?, ?) AND user_id = ?");
                $compStmt->bind_param("siii", $status, $top_id, $bottom_id, $user_id);
                if (!$compStmt->execute()) throw new Exception("Error syncing clothes status.");
                $compStmt->close();
            }

            // Commit the transaction since everything succeeded!
            $conn->commit();
            echo json_encode(["status" => 200, "message" => $msg]);

        } catch (Exception $e) {
            // Rollback the transaction if ANY query failed
            $conn->rollback();
            echo json_encode(["status" => 500, "message" => "Database transaction error: " . $e->getMessage()]);
        }
        
        if (isset($stmt)) $stmt->close();
    } else {
        echo json_encode(["status" => 400, "message" => "Missing outfit data."]);
    }
}
?>
