# Sistema de E-commerce

Projeto completo de um e-commerce básico com Node.js, Express, MySQL e JavaScript no frontend. Esse projeto inclui funcionalidades como exibição de produtos, adição ao carrinho e checkout.

## Estrutura Geral do Projeto

### Estrutura de Arquivos

````plaintext
ecommerce/
├── server.js               # Arquivo principal do servidor
├── db.js                   # Arquivo de configuração do banco de dados
├── public/
│   ├── index.html          # Página inicial com listagem de produtos
│   ├── style.css           # Estilos para a página
│   └── script.js           # Scripts do frontend para interações com a API
└── package.json            # Dependências e configurações do Node.js
````

### Passo 1: Configuração do Banco de Dados MySQL

<hr></hr>

#### Crie o banco de dados e as tabelas no MySQL

````sql
CREATE DATABASE ecommerce;

USE ecommerce;

-- Tabela de Produtos
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    imagem VARCHAR(255)
);

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10, 2),
    data DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido
CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    produto_id INT,
    quantidade INT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
````

### Passo 2: Configuração do Projeto **Node.js**

<hr></hr>

1. Crie um novo projeto Node.js:

````bash
mkdir ecommerce
cd ecommerce
npm init -y
````

2. Instale as dependências:

````bash
npm install express mysql2 body-parser
````

### Passo 3: Configuração da Conexão com o Banco de Dados

<hr></hr>

#### Crie um arquivo **db.js** para configurar a conexão com o banco de dados

### Arquivo *db.js*

````javascript
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL.');
    }
});

module.exports = db;
````

### Passo 4: Configuração do Servidor Express

<hr></hr>

#### No arquivo **server.js**, configure as rotas da API e sirva os arquivos estáticos da pasta public

#### Arquivo *server.js*

````javascript
const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Rota para listar produtos
app.get('/api/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            res.status(500).send('Erro ao buscar produtos');
        } else {
            res.json(results);
        }
    });
});

// Rota para adicionar um item ao carrinho
app.post('/api/add_to_cart', (req, res) => {
    const { produtoId, quantidade } = req.body;
    res.json({ message: 'Produto adicionado ao carrinho', produtoId, quantidade });
});

// Rota para finalizar o pedido
app.post('/api/checkout', (req, res) => {
    const { produtos } = req.body;
    let total = 0;

    produtos.forEach(produto => {
        total += produto.preco * produto.quantidade;
    });

    db.query('INSERT INTO pedidos (total) VALUES (?)', [total], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao criar pedido');
        } else {
            const pedidoId = result.insertId;

            produtos.forEach(produto => {
                db.query('INSERT INTO itens_pedido (pedido_id, produto_id, quantidade) VALUES (?, ?, ?)', 
                    [pedidoId, produto.id, produto.quantidade]);
            });

            res.json({ message: 'Pedido realizado com sucesso', pedidoId });
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
````

### Passo 5: Criação do Frontend

<hr></hr>

#### Crie a estrutura de frontend na pasta public.

#### Arquivo *index.html*

#### Esse arquivo HTML é a página inicial que exibe os produtos.

````html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loja Virtual</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Produtos Disponíveis</h1>
    <div id="produtos-container"></div>
    <button onclick="finalizarPedido()">Finalizar Pedido</button>

    <script src="script.js"></script>
</body>
</html>
````

#### Arquivo style.css

````css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

#produtos-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-top: 20px;
}

.produto {
    border: 1px solid #ddd;
    padding: 10px;
    width: 200px;
    text-align: center;
}

button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
}
````

#### Arquivo *script.js*

#### Este arquivo JavaScript faz as requisições para buscar os produtos e gerencia o carrinho

````javascript
let carrinho = [];

document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/produtos")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("produtos-container");
            data.forEach(produto => {
                const div = document.createElement("div");
                div.classList.add("produto");
                div.innerHTML = `
                    <h2>${produto.nome}</h2>
                    <p>${produto.descricao}</p>
                    <p>R$${produto.preco}</p>
                    <button onclick="adicionarAoCarrinho(${produto.id}, '${produto.nome}', ${produto.preco})">Adicionar ao Carrinho</button>
                `;
                container.appendChild(div);
            });
        });
});

function adicionarAoCarrinho(id, nome, preco) {
    const produtoExistente = carrinho.find(item => item.id === id);
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }
    alert("Produto adicionado ao carrinho!");
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
        carrinho = []; // Limpa o carrinho após finalizar o pedido
    })
    .catch(error => console.error("Erro ao finalizar o pedido:", error));
}
````

## Requisitos para Rodar o Projeto

Para rodar o projeto com Node.js no Visual Studio Code, você precisa instalar o Node.js no seu sistema e configurar o ambiente no VS Code. Vou guiar você por todo o processo, desde a instalação do Node.js até a execução do projeto no VS Code.

### Passo 1: Instalar Node.js no Sistema

<hr></hr>

1. Baixar o Node.js: Acesse o site oficial do Node.js em https://nodejs.org e baixe a versão LTS (recomendada para a maioria dos usuários).

2. Instalar o Node.js:

    * No Windows, execute o arquivo .msi baixado e siga as instruções do instalador.

    * No macOS, execute o arquivo .pkg baixado e siga as instruções.

    * No Linux, você pode instalar usando o gerenciador de pacotes. Por exemplo, no Ubuntu:

        ````bash
        sudo apt update
        sudo apt install nodejs npm
        ````

3. Verificar a Instalação: Após a instalação, abra um terminal e digite os comandos abaixo para verificar se o Node.js e o npm foram instalados corretamente

````bash
node -v
npm -v
````

Esses comandos devem exibir as versões instaladas do Node.js e do npm (Node Package Manager)

### Passo 2: Configurar o Projeto no VS Code

<hr></hr>

1. Abrir o Projeto no VS Code:

    * Abra o Visual Studio Code.
    * Clique em ***File > Open Folder*** (ou Arquivo > Abrir Pasta), selecione a pasta do seu projeto de e-commerce e clique em Open (ou Abrir).

2. Instalar as Dependências do Projeto:

    * Com o projeto aberto no VS Code, abra um terminal integrado pressionando Ctrl + ` (ou vá em Terminal > New Terminal no menu).
    * No terminal, execute o comando abaixo para instalar as dependências do projeto:

        ````bash
        npm install
        ````

        Esse comando instalará as dependências listadas no package.json (como express, mysql2, etc.) na pasta node_modules.

### Passo 3: Configurar Scripts para Facilitar a Execução do Projeto

No seu **package.json**, adicione um script start para facilitar a execução do servidor. Abra o *package.json* e adicione o seguinte código na seção scripts:

````json
"scripts": {
  "start": "node server.js"
}
````

Isso permite iniciar o servidor com o comando npm start.

### Passo 4: Rodar o Projeto

<hr></hr>

1. Executar o Servidor

    * Com o terminal integrado do VS Code aberto, inicie o servidor executando o comando:

        ````bash
        node server.js
        ````
    * Esse comando iniciará o servidor Node.js conforme configurado para rodar em http://localhost:3000.

2. Testar o Projeto:

    * Abra o navegador e acesse http://localhost:3000.
    * A página inicial do seu projeto de e-commerce deverá ser exibida.

</hr>
