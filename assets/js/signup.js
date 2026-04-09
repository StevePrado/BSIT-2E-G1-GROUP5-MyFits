

$(document).ready(function() {

    const passwordRules = [
        { id: 'rule-length',    regex: /.{8,}/,           label: 'At least 8 characters' },
        { id: 'rule-uppercase', regex: /[A-Z]/,            label: 'One uppercase letter' },
        { id: 'rule-lowercase', regex: /[a-z]/,            label: 'One lowercase letter' },
        { id: 'rule-number',    regex: /[0-9]/,            label: 'One number' },
        { id: 'rule-special',   regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: 'One special character (!@#$%...)' }
    ];

    const reqHtml = '<div id="passwordRequirements" class="mt-2" style="font-size: 0.75rem; line-height: 1.8;">' +
        passwordRules.map(r => `<div id="${r.id}" style="color: #bbb;"><i class="bi bi-x-circle-fill me-1"></i>${r.label}</div>`).join('') +
        '</div>';
    $('#signupPassword').closest('.position-relative').after(reqHtml);

    // Real
    $('#signupPassword').on('input', function() {
        const val = $(this).val();
        let allPassed = true;
        passwordRules.forEach(rule => {
            const $el = $('#' + rule.id);
            if (rule.regex.test(val)) {
                $el.css('color', '#198754');
                $el.find('i').removeClass('bi-x-circle-fill').addClass('bi-check-circle-fill');
            } else {
                $el.css('color', '#dc3545');
                $el.find('i').removeClass('bi-check-circle-fill').addClass('bi-x-circle-fill');
                allPassed = false;
            }
        });
    });

    $('#signupForm').on('submit', function(e) {
        e.preventDefault();
        
        const password = $('#signupPassword').val();
        const confirmPassword = $('#signupConfirm').val();

        let allPassed = true;
        passwordRules.forEach(rule => {
            if (!rule.regex.test(password)) allPassed = false;
        });

        if (!allPassed) {
            alert('Your password does not meet the security requirements. Please check the checklist below the password field.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const formData = {
            firstName: $('#signupFirst').val(),
            lastName: $('#signupLast').val(),
            email: $('#signupEmail').val(),
            password: password,
            confirmPassword: confirmPassword
        };

        $.ajax({
            type: 'POST',
            url: '../backend/signup_process.php',
            data: { formData: JSON.stringify(formData) },
            dataType: 'json',
            success: function(response) {
                if (response.status === 200) {
                    alert(response.message);
                    window.location.href = 'login.html';
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
                alert("An error occurred connecting to the server.");
            }
        });
    });

    function togglePasswordField(inputSelector, iconSelector) {
        var input = document.querySelector(inputSelector);
        var icon = document.querySelector(iconSelector);
        if (!input || !icon) {
            return;
        }

        if (input.type === 'password') {
            input.type = 'text';        // Show password
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        } else {
            input.type = 'password';    // Hide password
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        }
    }

    $(document).on('click', '#toggleSignupPassword', function(e) {
        e.preventDefault();
        togglePasswordField('#signupPassword', '#toggleSignupIcon');
    });

    $(document).on('click', '#toggleConfirmPassword', function(e) {
        e.preventDefault();
        togglePasswordField('#signupConfirm', '#toggleConfirmIcon');
    });
});
