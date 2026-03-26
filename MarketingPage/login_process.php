<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

$formDataString = isset($_POST['formData']) ? $_POST['formData'] : null;
$response = array();

if ($formDataString) {
    $formData = json_decode($formDataString);

    if (!empty($formData->email) && !empty($formData->password)) {
        $stmt = $conn->prepare("SELECT id, fname, password FROM users WHERE email = ?");
        if (!$stmt) {
            echo json_encode(["status" => 500, "message" => "Database error: " . $conn->error]);
            exit();
        }
        $stmt->bind_param("s", $formData->email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (password_verify($formData->password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['user_name'] = $row['fname'];
                
                $response['message'] = "Successfully Logged In";
                $response['status'] = 200;
            } else {
                $response['message'] = "Invalid Password.";
                $response['status'] = 401;
            }
        } else {
            $response['message'] = "No account found with that email.";
            $response['status'] = 404;
        }
        $stmt->close();
    } else {
        $response['message'] = "Please enter both email and password.";
        $response['status'] = 400;
    }
    
    echo json_encode($response);
} else {
    $response['message'] = "No form data received.";
    $response['status'] = 400;
    echo json_encode($response);
}
