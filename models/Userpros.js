const { Schema, model } = require('mongoose');
const userproSchema = new Schema ({
    userId:     { type: String, unique: true, required: true }, 
    exchanges:  { type: Array, },
    tarif:      { type: String, }
}, {timestamps: true}); 

module.exports = model('Userpro', userproSchema)