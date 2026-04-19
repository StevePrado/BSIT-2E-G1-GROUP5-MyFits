<?php

require_once '../includes/session_guard.php';

// Loads the database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Grabs the logged
    $user_id = $_SESSION['user_id'];
    $name = $_POST['name'] ?? '';           // ex.Black Hoodie
    $category = $_POST['category'] ?? '';   // top bottom, or shoes
    $season = $_POST['season'] ?? '';       // ex. winter, all-season
    $occasion = $_POST['occasion'] ?? '';   // ex. casual, formal
    $color = $_POST['color'] ?? '';         // ex. black, blue
    
    if (empty($name) || empty($category) || !isset($_FILES['image'])) {
        echo json_encode(["status" => 400, "message" => "Name, category, and image are required."]);
        exit();
    }

    $checkStmt = $conn->prepare("SELECT id FROM clothes WHERE user_id = ? AND name = ?");
    $checkStmt->bind_param("is", $user_id, $name);
    $checkStmt->execute();
    if ($checkStmt->get_result()->fetch_assoc()) {
        echo json_encode(["status" => 400, "message" => "Name already taken"]);
        exit();
    }
    $checkStmt->close();

    $file = $_FILES['image'];

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(["status" => 400, "message" => "Invalid file type. Only JPG, PNG, and WebP are allowed."]);
        exit();
    }
    
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('cloth_') . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $dbPath = '../uploads/' . $filename;
        
        /* --- PRESENTATION SCRIPT: CRUD (CREATE) ---
         * WHAT IT IS: This is the 'C' in CRUD. We are Inserting a new clothing item.
         * WHY IT IS LIKE THAT: Instead of putting raw variables directly into the SQL string (which is dangerous), 
         * we use `prepare()` with question marks (?). This is called a Prepared Statement.
         * WHY IN PHP: If we did this on the front-end in JavaScript, hackers could see our database structure 
         * and manipulate variables. PHP runs securely on the back-end (server-side), allowing us to safely 
         * `bind_param()` the data without exposing our database to SQL Injection attacks. It is mathematically safer.
         */
        $stmt = $conn->prepare("INSERT INTO clothes (user_id, name, category, image, season, occasion, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssss", $user_id, $name, $category, $dbPath, $season, $occasion, $color);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => 200, 
                "message" => "Item added successfully!", 
                "item" => [
                    "id" => $conn->insert_id,     // The new database ID
                    "name" => $name,
                    "category" => $category,
                    "image" => $dbPath,
                    "season" => $season,
                    "occasion" => $occasion,
                    "color" => $color,
                    "status" => "ready"           // New items always start as "ready to wear"
                ]
            ]);
        } else {
            // Database insert failed
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
