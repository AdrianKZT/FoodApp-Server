
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            food: {
                type: Schema.Types.ObjectId,
                ref: "Food",
            }, 
            quantity: { type: Number, require: true },
            subtotal: { type: Number, require: true },
            _id: false
        }
    ],
    total: {type: Number}
})

module.exports = mongoose.model("Cart", CartSchema)