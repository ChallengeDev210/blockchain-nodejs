const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pserver = require('./p2p-server');

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

//create a new app
const app  = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet();

// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();

// create a p2p server instance with the blockchain
const p2pserver = new P2pserver(blockchain);

//EXPOSED APIs

//api to get the blocks
app.get('/blocks',(req,res)=>{

    res.json(blockchain.chain);

});

//api to add blocks
app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    
    /**
     * use the synchain method to synchronise the
     * state of the blockchain
     */
    p2pserver.syncChain();
    res.redirect('/blocks');
});

// api to view transaction in the transaction pool
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});

app.post('/transact',(req,res)=>{
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, transactionPool);
    res.redirect('/transactions');
});

// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
})

// p2p server configuration
p2pserver.listen();
