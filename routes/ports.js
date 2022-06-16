const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Case      = require('../models/Cases')
const Userpro   = require('../models/Userpros')
const Exchange  = require('../models/Exchanges')
const Strategy  = require('../models/Strategys')
const {check}   = require('express-validator')
const jwt       = require('jsonwebtoken')
const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config();
//const secretkey = process.env.SECRET
let admin = false
router.get('/', (req, res) => { 
    const params = {
        title: 'Hodlbot', 
        isAuthenticated:    req.oidc.isAuthenticated()
    }
    res.render('index', params) 
})

router.get('/create', requiresAuth(), async (req, res) => { 
    let params = {
        title:                  'Hodlbot: Create new portfolio', 
        isCreate:               true,
        isAuthenticated:        false,
        isAuthenticatedAdmin:   false
    }
    if (req.oidc.isAuthenticated()) { 
        params.isAuthenticated = true
        if (req.oidc.user.name == 'v.astakhov@gmail.com') { params.isAuthenticatedAdmin = true; } 
        const pro = await Userpro.findOne({userId: req.oidc.user.name}).lean()
        params.exchanges = pro.exchanges
        params.strategys = await Strategy.find().lean()

    } 

    res.render('create', params) 
})
router.post('/create', requiresAuth(), async (req, res) => {
    if (req.oidc.isAuthenticated()) { if (req.oidc.user.name == 'v.astakhov@gmail.com') { admin = true; console.log('admin = true')} } 
    console.log(req.body)
    let coins = []
    req.body.coins.forEach(el => {
        coins.push({name: el})
    });
    const cas = new Case({
        ownerId:    req.oidc.user.name,
        name:       req.body.name,
        strategy:   req.body.strname,
        exchange:   req.body.exchname,
        coins:      coins
    })
    await cas.save()
    res.redirect('/portfolio')
})

router.post('/addcase', requiresAuth(), async (req, res) => {
    let params = {
        title:                  'Hodlbot: Create new portfolio', 
        isCreate:               true,
        isAuthenticated:        false,
        isAuthenticatedAdmin:   false
    }
    if (req.oidc.isAuthenticated()) {
        params.isAuthenticated = true 
        if (req.oidc.user.name == 'v.astakhov@gmail.com') { 
            isAuthenticatedAdmin = true; console.log('admin = true')
        } 
    } 
    let coins = []
    req.body.coins.forEach(el => {
        coins.push({name: el})
    });
    console.log(req.body)
    
    params.coins        = coins
    params.fromPortfolio= true
    params.exchange     = req.body.exchange
    params.strategys    = await Strategy.find().lean()
    res.render('create', params)
})


module.exports = router