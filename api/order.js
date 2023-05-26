
const express = require('express')
const router = express.Router()
const Cart = require("../models/Cart")
const Order = require("../models/Order")
const auth = require("../middleware/auth")
const stripe = require("stripe")(
  "sk_test_51NAzFDLPdRylRVj7d2sMiLahtC6AxZ0NRbNp0OH6EC3LRVjvS9MtBKMsn7XujePT8m5zd1axRt7bfAzJ6rFKk9Hy0056nHvyhq"
)

router.post("/", auth, async (req, res) => {
  try {
    // console.log(req.body)
    // return
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      let myOrder = await Order.create({
        user: req.user._id,
        items: cart.items,
        total: cart.total,
      });

      const items = req.body.items;
      let lineItems = [];
      items.forEach((item) => {
        lineItems.push({
          price_data: {
            currency: "myr",
            product_data: {
              name: item.food.name,
            },
            unit_amount: item.food.price * 100,
          },
          quantity: item.quantity,
        });
      });

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: `http://localhost:3000/orders`,
        cancel_url: "http://localhost:3000/cancel",
      });

      await myOrder.save();

      //then empty the cart
      await Cart.findByIdAndDelete(cart._id);
      return res.send(session.url);
    } else {
      return res.json({ msg: "Your cart is empty" });
    }
  } catch (e) {
    return res.json({ msg: "No cart found", e });
  }
});

router.get("/", auth, async (req, res) => {
  console.log(req.user)
  try {
    let orders = []
    if(req.user.isAdmin) {
       orders = await Order.find({}).populate("items.food").populate("user");
    } else {
      orders =  await Order.find({ user: req.user._id }).populate("items.food").populate("user");
    }
    return res.json(orders)
  } catch (e) {
    return res.json({ e, msg: "No orders found" });
  }
});

// router.get("/", auth, async (req, res) => {
//   try {
//     let orders = await Order.find({user: req.params.id}).populate("items.food")
//     // console.log(orders);
//     if (orders && orders.length >= 1) return res.json(orders);
//     return res.json({ msg: "order is empty" });
//   } catch (e) {
//     return res.json({ e, msg: "No orders found" });
//   }
// });

module.exports = router;




// router.post("/", auth, async(req, res) => {
//     try{
//         const cart = await Cart.findOne({ user: req.user._id});
//         if(cart) {
//             let myOrder = await Order.create({
//                 user: req.user._id,
//                 items: cart.items,
//                 total: cart.total
//             })
//             await myOrder.save()

//             //empty the cart
//             await Cart.findByIdAndDelete(cart._id)
//             return res.json({ msg: "Checkout Successful"})
//         } else {
//             return res.json({ msg: "Your cart is empty!" })
//         }
//     } catch(e) {
//         return res.json({ e, msg: "No cart found!" })
//     }
// })

// //view Order
// router.get("/", auth, async(req, res) => {
//     try{
//         let orders = await Order.find({ user: req.user._id});
//         if(orders && orders.length >= 1) return res.json(orders)
//         return res.json({ msg: "Order not found" })
//     } catch(e) {
//         return res.json({ e, msg: "No Orders Found" })
//     }
// })

