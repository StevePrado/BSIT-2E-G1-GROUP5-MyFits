<?php
    $formDataString = isset($_POST['formData']) ? $_POST['formData'] : null;
    $response = array();

    if ($formDataString) {
        $formData = json_decode($formDataString);

        if (!empty($formData->email)) {
            if ($formData->email === "MyFit@gmail.com") {
                $response['message'] = "Password reset link sent to your email.";
                $response['status'] = 200;
            } else {
                $response['message'] = "Email not found in our system.";
                $response['status'] = 404;
            }
            echo json_encode($response);
        } else {
            $response['message'] = "Please provide an email address.";
            $response['status'] = 400;
            echo json_encode($response);
        }
    } else {
        $response['message'] = "No form data received.";
        $response['status'] = 400;
        echo json_encode($response);
    }
?>

