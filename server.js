
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 5000;
const cors = require('cors');
require("dotenv").config();


const {DB_HOST, DB_NAME, DB_PORT} = process.env

mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)

app.use(cors())
app.use(express.json())
app.use("/users", require("./api/user"))
app.use("/foods", require("./api/food"))
app.use("/carts", require("./api/cart"))
app.use("/orders", require("./api/order"))
app.use(express.json())
app.use(express.static("public"))


app.listen(PORT, () => console.log('Server is running on PORT ' + PORT));
mongoose.connection.once("open", () => console.log("Connected to MongoDB successfully"))