const { Schema, model } = require('mongoose');
const caseSchema = new Schema ({
    username:   { type: String, required: true},
    name:       { type: String, required: true},
    run:        { type: Boolean, default: false},
    strategy:   { type: String, required: true},
    exchange:   { type: String, required: true},
    coins:      { type: Array,  },
    base:       { type: String, default: 'USDT'},
    valuation:  { type: Number, default: 0},
    params:     { type: Object, }
}, {timestamps: true});

module.exports = model('Case', caseSchema)