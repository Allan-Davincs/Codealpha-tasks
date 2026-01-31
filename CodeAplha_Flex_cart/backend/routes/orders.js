const express = require("express");
const router = express.Router();

// Temporary order storage
let orders = [];

// POST create order
router.post("/", (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const newOrder = {
    id: orders.length + 1,
    items,
    total,
    createdAt: new Date()
  };

  orders.push(newOrder);

  res.status(201).json({
    message: "Order placed successfully",
    order: newOrder
  });
});

// GET all orders (for testing/admin)
router.get("/", (req, res) => {
  res.json(orders);
});

module.exports = router;
