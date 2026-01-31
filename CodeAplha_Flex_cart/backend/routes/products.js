const express = require("express");
const router = express.Router();

// Sample product data
const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 25,
    description: "Ergonomic wireless mouse",
    image: "mouse.png"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 80,
    description: "RGB mechanical keyboard",
    image: "keyboard.png"
  },
  {
    id: 3,
    name: "Bluetooth Headphones",
    price: 60,
    description: "Noise-isolating headphones",
    image: "headphones.png"
  }
];

// GET all products
router.get("/", (req, res) => {
  res.json(products);
});

// GET single product by ID
router.get("/:id", (req, res) => {
  const product = products.find(
    p => p.id === parseInt(req.params.id)
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

module.exports = router;
