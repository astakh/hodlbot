const { Schema, model } = require('mongoose');
const strategySchema = new Schema ({
    name:   { type: String, unique: true  },
    params: { type: Object, default: {disbalance: 10}}
}, {timestamps: true});

module.exports = model('Strategy', strategySchema)