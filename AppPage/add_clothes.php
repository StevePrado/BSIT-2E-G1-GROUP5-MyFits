<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => 401, "message" => "Unauthorized. Please log in."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';
    $season = $_POST['season'] ?? '';
    $occasion = $_POST['occasion'] ?? '';
    $color = $_POST['color'] ?? '';
    
    if (empty($name) || empty($category) || !isset($_FILES['image'])) {
        echo json_encode(["status" => 400, "message" => "Name, category, and image are required."]);
        exit();
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(["status" => 400, "message" => "Invalid file type. Only JPG, PNG, and WebP are allowed."]);
        exit();
    }
    
    $uploadDir = '../images/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('cloth_') . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $dbPath = '../images/uploads/' . $filename;
        
        $stmt = $conn->prepare("INSERT INTO clothes (user_id, name, category, image, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssss", $user_id, $name, $category, $dbPath, $season, $occasion, $color);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => 200, 
                "message" => "Item added successfully!", 
                "item" => [
                    "id" => $conn->insert_id,
                    "name" => $name,
                    "category" => $category,
                    "image" => $dbPath,
                    "season" => $season,
                    "occasion" => $occasion,
                    "color" => $color,
                    "status" => "ready"
                ]
            ]);
        } else {
            unlink($targetPath);
            echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => 500, "message" => "Failed to move uploaded file."]);
    }
} else {
    echo json_encode(["status" => 405, "message" => "Method not allowed."]);
}
?>
