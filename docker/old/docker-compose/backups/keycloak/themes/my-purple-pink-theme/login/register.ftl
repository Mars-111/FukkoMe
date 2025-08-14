<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Create Account - FUKO</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
            background: #0a0a0a;
        }

        /* Animated Gradient Background */
        .animated-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            background: linear-gradient(-45deg, 
                #1a0b2e, 
                #16213e, 
                #0f3460, 
                #533a7d, 
                #4c1d95, 
                #1e1b4b);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Floating particles */
        .floating-particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 50%;
            animation: float 8s ease-in-out infinite;
        }

        .particle:nth-child(1) {
            width: 60px;
            height: 60px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
            background: rgba(147, 51, 234, 0.15);
        }

        .particle:nth-child(2) {
            width: 80px;
            height: 80px;
            top: 60%;
            right: 15%;
            animation-delay: 2s;
            background: rgba(219, 39, 119, 0.12);
        }

        .particle:nth-child(3) {
            width: 40px;
            height: 40px;
            bottom: 30%;
            left: 20%;
            animation-delay: 4s;
            background: rgba(59, 130, 246, 0.1);
        }

        .particle:nth-child(4) {
            width: 100px;
            height: 100px;
            top: 10%;
            right: 30%;
            animation-delay: 1s;
            background: rgba(168, 85, 247, 0.08);
        }

        .particle:nth-child(5) {
            width: 50px;
            height: 50px;
            bottom: 20%;
            right: 40%;
            animation-delay: 3s;
            background: rgba(236, 72, 153, 0.1);
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
                opacity: 0.1;
            }
            33% {
                transform: translateY(-30px) translateX(10px) rotate(120deg);
                opacity: 0.3;
            }
            66% {
                transform: translateY(20px) translateX(-10px) rotate(240deg);
                opacity: 0.2;
            }
        }

        /* Language Selector */
        .language-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .language-selector select {
            background: rgba(30, 27, 75, 0.9);
            color: white;
            border: 2px solid rgba(147, 51, 234, 0.5);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            transition: all 0.3s ease;
        }

        .language-selector select:hover {
            border-color: rgba(168, 85, 247, 1);
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }

        .language-selector option {
            background: rgba(30, 27, 75, 1);
            color: white;
        }

        /* Main Container */
        .register-container {
            background: linear-gradient(135deg, 
                rgba(30, 27, 75, 0.95), 
                rgba(76, 29, 149, 0.9),
                rgba(139, 92, 246, 0.85));
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 0;
            border-radius: 24px;
            border: 1px solid rgba(168, 85, 247, 0.2);
            box-shadow: 
                0 32px 64px -12px rgba(0, 0, 0, 0.6),
                0 0 60px rgba(147, 51, 234, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            width: 100%;
            max-width: 900px;
            min-height: 600px;
            animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            display: flex;
        }

        .register-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.8), transparent);
        }

        @keyframes slideInUp {
            from { 
                opacity: 0; 
                transform: translateY(50px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }

        /* Left Section - Brand Info */
        .brand-section {
            flex: 1;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, 
                rgba(147, 51, 234, 0.2), 
                rgba(168, 85, 247, 0.15),
                rgba(219, 39, 119, 0.1));
            position: relative;
        }

        .brand-section::after {
            content: '';
            position: absolute;
            right: 0;
            top: 10%;
            bottom: 10%;
            width: 1px;
            background: linear-gradient(to bottom, 
                transparent, 
                rgba(168, 85, 247, 0.4), 
                transparent);
        }

        .brand-title {
            font-size: 4rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ffffff, #e0e7ff, #c7d2fe, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            letter-spacing: 4px;
            text-shadow: 0 0 40px rgba(168, 85, 247, 0.5);
        }

        .brand-subtitle {
            font-size: 1.2rem;
            color: rgba(225, 239, 254, 0.9);
            font-weight: 300;
            margin-bottom: 15px;
            line-height: 1.6;
            display: none;
        }

        .brand-message {
            font-size: 1.4rem;
            color: #ffffff;
            font-weight: 600;
            font-style: normal;
            opacity: 1;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
        }

        /* Right Section - Form */
        .form-section {
            flex: 1;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
        }

        /* Error Messages */
        .error-message {
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(239, 68, 68, 0.8));
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            color: white;
            text-align: center;
            border: 1px solid rgba(248, 113, 113, 0.3);
            font-size: 14px;
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        /* Form Styles */
        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 10px;
            color: rgba(225, 239, 254, 0.95);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        input[type=text], 
        input[type=email], 
        input[type=password] {
            width: 100%;
            padding: 16px 18px;
            border: 2px solid rgba(168, 85, 247, 0.3);
            border-radius: 14px;
            outline: none;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.95);
            color: #1e1b4b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
        }

        input[type=text]:focus, 
        input[type=email]:focus, 
        input[type=password]:focus {
            border-color: rgba(168, 85, 247, 1);
            background: rgba(255, 255, 255, 1);
            box-shadow: 
                0 0 0 3px rgba(168, 85, 247, 0.2),
                0 12px 30px -5px rgba(147, 51, 234, 0.3);
            transform: translateY(-2px);
        }

        input[type=text]:hover, 
        input[type=email]:hover, 
        input[type=password]:hover {
            border-color: rgba(168, 85, 247, 0.6);
        }

        /* Button Styles */
        .submit-button {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9);
            border: none;
            padding: 18px 28px;
            width: 100%;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 12px 30px -5px rgba(139, 92, 246, 0.4);
            position: relative;
            overflow: hidden;
        }

        .submit-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .submit-button:hover::before {
            left: 100%;
        }

        .submit-button:hover {
            background: linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6);
            transform: translateY(-3px);
            box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.6);
        }

        .submit-button:active {
            transform: translateY(-1px);
        }

        /* Back to Login Link */
        .back-to-login {
            text-align: center;
            margin-top: 25px;
        }

        .back-to-login a {
            color: rgba(168, 85, 247, 1);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            border-bottom: 1px solid transparent;
        }

        .back-to-login a:hover {
            color: white;
            border-bottom-color: rgba(168, 85, 247, 0.7);
            text-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
        }

        /* Error Message Styles */
        .input-error {
            color: #fca5a5;
            font-size: 12px;
            margin-top: 6px;
            display: block;
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
            .register-container {
                flex-direction: column;
                margin: 20px;
                max-width: none;
                min-height: auto;
            }

            .brand-section {
                padding: 40px 30px 30px;
                order: 1;
            }

            .brand-section::after {
                display: none;
            }

            .brand-section::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 10%;
                right: 10%;
                height: 1px;
                background: linear-gradient(to right, 
                    transparent, 
                    rgba(168, 85, 247, 0.4), 
                    transparent);
            }

            .brand-title {
                font-size: 2.8rem;
                letter-spacing: 2px;
            }

            .brand-subtitle {
                font-size: 1rem;
            }

            .brand-message {
                font-size: 1.1rem;
            }

            .form-section {
                padding: 30px;
                order: 2;
            }

            h2 {
                font-size: 1.5rem;
                margin-bottom: 25px;
            }

            .language-selector {
                top: 15px;
                right: 15px;
            }
        }

        @media (max-width: 480px) {
            .register-container {
                margin: 15px;
            }

            .brand-section,
            .form-section {
                padding: 25px 20px;
            }

            .brand-title {
                font-size: 2.2rem;
            }

            .form-group {
                margin-bottom: 20px;
            }

            input[type=text], 
            input[type=email], 
            input[type=password] {
                padding: 14px 16px;
                font-size: 15px;
            }

            .submit-button {
                padding: 16px 24px;
                font-size: 15px;
            }
        }

        /* Desktop Large Screens */
        @media (min-width: 1200px) {
            .register-container {
                max-width: 1000px;
            }

            .brand-title {
                font-size: 4.5rem;
            }

            .brand-section,
            .form-section {
                padding: 80px 50px;
            }
        }
    </style>
