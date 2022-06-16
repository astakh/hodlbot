const { Schema, model } = require('mongoose');
const exchangeSchema = new Schema ({
    name:       { type: String, unique: true, required: true }, 
    site:       { type: String, }
}, {timestamps: true}); 

module.exports = model('Exchange', exchangeSchema)