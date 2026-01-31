// product.js

const productDetails = document.getElementById("product-details");

// Same products list (later fetched from API)
const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 25,
    description: "Ergonomic wireless mouse with long battery life.",
    image: "assets/images/mouse.png"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 80,
    description: "RGB mechanical keyboard for fast typing.",
    image: "assets/images/keyboard.png"
  },
  {
    id: 3,
    name: "Bluetooth Headphones",
    price: 60,
    description: "Noise-isolating wireless headphones.",
    image: "assets/images/headphones.png"
  }
];

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

const product = products.find(p => p.id === productId);

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Product added to cart!");
  updateCartCount();
}

if (product) {
  productDetails.innerHTML = `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <h3>$${product.price}</h3>
      <button id="add-to-cart">Add to Cart</button>
    </div>
  `;

  document
    .getElementById("add-to-cart")
    .addEventListener("click", () => addToCart(product));
} else {
  productDetails.innerHTML = "<p>Product not found.</p>";
}
