
const express = require("express")
const router = express.Router()
const Food = require("../models/Food")
const auth = require("../middleware/auth")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public");
    }, 
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

const upload = multer({ storage })

//Get Food Item
router.get("/", async (req, res) => {
    try{
        let foods = await Food.find()
        return res.json(foods)
    } catch(e) {
        return res.json({ e, msg: "Cannot get food item"})
    }
})


//Get Food Item By Id
router.get("/:id", async(req, res) => {
    try{
        let foods = await Food.findById(req.params.id)
        return res.json(foods)
    } catch(e) {
        return res.json({ e, msg: "Cannot get food item" })
    }
})


//Add Food Item
router.post("/", auth, upload.single("image"), (req, res) => {
    try{
        if(req.user.isAdmin){
            let food = new Food(req.body);
            food.image = "public/" + req.file.filename;
            food.save();
            return res.json({ food, msg: "Food item added successfully"})
        } else {
            return res.status(401).json({ msg: "Unauthorized"})
        }
    } catch(e) {    
        return res.status(400).json({ e , msg: "Unauthorized"})
    }
})


//Update Food Item
router.put("/:id", auth, upload.single("image"), async( req, res ) => {
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ msg: "No Food Item found" })

        if(!req.user.isAdmin) return res.status(401).json({msg: "Not authorized"})

        let currentFood = await Food.findById(req.params.id)

        let food = await Food.findByIdAndUpdate(req.params.id, {...req.body, image: req.file ? "public/" + req.file.filename : currentFood.image}, {new: true})

        if( req.file && food.image) fs.unlinkSync(path.join(__dirname, "../" + currentFood.image))

        return res.json({ msg: "Food item updated successfully", food})
    } catch(e) {
        return res.status(400).json({e, msg: "Cannot update this item"})
    }
})


//Delete Food Item
router.delete("/:id", auth, async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.json({ msg: "No Food Item Found" })

        if(req.user.isAdmin) {
            const food = await Food.findById(req.params.id);
            const filename = food.image;
            const filepath = path.join(__dirname, "../" + filename)
            fs.unlinkSync(filepath);
            await Food.findByIdAndDelete(food._id)
            return res.json({ msg: "Food item deleted successfully", food})
        } else {
            return res.status(401).json({msg: "Unauthorized"})
        }
    } catch(e) {
        return res.status(400).json({e , msg: "Unauthorized"})
    }   
})




module.exports = router;