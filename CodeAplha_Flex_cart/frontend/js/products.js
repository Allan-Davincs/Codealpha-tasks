// products.js

const productList = document.getElementById("product-list");

// Sample products (replace with API later)
const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 25,
    image: "assets/images/mouse.png"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 80,
    image: "assets/images/keyboard.png"
  },
  {
    id: 3,
    name: "Bluetooth Headphones",
    price: 60,
    image: "assets/images/headphones.png"
  }
];

function addToCart(product) {
  // 🔐 Require login
  if (!isLoggedIn()) {
    alert("Please login to add items to cart");
    window.location.href = "login.html";
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
  alert("Added to cart ✅");
}

function renderProducts() {
  productList.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price}</p>

      <div class="product-actions">
        <a href="product.html?id=${product.id}">
          <button class="btn-secondary">View Details</button>
        </a>
        <button class="btn-primary add-cart">Add to Cart</button>
      </div>
    `;

    // Add cart event
    card.querySelector(".add-cart").addEventListener("click", () => {
      addToCart(product);
    });

    productList.appendChild(card);
  });
}

renderProducts();
