const { Router } = require('express')
const bcr       = require('bcryptjs')     
const router    = Router();
const Port      = require('../models/Ports')
const Userpro   = require('../models/Userpros')
const Exchange  = require('../models/Exchanges')
const Strategy  = require('../models/Strategys')
const {check}   = require('express-validator')
const jwt       = require('jsonwebtoken')
const { requiresAuth } = require('express-openid-connect'); 
require('dotenv').config();

router.get('/admin', (req, res) => { 
    if (req.user.username == 'admin') {
        const params = {
            title: 'Hodlbot: Admin panel', 
            isAdmin:                true,
            isAuthenticated:        true,
            isAuthenticatedAdmin:   true
        }
        res.render('admin', params) 
            
    } 
})

router.post('/admin/addexchange', async (req, res) => {
    if (req.oidc.isAuthenticated()) { if (req.oidc.user.name == 'v.astakhov@gmail.com') { admin = true; console.log('admin = true')} } 
    if (admin) {
        if (req.body.button == 'exch') {
            console.log('add exchange: ',  req.body.exchname, req.body.exchsite)
            const exch = new Exchange({
                name:   req.body.exchname,
                api:    req.body.exchapi,
                site:   req.body.exchsite
            })
            await exch.save()
        }
    }
res.redirect('/admin')
})
router.post('/admin/addstrategy', async (req, res) => {
    if (req.user.username == 'admin') { 
        if (req.body.button == 'str') {
            console.log('add strategy: ',  req.body.strname )
            const str = new Strategy({
                name:   req.body.strname
            })
            await str.save()
        }
        res.redirect('/admin')
            
    } 
})


module.exports = router