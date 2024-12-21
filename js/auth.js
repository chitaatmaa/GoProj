function doReq() {
    let error_msg = '';
    let input_log = document.getElementById("log").value; // Логин
    let input_pas = document.getElementById("pas").value; // Пароль
    const serverURL_login = "http://localhost:8080/auth"; // URL сервера
    let data = {
        'login': input_log,
        'passwd': input_pas,
    };

    fetch(serverURL_login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text); });
        }
        return res.json();
    })
    .then(data => {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('login', data.login);
        window.location.href = './/..//main.html';
    })
    .catch(error => {
        document.getElementById("server_message_error").innerText = error.message;
    });
}

function doRegister() {
    let input_log = document.getElementById("log").value; // Логин
    let input_pas = document.getElementById("pas").value; // Пароль
    const serverURL_register = "http://localhost:8080/register"; // URL сервера для регистрации
    let data = {
        'login': input_log,
        'passwd': input_pas,
    };

    fetch(serverURL_register, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text); });
        }
        return res.json();
    })
    .then(data => {
        document.getElementById("server_message_error").innerText = data.message;
    })
    .catch(error => {
        document.getElementById("server_message_error").innerText = error.message;
    });
}
