const { Schema, model } = require('mongoose');
const userSchema = new Schema ({
    username:   { type: String, unique: true, required: true }, 
    password:   { type: String, required: true },
    exchanges:  { type: Object, default: {noExchanges: true, exchange: {}}},
    cases:      { type: Array, },
    tarif:      { type: String, }
}, {timestamps: true}); 

module.exports = model('User', userSchema)