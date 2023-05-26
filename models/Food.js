
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true},
    description: { type: String, required: true},
    image: { type: String },
    category: { type: String, required: true},
    isActive: {type: Boolean, default: true}
})

module.exports = mongoose.model("Food", FoodSchema);