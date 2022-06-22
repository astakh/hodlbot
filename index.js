const { urlencoded } = require('express');
const express   = require('express')
const session   = require('express-session')
const exphbs    = require('express-handlebars')
const mongoose  = require('mongoose')
const path      = require('path')
const bcrypt     = require('bcrypt')
require('dotenv').config();
const passport  = require('passport')
const localStrategy = require('passport-local').Strategy
//const { auth } = require('express-openid-connect')
const PORT      = process.env.PORT || 3000
const DBPATH    = process.env.DBPATH
const app       = express()
const User      = require('./models/Users')
const hbs       = exphbs.create({
    defaultLayout:  'main',
    extname:        'hbs'
})
const caseRouts= require('./routes/cases') 
const portfolioRouts= require('./routes/portfolio') 
const profileRouts= require('./routes/profile') 
const adminRouts= require('./routes/admin'); 
const Strategy = require('passport-local/lib');
/*const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH_SECRET,
    baseURL: process.env.AUTH_BASEURL,
    clientID: process.env.AUTH_CLID,
    issuerBaseURL: process.env.AUTH_ISSUER
};
*/
//app.use(passport.initialize())
//require('./middle/passport')(passport)

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public'))) 
app.use(session({
    secret: 'tohidesecret',
    resave: false,
    saveUninitialized: true
}))  
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function (user, done) {
    done(null, user.id)
})
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})
passport.use(new localStrategy(function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null, false, {message: 'Incorrect username'})}
        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err)
            if (res === false) return done(null, false, {message: 'Incorrect password'})
            return done(null, user)
        })
    })
})) 

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) return next()
    res.redirect('/login') 
}
function isLoggedOut(req, res, next) {
    if(!req.isAuthenticated()) return next()
    res.redirect('/') 
}
app.get('/', isLoggedIn, (req, res) => { 
    let params = {
        title: 'Hodlbot', 
    }
    if (req.user) params.isAuthenticated = true
    //console.log(req.user)
    res.render('index', params) 
})

app.post('/registr', async (req, res) => {
    const exists = await User.exists({username: req.body.username})
    if (exists) { 
        res.render('registr', {usernameError: true}) 
        return 
    }
    if (req.body.password != req.body.repeatpassword) { 
        res.render('registr', {passwordError: true}) 
        return 
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err)
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) return next(err)
            const newAdmin = new User({username: req.body.username, password: hash })
            newAdmin.save()
            res.redirect('/login')
        })
    })
})
app.get('/registr', async function (req, res) {
    res.render('registr')
})

app.use('', caseRouts) 
app.use('', portfolioRouts) 
app.use('', profileRouts) 
app.use('', adminRouts) 

app.get('/logout', function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    })
})
app.get('/login', isLoggedOut, (req, res) => {
    res.render('login', {error: req.query.error})
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/portfolio',
    failureRedirect: '/login?error=true'
}))

async function start() {
    try {
        await mongoose.connect(DBPATH, {
            useNewUrlParser: true 
        })
        app.listen(PORT, () => {
            console.log(`Server started.. port: ${PORT}`)
        })
    } catch(e) { console.log('start: error', e)} 
}

start()