const mongodb   = require('mongodb');
const mongoose  = require('mongoose'); 
const func      = require('../functions');
require('dotenv').config();
const Port      = require('../models/Ports')

const db        = process.env.DBPATH; 
mongoose
.connect(db)
.then((res) => console.log('Connected to DB'))
.catch((err) => console.log(err));

const Schema = mongoose.Schema; 

const logSchema = new Schema ({
    text:   { type: String, } 
}, {timestamps: true});
const Log = mongoose.model('Log', logSchema); 
    
async function addLog(t) {
    let log = new Log({text: t});
    await func.sendAlert(t);
    console.log(t)
    await log.save();
}

async function addPortfolio(data) {
    let port = new Port(data);
    try {    
        await port.save();
        console.log(`Added portfolio: ${port}`, `==========================`);
        return {success: true, portId: port._id};
    }
    catch(err) {    console.log(err); return {success: false, error: err}; }
}
async function getPortfoliosId() {
    try {
        const ports = await Port.find({run: true}, {_id: 1});
        return {success: true, data: ports}

    } catch(err) { console.log(err); return {success: false, error: err}}
}
async function getPortfolio(portId) {
    try {
        const port = await Port.findById(portId);
        return {success: true, data: port}

    } catch(err) { console.log(err); return {success: false, error: err}}
}
async function savePort(port) {
    try {
        let p       = await Port.findById(port._id); 
        p.assets    = port.assets;
        await   p.save();
        console.log('port saved')
    }
    catch(err) { console.log(err) }
}

module.exports.addLog           = addLog;
module.exports.addPortfolio     = addPortfolio;
module.exports.getPortfolio     = getPortfolio;
module.exports.getPortfoliosId  = getPortfoliosId;
module.exports.savePort         = savePort;
