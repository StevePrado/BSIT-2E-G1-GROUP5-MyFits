

function submitSupportForm() {
    var email = $('#senderEmail').val();        // Auto-filled with user's name (read-only)
    var subject = $('#supportSubject').val();    // Dropdown: "Bug Report", "Feature Request", etc.
    var message = $('#supportMessageText').val(); // The user's detailed message

    if (!subject || !message) {
        $('#supportResponseMessage').css('color', 'red').html('Please fill out all required fields.');
        return;    // Stop here — don't send the request
    }

    var formData = {
        email: email,
        subject: subject,
        message: message
    };

    $.ajax({
        url: '../backend/support_process.php',
        type: 'POST',
        data: "formData=" + JSON.stringify(formData),
        success: function(response) {
            var resp = JSON.parse(response);
            
            if(resp.status == 200) {
                // Ticket submitted successfully
                $("#supportResponseMessage").css('color', 'green').html(resp.message);

                $('#supportSubject').val('');
                $('#supportMessageText').val('');
            } else {
                // Server returned an error
                $("#supportResponseMessage").css('color', 'red').html(resp.message);
            }
        },
        error: function() {
            // Server communication failed
            alert('An error occurred while submitting the ticket.');
        }
    });
}

// Fetches the logged
$(document).ready(function() {
    $.ajax({
        url: '../backend/get_session.php',       // The "ID Checker" backend
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 200) {
                $('#userNameDisplay').text(response.userName);
                // Auto
                $('#senderEmail').val(response.userName + " (" + response.userEmail + ")");
            }
        },
        error: function() {
            console.error('Failed to fetch user session.');
        }
    });
});