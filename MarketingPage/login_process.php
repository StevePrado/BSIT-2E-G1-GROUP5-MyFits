<?php

    $email = "MyFits@gmail.com";
    $password = password_hash("myfits123", PASSWORD_DEFAULT);

    $formDataString = isset($_POST['formData']) ? $_POST['formData'] : null;
    $response = array();

    if ($formDataString) {
        $formData = json_decode($formDataString);

        if ($formData->email === $email && password_verify($formData->password, $password)) {
            session_start();
            $_SESSION['user_name'] = "Reign";
            
            $response['message'] = "Successfully Logged In";
            $response['status'] = 200;

            echo json_encode($response);
        } else {
            $response['message'] = "Invalid Email or Password";
            $response['status'] = 401;
            echo json_encode($response);
        }
    } else {
        $response['message'] = "No form data received.";
        $response['status'] = 400;
        echo json_encode($response);
    }
?>

