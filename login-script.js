// Initialize users array in localStorage if it doesn't exist
if (!localStorage.getItem('registeredUsers')) {
    const defaultUsers = [
        {
            email: 'admin@student.com',
            password: 'admin123',
            name: 'Admin User'
        },
        {
            email: 'student@example.com',
            password: 'student123',
            name: 'Test Student'
        }
    ];
    localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
}

// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById('loginFormContainer');
    const signupForm = document.getElementById('signupFormContainer');
    
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    
    // Clear any error messages
    clearMessages();
}

// Continue as guest
function continueAsGuest() {
    sessionStorage.setItem('isGuest', 'true');
    window.location.href = 'index.html';
}

// Handle Login Form
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
        showError('loginForm', 'Please fill in all fields');
        return;
    }

    if (authenticateUser(email, password)) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('isLoggedIn', 'true');
        storage.setItem('userEmail', email);

        // Get user name
        const users = JSON.parse(localStorage.getItem('registeredUsers'));
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            storage.setItem('userName', user.name);
        }

        showSuccess('loginForm', 'Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showError('loginForm', 'Invalid email or password');
    }
});

// Handle Signup Form
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('signupForm', 'Please fill in all fields');
        return;
    }

    if (!agreeTerms) {
        showError('signupForm', 'Please agree to the Terms & Conditions');
        return;
    }

    if (password.length < 6) {
        showError('signupForm', 'Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showError('signupForm', 'Passwords do not match');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('registeredUsers'));
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showError('signupForm', 'Email already registered. Please login.');
        return;
    }

    // Register new user
    users.push({ email, password, name });
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    showSuccess('signupForm', 'Registration successful! Redirecting to login...');
    
    setTimeout(() => {
        toggleForms();
        document.getElementById('loginEmail').value = email;
        clearMessages();
    }, 1500);
});

// Authenticate user
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('registeredUsers'));
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );
    return user !== undefined;
}

// Show error message
function showError(formId, message) {
    const form = document.getElementById(formId);
    let errorDiv = form.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        form.insertBefore(errorDiv, form.firstChild);
    }

    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.add('show');

    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 3000);
}

// Show success message
function showSuccess(formId, message) {
    const form = document.getElementById(formId);
    let successDiv = form.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.insertBefore(successDiv, form.firstChild);
    }

    successDiv.textContent = '✅ ' + message;
    successDiv.classList.add('show');
}

// Clear all messages
function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.classList.remove('show');
    });
}

// Auto-fill email if remembered
window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});
