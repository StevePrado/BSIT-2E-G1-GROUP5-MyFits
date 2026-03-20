<?php

    if (isset($_POST['formData'])) {
        $formData = json_decode($_POST['formData']);
        $response = array();

        if (!empty($formData->subject) && !empty($formData->message)) {

            
            $response['message'] = "Support Ticket Submitted Successfully! We will review your " . htmlspecialchars($formData->subject) . ".";
            $response['status'] = 200;
        } else {
            $response['message'] = "Please fill out all required fields.";
            $response['status'] = 400;
        }

        echo json_encode($response);
    } else {
        echo json_encode(['message' => 'No data received', 'status' => 400]);
    }
?>

