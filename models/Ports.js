const { Schema, model } = require('mongoose');
const portSchema = new Schema ({
    ownerId:    { type: String, },
    name:       { type: String, },
    run:        { type: Boolean, default: false},
    strategy:   { type: String, },
    exchange:   { type: String, },
    assets:     { type: Array,  },
    base:       { type: String, default: 'USDT'},
    valuation:  { type: Number, default: 0} 
}, {timestamps: true});
//const Port = mongoose.model('Port', portSchema); 

module.exports = model('Port', portSchema)