const ccxt      = require('ccxt')
const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Port      = require('../models/Ports')
const User      = require('../models/Users')
const Exchange  = require('../models/Exchanges')
const {check}   = require('express-validator')
//const jwt       = require('jsonwebtoken')
//const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config(); 
//let admin = false
router.get('/profile', async (req, res) => {
    let params = {
        title:                  'Hodlbot: Profile',
        isProfile:              true
    } 
    if (req.user) {
        params.isAuthenticated = true
        if (req.user.username == 'admin') { params.isAuthenticatedAdmin = true; }  
        if (req.user.exchanges.noExchanges) params.noExchange = true
        else params.exchangesLength = Object.keys(req.user.exchanges.exchange).length
        params.user = await User.findOne({username: req.user.username}).lean()
        params.exchanges = await Exchange.find().lean()
    }
    //console.log(params)
    res.render('profile', params)
})
router.post('/profile/addexchange', async (req, res) => {
    let params = {
        title:                  'Hodlbot: Profile',
        isProfile:              true,
        isAuthenticatedAdmin:   false
    }
    console.log('add exchange')
    if (req.user) {
        let user
        params.isAuthenticated = true
        let validation                  = {correct: true, usererror: false, excherror: false, exchexists: false, keyerror: false}
        const exchange                  = await Exchange.find({name: req.body.exchselect})
        if (exchange.len == 0)          { validation.correct = false; validation.excherror = true}
        if (validation.correct) { user  = await User.findOne({username: req.user.username}).lean()}
            else {validation.correct    = false; validation.usererror = true; }
        if (validation.correct) if (user.exchanges[req.body.exchselect]) { validation.correct = false; validation.exchexists = true; }    
        if (validation.correct) { // check key
            try {
                const exch = new ccxt[req.body.exchselect]({apiKey: req.body.exchkey, secret: req.body.exchsecret})
                exch.checkRequiredCredentials()
            } catch(err) {
                validation.correct = false; validation.keyerror = true
                console.log(err)
            }
        } 
        if (validation.correct && req.body.butaddexchange =='OK') {
            //params.user = user
            user.exchanges.noExchanges  = false
            user.exchanges.exchange     = {}
            user.exchanges.exchange[req.body.exchselect] = {name: req.body.exchselect, key: req.body.exchkey, secret: req.body.exchsecret}
            await User.updateOne({username: user.username}, {exchanges: user.exchanges})

        }
    }
    res.redirect('/profile')
})

module.exports = router