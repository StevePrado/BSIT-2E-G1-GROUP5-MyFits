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
        
        if ($id) {
            $stmt = $conn->prepare("UPDATE outfits SET name=?, top_id=?, bottom_id=?, shoes_id=?, season=?, occasion=?, color=? WHERE id=? AND user_id=?");
            $stmt->bind_param("siiisssii", $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color, $id, $user_id);
            $msg = "Outfit updated successfully!";
        } else {
            $stmt = $conn->prepare("INSERT INTO outfits (user_id, name, top_id, bottom_id, shoes_id, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isiiisss", $user_id, $name, $top_id, $bottom_id, $shoes_id, $season, $occasion, $color);
            $msg = "Outfit saved successfully!";
        }

        if ($stmt->execute()) {
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
