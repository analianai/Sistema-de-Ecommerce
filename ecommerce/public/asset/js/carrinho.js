let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function exibirCarrinho() {
    const container = document.getElementById("carrinho-container");
    const totalElement = document.getElementById("total");
    let total = 0;

    container.innerHTML = ""; // Limpa o container antes de adicionar os itens

    carrinho.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item-carrinho");
        total += item.preco * item.quantidade;

        div.innerHTML = `
            <h2>${item.nome}</h2>
            <p>Preço: R$${item.preco}</p>
            <p>Quantidade: <input type="number" value="${item.quantidade}" min="1" onchange="atualizarQuantidade(${item.id}, this.value)" /></p>
            <button onclick="removerDoCarrinho(${item.id})">Remover</button>
        `;
        container.appendChild(div);
    });

    totalElement.innerText = total.toFixed(2); // Formata o total para 2 casas decimais
}

function atualizarQuantidade(id, quantidade) {
    const item = carrinho.find(item => item.id === id);
    if (item) {
        item.quantidade = parseInt(quantidade);
        localStorage.setItem("carrinho", JSON.stringify(carrinho)); // Atualiza o carrinho no localStorage
        exibirCarrinho(); // Atualiza a exibição
    }
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem("carrinho", JSON.stringify(carrinho)); // Atualiza o carrinho no localStorage
    exibirCarrinho(); // Atualiza a exibição
}

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
        localStorage.removeItem("carrinho"); // Limpa o carrinho após finalizar o pedido
        window.location.href = "index.html"; // Volta para a página inicial
    })
    .catch(error => console.error("Erro ao finalizar o pedido:", error));
}

// Chama a função para exibir o carrinho ao carregar a página
document.addEventListener("DOMContentLoaded", exibirCarrinho);
