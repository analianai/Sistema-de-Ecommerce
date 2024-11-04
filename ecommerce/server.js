const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Configuração do body-parser
app.use(bodyParser.json()); // Permitir JSON
app.use(bodyParser.urlencoded({ extended: true })); // Permitir URL encoded

app.use(express.static('public'));

// Suas rotas e lógica

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

// Rota para inserir novo produto
app.post('/api/inserir_produto', (req, res) => {
    const { nome, descricao, preco, imagem } = req.body;
    
    // Log para verificar os dados recebidos
    console.log("Dados recebidos:", req.body);

    const sql = 'INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)';
    const values = [nome, descricao, preco, imagem];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erro ao adicionar o produto:", err); // Log detalhado do erro
            res.status(500).json({ message: 'Erro ao adicionar o produto', error: err });
        } else {
            console.log("Produto adicionado com sucesso!", result);
            res.json({ message: 'Produto adicionado com sucesso!' });
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});