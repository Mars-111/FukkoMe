<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Вход</title>
    <style>
        body {
            background: linear-gradient(135deg, #8e2de2, #c200fb);
            font-family: 'Segoe UI', sans-serif;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .login-container {
            background: rgba(51, 0, 102, 0.85);
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 0 30px #ff5de7;
            width: 320px;
            animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            color: #ffffff;
        }

        .error-message {
            background-color: #ff4d6d;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            color: white;
            text-align: center;
        }

        label {
            font-weight: bold;
            font-size: 14px;
        }

        input[type=text], input[type=password] {
            width: 100%;
            padding: 10px;
            margin: 8px 0 20px;
            border: none;
            border-radius: 10px;
            outline: none;
            font-size: 16px;
            background-color: #fff;
            color: #330066;
        }

        button {
            background: #ff2f92;
            border: none;
            padding: 12px;
            width: 100%;
            border-radius: 10px;
            font-size: 18px;
            color: white;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        button:hover {
            background: #c200fb;
        }

        .register-link {
            margin-top: 15px;
            text-align: center;
        }

        .register-link a {
            color: #ffccff;
            text-decoration: none;
            font-size: 14px;
        }

        .register-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
<div class="login-container">
    <h2>Вход в систему</h2>

    <#if message?has_content>
        <div class="error-message">${message.summary}</div>
    </#if>

    <form action="${url.loginAction}" method="post">
        <label for="username">Username or Email</label>
        <input id="username" name="username" type="text" required />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Войти</button>

        <div class="register-link">
            <a href="${url.registrationUrl}">Нет аккаунта? Зарегистрироваться</a>
        </div>
    </form>
</div>
</body>
</html>
