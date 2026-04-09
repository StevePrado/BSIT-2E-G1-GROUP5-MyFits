<?php

session_start();

// Loads the database connection
require_once '../includes/db_connect.php';

header('Content-Type: application/json');

$formDataString = isset($_POST['formData']) ? $_POST['formData'] : null;
$response = array();

if ($formDataString) {
    $formData = json_decode($formDataString);

    if (!empty($formData->firstName) && !empty($formData->lastName) && !empty($formData->email) && !empty($formData->password)) {
        
        // Server
        $pwd = $formData->password;
        if (strlen($pwd) < 8) {
            $response['message'] = "Password must be at least 8 characters long.";
            $response['status'] = 400;
            echo json_encode($response);
            exit();
        }
        if (!preg_match('/[A-Z]/', $pwd)) {
            $response['message'] = "Password must contain at least one uppercase letter.";
            $response['status'] = 400;
            echo json_encode($response);
            exit();
        }
        if (!preg_match('/[a-z]/', $pwd)) {
            $response['message'] = "Password must contain at least one lowercase letter.";
            $response['status'] = 400;
            echo json_encode($response);
            exit();
        }
        if (!preg_match('/[0-9]/', $pwd)) {
            $response['message'] = "Password must contain at least one number.";
            $response['status'] = 400;
            echo json_encode($response);
            exit();
        }
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $pwd)) {
            $response['message'] = "Password must contain at least one special character (!@#$%...).";
            $response['status'] = 400;
            echo json_encode($response);
            exit();
        }

        if ($formData->password !== $formData->confirmPassword) {
            $response['message'] = "Passwords do not match.";
            $response['status'] = 400;
        } else {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            if (!$stmt) {
                echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
                exit();
            }
            $stmt->bind_param("s", $formData->email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                $response['message'] = "Email is already registered.";
                $response['status'] = 400;
            } else {
                $hashed_password = password_hash($formData->password, PASSWORD_DEFAULT);

                $insert_stmt = $conn->prepare("INSERT INTO users (fname, lname, email, password) VALUES (?, ?, ?, ?)");
                if (!$insert_stmt) {
                    echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
                    exit();
                }
                $insert_stmt->bind_param("ssss", $formData->firstName, $formData->lastName, $formData->email, $hashed_password);
                
                if ($insert_stmt->execute()) {
                    // Account created successfully!
                    $response['message'] = "Account Created Successfully!";
                    $response['status'] = 200;
                } else {
                    $response['message'] = "Database error: " . $conn->error;
                    $response['status'] = 500;
                }
                $insert_stmt->close();
            }
            $stmt->close();
        }
        
        echo json_encode($response);
    } else {
        $response['message'] = "Please fill in all required fields.";
        $response['status'] = 400;
        echo json_encode($response);
    }
} else {
    $response['message'] = "No form data received.";
    $response['status'] = 400;
    echo json_encode($response);
}
