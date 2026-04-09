

$(document).ready(function() {

    $('#forgotForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            email: $('#forgotEmail').val()
        };

        $.ajax({
            type: 'POST',
            url: '../backend/forgot_process.php',
            data: { formData: JSON.stringify(formData) },
            dataType: 'json',
            success: function(response) {
                if (response.status === 200) {
                    // Reset link "sent"
                    alert(response.message);
                    window.location.href = 'login.html';
                } else {
                    // Email not found
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                // Server communication failed
                console.error(error);
                alert("An error occurred connecting to the server.");
            }
        });
    });
});
