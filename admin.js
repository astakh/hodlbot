//const { binance } = require('ccxt')
const Exchange = require('./models/Exchanges')
const Userpro   = require('./models/Userpros')
 
async function main() {

    const ex = new Exchange({name: 'binance', site: 'https://binance.com'})
    console.log(ex)
    await ex.save()
}