</head>
<body>
    <!-- Animated Background -->
    <div class="animated-background"></div>

    <!-- Floating Particles -->
    <div class="floating-particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>

    <!-- Language Selector -->
    <div class="language-selector">
        <select id="languageSelect" onchange="changeLanguage()">
            <option value="en">English</option>
            <option value="ru">Русский</option>
        </select>
    </div>

    <div class="register-container">
        <!-- Left Section - Brand Info -->
        <div class="brand-section">
            <div class="brand-title">FUKO</div>
            <div class="brand-message" id="brandMessage">You made the right choice</div>
        </div>

        <!-- Right Section - Registration Form -->
        <div class="form-section">
            <h2 id="registerTitle">Create Account</h2>

            <div class="error-message" style="display: none;" id="errorMessage">
                Registration failed. Please try again.
            </div>

            <form id="kc-register-form" action="#" method="post">
                <div class="form-group">
                    <label for="username" id="usernameLabel">Username</label>
                    <input tabindex="1" id="username" name="username" type="text"
                           autocomplete="username" required 
                           placeholder="Enter your username" />
                    <span id="input-error-username" class="input-error" style="display: none;">
                        Username is required
                    </span>
                </div>

                <div class="form-group">
                    <label for="email" id="emailLabel">Email Address</label>
                    <input tabindex="2" id="email" name="email" type="email"
                           autocomplete="email" required 
                           placeholder="Enter your email address" />
                    <span id="input-error-email" class="input-error" style="display: none;">
                        Valid email is required
                    </span>
                </div>

                <div class="form-group">
                    <label for="password" id="passwordLabel">Password</label>
                    <input tabindex="3" id="password" name="password"
                           type="password" autocomplete="new-password" required 
                           placeholder="Create a secure password" />
                    <span id="input-error-password" class="input-error" style="display: none;">
                        Password is required
                    </span>
                </div>

                <div class="form-group">
                    <label for="password-confirm" id="passwordConfirmLabel">Confirm Password</label>
                    <input tabindex="4" id="password-confirm" name="password-confirm"
                           type="password" autocomplete="new-password" required 
                           placeholder="Confirm your password" />
                    <span id="input-error-password-confirm" class="input-error" style="display: none;">
                        Passwords do not match
                    </span>
                </div>

                <div class="form-group">
                    <input class="submit-button" type="submit" value="Create Account" id="submitButton"/>
                </div>

                <div class="back-to-login">
                    <a href="#" id="backToLoginLink">← Back to Login</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Language translations
        const translations = {
            en: {
                brandSubtitle: "",
                brandMessage: "You made the right choice",
                registerTitle: "Create Account",
                username: "Username",
                email: "Email Address",
                password: "Password",
                passwordConfirm: "Confirm Password",
                doRegister: "Create Account",
                backToLogin: "← Back to Login",
                usernamePlaceholder: "Enter your username",
                emailPlaceholder: "Enter your email address",
                passwordPlaceholder: "Create a secure password", 
                passwordConfirmPlaceholder: "Confirm your password",
                registering: "Creating Account..."
            },
            ru: {
                brandSubtitle: "",
                brandMessage: "Вы сделали правильный выбор",
                registerTitle: "Создание аккаунта",
                username: "Имя пользователя",
                email: "Адрес электронной почты",
                password: "Пароль",
                passwordConfirm: "Подтверждение пароля",
                doRegister: "Создать аккаунт",
                backToLogin: "← Вернуться к входу",
                usernamePlaceholder: "Введите имя пользователя",
                emailPlaceholder: "Введите адрес электронной почты",
                passwordPlaceholder: "Создайте надёжный пароль",
                passwordConfirmPlaceholder: "Подтвердите ваш пароль",
                registering: "Создание аккаунта..."
            }
        };

        // Function to change language
        function changeLanguage() {
            const select = document.getElementById('languageSelect');
            const lang = select.value;
            const t = translations[lang];

            // Update text content
            document.getElementById('brandSubtitle').textContent = t.brandSubtitle;
            document.getElementById('brandMessage').textContent = t.brandMessage;
            document.getElementById('registerTitle').textContent = t.registerTitle;
            document.getElementById('usernameLabel').textContent = t.username;
            document.getElementById('emailLabel').textContent = t.email;
            document.getElementById('passwordLabel').textContent = t.password;
            document.getElementById('passwordConfirmLabel').textContent = t.passwordConfirm;
            document.getElementById('submitButton').value = t.doRegister;
            document.getElementById('backToLoginLink').textContent = t.backToLogin;

            // Update placeholders
            document.getElementById('username').placeholder = t.usernamePlaceholder;
            document.getElementById('email').placeholder = t.emailPlaceholder;
            document.getElementById('password').placeholder = t.passwordPlaceholder;
            document.getElementById('password-confirm').placeholder = t.passwordConfirmPlaceholder;

            // Update document language
            document.documentElement.lang = lang;
        }

        // Detect language from URL or browser
        function detectLanguage() {
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('kc_locale');
            const browserLang = navigator.language.slice(0, 2);
            
            let detectedLang = 'en';
            if (urlLang && translations[urlLang]) {
                detectedLang = urlLang;
            } else if (translations[browserLang]) {
                detectedLang = browserLang;
            }

            document.getElementById('languageSelect').value = detectedLang;
            changeLanguage();
        }

        // Initialize language detection
        document.addEventListener('DOMContentLoaded', detectLanguage);

        // Add smooth focus transitions
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
                this.parentElement.style.transition = 'transform 0.3s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Add loading state to submit button
        document.getElementById('kc-register-form').addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent actual form submission for demo
            
            const button = document.getElementById('submitButton');
            const lang = document.getElementById('languageSelect').value;
            button.style.opacity = '0.7';
            button.disabled = true;
            button.value = translations[lang].registering;
            
            // Simulate registration process
            setTimeout(() => {
                button.style.opacity = '1';
                button.disabled = false;
                button.value = translations[lang].doRegister;
            }, 2000);
        });

        // Add particle animation variation
        document.querySelectorAll('.particle').forEach((particle, index) => {
            particle.style.animationDelay = `${index * 1.5}s`;
            particle.style.animationDuration = `${8 + index}s`;
        });
    </script>
</body>
</html>