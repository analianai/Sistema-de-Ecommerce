document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login realizado com sucesso!");
            window.location.href = "index.html"; // Redireciona para a página principal
        } else {
            document.getElementById("error-message").innerText = data.message;
        }
    })
    .catch(error => console.error("Erro ao fazer login:", error));
});
