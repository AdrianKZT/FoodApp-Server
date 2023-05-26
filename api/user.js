
const express = require('express');
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


//Validation for email
function validateEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return re.test(String(email).toLowerCase())
}

//Register
router.post("/register", async(req, res) => {
    try{
        const {name, password, email} = req.body;

        

        if(!validateEmail(email)){
            return res.status(400).json({msg: "Invalid email format"})
        }

        let userFound = await User.findOne({name})
      
        if(userFound) return res.status(400).json({msg: "User already existed"})

        if(name.length < 3){
            return res.status(400).json({msg: "Name should be at least 3 characters"})
        }


        if(password.length < 5){
            return res.status(400).json({msg: "Password should be at least 8 characters"})
        }

        if(email.length < 5){
            return res.status(400).json({msg: "Email is invalid"})
        }


        let user = new User(req.body)
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)
        user.password = hash
        user.save()
        return res.json({user, msg: "Register successfully!"})
    } catch(e) {
        return res.status(400).json({e, msg: "Failed to register"})
    }
})


//Login
router.post("/login", async(req, res) => {
        try{
            const {name, password} = req.body

            let userFound = await User.findOne({ name })
            
            if(!userFound) return res.status(404).json({msg: "User not found"})

            let isMatch = bcrypt.compareSync(password, userFound.password)
            if(!isMatch) return res.status(400).json({msg: "Invalid credentials"})

            jwt.sign(
                {data: userFound},
                process.env.SECRET_KEY,
                { expiresIn: "1h"},
                (err, token) => {
                    if(err) res.status(400).json({err, msg: "Unable to Login"});
                    return res.send(token)
                }
            )
        } catch(e) {
            return res.status(400).json({e, msg: "Login Failed"})
        }
})

module.exports = router