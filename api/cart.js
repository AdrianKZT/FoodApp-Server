
const express = require('express')
const router = express.Router()
const Cart = require("../models/Cart")
const Food = require("../models/Food")
const auth = require("../middleware/auth")
const mongoose = require("mongoose");


//Get Cart 
router.get("/", auth, async(req, res) => {
    try{
        let cart = await Cart.findOne({ user: req.user._id}).populate("items.food")  
        if(cart && cart.items.length > 0) return res.json(cart);
        return res.json({ msg: " Your cart is empty" })
    } catch(e) {
        return res.json({ e, msg: "No cart found" })
    }
})

//Add Cart
router.post("/", auth, async(req, res) => {
    try{ 
        if(req.user.isAdmin) return res.json({ msg: "You cannot shop"});
        const { foodId, quantity} = req.body;
        // console.log(req.body)
        // return
        const food = await Food.findById(foodId);
        const cart = await Cart.findOne({ user: req.user._id})

        //If Cart is empty
        if(cart === null) {
            const myCart = await Cart.create({
                user: req.user._id,
                items: [{
                    food: foodId,
                    quantity,
                    subtotal: food.price * quantity
                }],
                total: food.price * quantity
            })
            await myCart.save();
            return res.json({msg: "Food added to Cart successfully", myCart})
        }

        //If Cart is not empty
        if(cart){
            const foundItem = cart.items.find( item => item.food == foodId);
            if(foundItem) {
                foundItem.quantity += parseInt(quantity)

                foundItem.subtotal = parseInt(foundItem.quantity) * parseFloat(food.price)
                let total = 0
                cart.items.map((p) => (total += p.subtotal))
                cart.total = total
            } else {
                cart.items.push({
                    food : foodId,
                    quantity,
                    subtotal : parseFloat(food.price) * parseInt(quantity)
                })
                cart.total += parseFloat(food.price) * parseInt(quantity)
            }
            await cart.save()
            return res.json({msg: "Food added to cart successfully"})
        }
    } catch(e) {
        return res.json({e , msg:"Cannot add to Cart"})
    }
})

//Delete an item on the cart
router.delete("/:id", auth, async(req, res) => {
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.json(400).json({msg: "No such dish exists"})
        }

        let cart = await Cart.findOne({ user: req.user._id })

        if(!cart.items.length) return res.json({ msg: "No dish to delete"})

        cart.items = cart.items.filter((item) => item.food != req.params.id)
        let total = 0
        cart.items.map((p) => (total += p.subtotal));
        cart.total = total

        await cart.save()
        return res.json({msg: "Cart items deleted successfully", cart})
    } catch(e) {
        return res.json({e, msg: "Cannot delete cart items"})
    }
})

//Delete whole cart
router.delete("/", auth, async( req, res) => {
    try{
        let currentCart = await Cart.findOne(req.params.id)
        if(!currentCart) return res.json({msg: "No cart found"})

        if(currentCart.user != req.user._id) return res.status(401).json({ msg: "Unauthorized"})

        let deleteCart = await Cart.findByIdAndDelete(currentCart._id)

        return res.json({ msg: "Cart deleted successfully", deleteCart})

    } catch(e) {
        return res.json({e, msg: "Cannot delete Cart"})
    }
})

module.exports = router;