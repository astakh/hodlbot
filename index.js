const { urlencoded } = require('express');
const express   = require('express')
const exphbs    = require('express-handlebars')
const mongoose  = require('mongoose')
const path      = require('path')
require('dotenv').config();
//const passport  = require('passport')
const { auth } = require('express-openid-connect')
const PORT      = process.env.PORT || 3000
const DBPATH    = process.env.DBPATH
const app       = express()
const hbs       = exphbs.create({
    defaultLayout:  'main',
    extname:        'hbs'
})
const portRouts= require('./routes/ports') 
const portfolioRouts= require('./routes/portfolio') 
const profileRouts= require('./routes/profile') 
const adminRouts= require('./routes/admin') 
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH_SECRET,
    baseURL: process.env.AUTH_BASEURL,
    clientID: process.env.AUTH_CLID,
    issuerBaseURL: process.env.AUTH_ISSUER
};

//app.use(passport.initialize())
//require('./middle/passport')(passport)

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
app.use(express.urlencoded({extended: true}))
app.use(express.json({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(auth(config));
  
//app.use('/auth', authRouts) 
app.use('', portRouts) 
app.use('', portfolioRouts) 
app.use('', profileRouts) 
app.use('', adminRouts) 
 
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