const { Schema, model } = require('mongoose');
const strategySchema = new Schema ({
    name:   { type: String, unique: true  }
}, {timestamps: true});

module.exports = model('Strategy', strategySchema)