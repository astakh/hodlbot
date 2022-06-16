const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Case      = require('../models/Cases')
const Userpro   = require('../models/Userpros')
const Exchange  = require('../models/Exchanges')
const Strategy  = require('../models/Strategys')
const ccxt      = require('ccxt')
const {check}   = require('express-validator')
const jwt       = require('jsonwebtoken')
const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config();
//const secretkey = process.env.SECRET
let admin = false

function sumTotal(arr) {
    let sum = 0
    arr.forEach(el => {
        sum += el.valuation
    })
    return sum
}
function sortCoins(arr) {
    arr.sort(function (a, b) {
        if (a.valuation < b.valuation) {
          return 1;
        }
        if (a.valuation > b.valuation) {
          return -1;
        }
        // a должно быть равным b
        return 0;
    })
    return arr
}
function addShares(arr, total) {
    arr.forEach(el => {
        el.share = (el.valuation / total * 100).toFixed(2)
    })
    return arr
}
function delCaseCoin(arr, toDelete) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].name == toDelete) { arr.splice(i, 1); break; }
    }
    return arr
}
router.get('/portfolio', requiresAuth(), async (req, res) => { 
    if (req.oidc.isAuthenticated()) { if (req.oidc.user.name == 'v.astakhov@gmail.com') { admin = true; console.log('admin = true')} } 
    const userpro = await Userpro.findOne({userId: req.oidc.user.name}).lean() 
    let cases;
    let caseCoins = []
    let exchObj 
    let port = {}
    port.exchanges = []
    let exchanges = userpro.exchanges 
    for( const exch of exchanges) { 
        if (exch.name == 'binance') exchObj = new ccxt.binance({apiKey: exch.key, secret: exch.secret})
        let rowBalance  = await exchObj.fetchBalance()
        let market      = await exchObj.fetchTickers()
        //console.log(market['CAKE/USDT'])
        rowBalance      = rowBalance.total
        const tokens    = Object.keys(rowBalance)
        let balance     = []
        let price
        let totalValuation = 0;
        tokens.forEach(token => { 
            if (market[token+'/USDT']) { price = market[token+'/USDT'].last}
            else if (market[token+'/BUSD']) {price = market[token+'/BUSD'].last }
            totalValuation += price * rowBalance[token]
            if (rowBalance[token] > 0) balance.push({name: token, total: rowBalance[token].toFixed(4), price: price.toFixed(4), valuation: price * rowBalance[token], fixed: (price * rowBalance[token]).toFixed(2) }) 
        })
        let noCaseCoins = balance
        let exchCases   = []
        cases = await Case.find({userId: req.oidc.user.name, exchange: exch.name}).lean()
        cases.forEach(cass => { 
            caseCoins = []
            cass.coins.forEach(coin => {
                if (market[coin.name+'/USDT']) { price = market[coin.name+'/USDT'].last}
                else if (market[coin.name+'/BUSD']) {price = market[coin.name+'/BUSD'].last }
                caseCoins.push({
                    name:       coin.name, 
                    total:      rowBalance[coin.name].toFixed(4), 
                    price:      price.toFixed(4), 
                    valuation:  price * rowBalance[coin.name], 
                    fixed:      (price * rowBalance[coin.name]).toFixed(2)
                })
                noCaseCoins = delCaseCoin(noCaseCoins, coin.name)
                totalCase   = sumTotal(caseCoins)
                caseCoins   = sortCoins(caseCoins)
                caseCoins   = addShares(caseCoins, totalCase)
        
            })  
            exchCases.push({name: cass.name, total: sumTotal(caseCoins).toFixed(2), coins: caseCoins})
        })
        // noCase portfolio
        totalCase   = sumTotal(noCaseCoins)
        noCaseCoins = sortCoins(noCaseCoins)
        noCaseCoins = addShares(noCaseCoins, totalCase)
        noCaseCoins.forEach(el => {
            el.noCase = true
        });
        exchCases.push({name: 'noCase', total: totalCase.toFixed(2), coins: noCaseCoins, isNoCase: true})
        port.exchanges.push({
            name:           exch.name, 
            totalValuation: totalValuation.toFixed(2), 
            cases:          exchCases
        })

        /*
        cases = await Case.find({userId: req.oidc.user.name, exchange: exch.name}).lean()
        cases.forEach(cass => {
            cass.coins.forEach(coin => {
                caseCoins.push(coin.name)
            }); 
        });*/


    };

    const params = {
        title: 'Hodlbot: Portfolio', 
        isMyports: true,
        isAuthenticated:        req.oidc.isAuthenticated(),
        isAuthenticatedAdmin:   admin,
        port:                   port
    }
    res.render( 'portfolio', params) 
})

module.exports = router