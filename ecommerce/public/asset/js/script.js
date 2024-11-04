let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

//inicio
document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/produtos")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("produtos-container");
            data.forEach(produto => {
                const div = document.createElement("div");
                div.classList.add("produto");
                
                div.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem" />
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <p>R$${produto.preco}</p>
                    <button onclick="adicionarAoCarrinho(${produto.id}, '${produto.nome}', ${produto.preco})">Adicionar ao Carrinho</button>
                `;
                container.appendChild(div);
            });
        });
});


function finalizarPedido() {
    fetch("/api/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ produtos: carrinho })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carrinho = []; // Limpa o carrinho após finalizar o pedido
    })
    .catch(error => console.error("Erro ao finalizar o pedido:", error));
}



function adicionarAoCarrinho(id, nome, preco) {
    const produtoExistente = carrinho.find(item => item.id === id);
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }
    // Salva o carrinho no localStorage
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert("Produto adicionado ao carrinho!");
}

