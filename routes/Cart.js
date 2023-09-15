const express = require("express");
const { fetchCartByUser, addToCart, deleteFromCart, updateCart } = require("../controller/Cart");
const router =express.Router();
router.post('/',addToCart)
      .get('/',fetchCartByUser)
      .delete('/:id',deleteFromCart)
      .patch('/:id',updateCart)

exports.router = router;
