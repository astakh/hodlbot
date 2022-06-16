const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Port      = require('../models/Ports')
const Userpro   = require('../models/Userpros')
const Exchange  = require('../models/Exchanges')
const {check}   = require('express-validator')
const jwt       = require('jsonwebtoken')
const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config(); 
let admin = false
router.get('/profile', requiresAuth(), async (req, res) => {
    let params = {
        title:                  'Hodlbot: Profile',
        isProfile:              true
    }
    if (req.oidc.isAuthenticated()) {
        if (req.oidc.user.name == 'v.astakhov@gmail.com') { params.isAuthenticatedAdmin = true; } 
        const user  = req.oidc.user
        params.user = user
        let pro   = await Userpro.findOne({userId: user.name})
        if (pro) params.pro = pro
        if (pro.exchanges.length == 0) pro.noExchange = true
        else pro.exchangesLength = pro.exchanges.length
        params.exchanges = await Exchange.find().lean() 
    }
    res.render('profile', params)
})
router.post('/profile/addexchange', requiresAuth(), async (req, res) => {
    let params = {
        title:                  'Hodlbot: Profile',
        isProfile:              true,
        isAuthenticatedAdmin:   false
    }
    console.log('add exchange')
    if (req.oidc.isAuthenticated()) {
        if (req.oidc.user.name == 'v.astakhov@gmail.com') { params.isAuthenticatedAdmin = true; } 
        const user  = req.oidc.user
        params.user = user
        console.log(req.body)
        if (req.body.butaddexchange =='OK') {
            let pro   = await Userpro.findOne({userId: user.name}).lean()
            pro.exchanges.push({name: req.body.exchselect, key: req.body.exchkey, secret: req.body.exchsecret})
            await Userpro.updateOne({userId: user.name}, {exchanges: pro.exchanges})
        }
    }
    res.redirect('/profile')
})

module.exports = router