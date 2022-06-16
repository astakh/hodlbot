const ccxt  = require ('ccxt');
const axios = require ('axios');
const db    = require('./db/dbhodlbot');
const func  = require('./functions');
require('dotenv').config();


const binance   = new ccxt.binance(         { apiKey: process.env.BINANCE_API_KEY,  secret: process.env.BINANCE_API_SECRET });
//const gateio    = new ccxt.gateio(          { apiKey: process.env.GATEIO_API_KEY, secret: process.env.GATEIO_API_SECRET });


async function getUpdates(port) {
    let res = {}; 
    try {
        let pair;
        let b = await binance.fetchBalance(); 
        // balances
        port.assets.forEach(element => { 
            if (b[element.asset.ticker]) {
                element.balance.free    = b[element.asset.ticker].free;
                element.balance.used    = b[element.asset.ticker].used;
                element.balance.total   = b[element.asset.ticker].total;
            } 
        }); 
        // valuations
        port.valuation = 0;
        for (var i = 1; i < port.assets.length; i++ ) {
            pair = port.assets[i].asset.ticker + '/' + port.assets[0].asset.ticker;
            if (market.hasOwnProperty(pair)) { 
                port.assets[i].balance.valuation = market[pair].last * port.assets[i].balance.total; 
                port.valuation += port.assets[i].balance.valuation;
            }
            else {
                //!!!!!!!!!!!!!!!!!!! need to add handle getMarkets error !!!!!!!!!!!!!!!!!!!!!!!!
                db.addLog(`pair: ${pair} is abcent, asset: ${port.assets[i]} deleted from portfolio`);
                port.assets = port.assets.splice(i, 1); 
            }
        } 
        // weights
        let totalWeight = 0;
        port.assets.forEach(element => {
            element.balance.weight  =  Math.round(element.balance.valuation / port.valuation * 10000) / 100;
            totalWeight             += element.balance.weight;
        });
        port.assets[0].balance.weight = 100 - (totalWeight-port.assets[0].balance.weight);
        totalWeight = 0;
        port.assets.forEach(element => {
            totalWeight += element.balance.weight;
        });
        if (totalWeight != 100) { db.addLog(`${port._id} weights error totalWeight=${totalWeight}`)} 

        //console.log(`${port._id}: ${port.assets[0].balance.weight} : ${port.assets[1].balance.weight}`)

        res =  {success: true, data: port}
        await db.savePort(port);
    }
    catch(err) { console.log(err); res = {success: false}; }
    return res;
}

async function goSimple(port) {
    port = await getUpdates(port);
    port = port.data; 

    // check tasks to rebalance
    for (var i = 1; i < port.assets.length; i++ ) {
        let task = {};
        let a = port.assets[i];
        if ((a.strategy.weight - a.balance.weight) > a.strategy.deviation) {
            task.pair   = a.asset.ticker + '/' + port.assets[0].asset.ticker;
            task.type   = 'buy';
            if (a.balance.weight>0) task.amount = a.balance.total / a.balance.weight * (a.strategy.weight - a.balance.weight); 
            else                    task.amount = (port.valuation * a.strategy.weight / 100) / market[task.pair].last;
            console.log(`Have ${a.balance.total.toFixed(4)}${a.asset.name} Need to buy: task ${JSON.stringify(task)}`);
        }
        if ((a.balance.weight - a.strategy.weight) > a.strategy.deviation) {
            task.pair   = a.asset.ticker + '/' + port.assets[0].asset.ticker;
            task.type   = 'sell';
            if (a.balance.weight>0) task.amount = a.balance.total / a.balance.weight * (a.balance.weight - a.strategy.weight); 
            else                    task.amount = (port.valuation * a.strategy.weight / 100) / market[task.pair].last; 
            console.log(`Have ${a.balance.total.toFixed(4)}${a.asset.name} Need to sell: task ${JSON.stringify(task)}`);
        }
    } 

    return port;
}
async function getMarkets() {
    try {
        const m = await binance.fetchTickers();
        //console.log(m)
        return m;
    }
    catch(err) { console.log(err) }
}

let market;
async function botLoop() {
    market = await getMarkets();
    let port; 
    let ports = await db.getPortfoliosId();
    if (ports.success) { ports = ports.data; }

    for (var i = 0; i < ports.length; i++) {
        port = await db.getPortfolio(ports[i]);
        if (port.success) { port = port.data; }
        if (port.strategy.name == 'simple') {
            port = await goSimple(port);
            //port = await savePort(port);

        }
    }
    
}

botLoop();

