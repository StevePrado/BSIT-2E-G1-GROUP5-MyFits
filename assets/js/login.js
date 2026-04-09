

$(document).ready(function() {

    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };

        $.ajax({
            type: 'POST',
            url: '../backend/login_process.php',
            data: { formData: JSON.stringify(formData) },   // Pack as JSON string
            dataType: 'json',                                // Expect JSON back
            success: function(response) {
                if (response.status === 200) {
                    alert(response.message);
                    window.location.href = '../AppPage/mycloset.html';
                } else {
                    // Login failed
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
                alert("An error occurred connecting to the server.");
            }
        });
    });

    $('#togglePassword').click(function() {
        var pwd = $('#loginPassword');
        var icon = $('#toggleIcon');
        if (pwd.attr('type') === 'password') {
            pwd.attr('type', 'text');                                   // Show the password
            icon.removeClass('bi-eye').addClass('bi-eye-slash');        // Change icon to "eye-slash"
        } else {
            pwd.attr('type', 'password');                               // Hide the password
            icon.removeClass('bi-eye-slash').addClass('bi-eye');        // Change icon back to "eye"
        }
    });
});
