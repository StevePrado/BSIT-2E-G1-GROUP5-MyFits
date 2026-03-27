<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized. Please log in."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $outfitDataString = isset($_POST['outfitData']) ? $_POST['outfitData'] : null;
    
    if($outfitDataString) {
        $data = json_decode($outfitDataString);
        $user_id = $_SESSION['user_id'];
        
        $id = !empty($data->id) ? $data->id : null;
        $name = !empty($data->name) ? $data->name : 'Untitled Outfit';
        $top_id = !empty($data->top_id) ? $data->top_id : null;
        $bottom_id = !empty($data->bottom_id) ? $data->bottom_id : null;
        $shoes_id = !empty($data->shoes_id) ? $data->shoes_id : null;
        $season = !empty($data->season) ? $data->season : null;
        $occasion = !empty($data->occasion) ? $data->occasion : null;
        $color = !empty($data->color) ? $data->color : null;
        $status = !empty($data->status) ? $data->status : 'ready';
        
        if ($id) {
            $stmt = $conn->prepare("UPDATE outfits SET name=?, top_id=?, bottom_id=?, shoes_id=?, season=?, occasion=?, color=?, status=? WHERE id=? AND user_id=?");
            $stmt->bind_param("siiissssii", $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color, $status, $id, $user_id);
            $msg = "Outfit updated successfully!";
        } else {
            $stmt = $conn->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isiiissss", $user_id, $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color, $status);
            $msg = "Outfit saved successfully!";
        }

        if ($stmt->execute()) {
            if (!$id) {
                $id = $conn->insert_id;
            }
            if (!empty($data->scheduleDate)) {
                $scheduleDate = $data->scheduleDate;
                $repeatWeekly = !empty($data->repeatWeekly) ? 1 : 0;
                $recurrence_day = $repeatWeekly ? date('l', strtotime($scheduleDate)) : null;

                // Insert/Update the primary schedule entry (Single Row)
                $schedStmt = $conn->prepare("INSERT INTO schedule (user_id, outfit_id, scheduled_date, is_recurring, recurrence_day) 
                                           VALUES (?, ?, ?, ?, ?) 
                                           ON DUPLICATE KEY UPDATE 
                                           scheduled_date=VALUES(scheduled_date), 
                                           is_recurring=VALUES(is_recurring), 
                                           recurrence_day=VALUES(recurrence_day)");
                
                if ($schedStmt) {
                    $schedStmt->bind_param("iisis", $user_id, $id, $scheduleDate, $repeatWeekly, $recurrence_day);
                    $schedStmt->execute();
                    $schedStmt->close();
                }
            }

            echo json_encode(["status" => 200, "message" => $msg]);
        } else {
            echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => 400, "message" => "Missing outfit data."]);
    }
}
?>
