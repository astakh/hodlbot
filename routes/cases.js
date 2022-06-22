const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Case      = require('../models/Cases')
const User      = require('../models/Users')
const Exchange  = require('../models/Exchanges')
const Strategy  = require('../models/Strategys')
const {check}   = require('express-validator')
const jwt       = require('jsonwebtoken')
const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config();
//const secretkey = process.env.SECRET

router.get('/create', async (req, res) => { 
    let params = {
        title:                  'Hodlbot: Create new portfolio', 
        isCreate:               true,
        isAuthenticated:        false,
        isAuthenticatedAdmin:   false
    }
    if (req.user) { 
        params.isAuthenticated = true 
        const pro = await User.findOne({username: req.user.username}).lean()
        params.exchanges = pro.exchanges
        params.strategys = await Strategy.find().lean()

    } 

    res.render('create', params) 
})
router.post('/create', async (req, res) => {
    if (req.user) { 
        console.log(req.body)
        let validation = true
        if (!req.user.username|| !req.body.name|| !req.body.strname|| !req.body.exchname) validation = false
        if (validation) {
            let coins = []
            req.body.coins.forEach(el => {
                coins.push({name: el})
            });
            const caseparams = {
                username:   req.user.username,
                name:       req.body.name,
                strategy:   req.body.strname,
                exchange:   req.body.exchname,
                coins:      coins
            }
            const cas = new Case(caseparams)
            await cas.save()
            caseparams.id = cas._id
            const strategys = await Strategy.find().lean()
            strategys.forEach(el => {
                if (el._id == cas.strategy) el.current = true
            })
            const params = {
                isAuthenticated:    true,
                cas:                caseparams,
                strategys:          strategys
            }
            res.render('caseedit', params)
        }
        else {
            res.render('error', {isAuthenticated: true, err: 'invalid data'})
    
        }
    }
})
router.post('/casedelete', async (req, res) => {
    if (req.user) { 
        console.log(req.body)
        await Case.deleteOne({_id: req.body.caseid})
        res.redirect('/portfolio')
    }
})
router.post('/casesave', async (req, res) => {
    if (req.user) { 
        console.log('casesave post req:', req.body)
        let validation = true
        //if (!req.user.username|| !req.body.name|| !req.body.strname|| !req.body.exchname) validation = false
        if (validation) {
            let coins = []
            for (var i = 0; i < req.body.coins.length; i++ ) {
                let share = parseInt(req.body.shares[i])
                coins.push({name: req.body.coins[i], share: share})
            }
            const caseparams = {
                username:   req.user.username,
                name:       req.body.name,
                strategy:   req.body.strname,
                exchange:   req.body.exchname,
                coins:      coins,
                params:     {disbalance: parseInt(req.body.disbalance)}
            }
            console.log('caseparams', caseparams) 
            await Case.updateOne({_id: req.body.caseid}, caseparams)
            const params = {
                isAuthenticated:    true,
                isPortfolio:        true
            }
            res.redirect('/portfolio')
        }
        else {
            res.render('error', {isAuthenticated: true, err: 'invalid data'})
    
        }
    }
})
router.post('/createfromportfolio', async (req, res) => {
    let params = {
        title:                  'Hodlbot: Create new portfolio', 
        isCreate:               true,
        isAuthenticated:        false,
        isAuthenticatedAdmin:   false
    }
    if (req.user) { 
        params.isAuthenticated = true 
        let coins = []
        req.body.coins.forEach(el => {
            coins.push({name: el, share: 0})
        })
        
        params.coins        = coins
        params.fromPortfolio= true
        params.exchange     = req.body.exchname
        params.strategys    = await Strategy.find().lean()
        res.render('create', params)
    
    } 
})
router.post('/caseeditfromportfolio', async (req, res) => {
    if (req.user) { 
        console.log(req.body)
        const cas = await Case.findById(req.body.caseid).lean()
        const strategys = await Strategy.find().lean()
        strategys.forEach(el => {
            if (el._id == cas.strategy) el.current = true
        })
        const params = {
            isAuthenticated:true,
            isCaseedit:     true,
            isFromPortfolio:true,
            cas:            cas,
            strategys:      strategys
        }
        res.render('caseedit', params)
    }
})


module.exports = router