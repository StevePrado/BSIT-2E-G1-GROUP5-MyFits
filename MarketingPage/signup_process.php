<?php
    $formDataString = isset($_POST['formData']) ? $_POST['formData'] : null;
    $response = array();

    if ($formDataString) {
        $formData = json_decode($formDataString);

        if (!empty($formData->firstName) && !empty($formData->lastName) && !empty($formData->email) && !empty($formData->password)) {
            
            if ($formData->password !== $formData->confirmPassword) {
                $response['message'] = "Passwords do not match.";
                $response['status'] = 400;
            } else {
                $response['message'] = "Account Created Successfully!";
                $response['status'] = 200;
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
?>

