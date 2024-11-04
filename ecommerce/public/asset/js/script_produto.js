document.getElementById("produtoForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const descricao = document.getElementById("descricao").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const imagem = document.getElementById("imagem").value;

    fetch("/api/inserir_produto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, descricao, preco, imagem })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("produtoForm").reset();
    })
    .catch(error => console.error("Erro ao adicionar o produto:", error));
});


