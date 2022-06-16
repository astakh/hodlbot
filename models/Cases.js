const { Schema, model } = require('mongoose');
const caseSchema = new Schema ({
    ownerId:    { type: String, },
    name:       { type: String, },
    run:        { type: Boolean, default: false},
    strategy:   { type: String, },
    exchange:   { type: String, },
    coins:      { type: Array,  },
    base:       { type: String, default: 'USDT'},
    valuation:  { type: Number, default: 0} 
}, {timestamps: true});

module.exports = model('Case', caseSchema)