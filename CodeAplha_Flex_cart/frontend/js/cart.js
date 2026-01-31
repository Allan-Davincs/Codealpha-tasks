// cart.js

const cartItemsContainer = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const checkoutBtn = document.getElementById("checkout-btn");

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalPriceEl.textContent = "0";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <h4>${item.name}</h4>
      <p>$${item.price}</p>
      <button data-index="${index}">Remove</button>
    `;

    cartItemsContainer.appendChild(div);
  });

  totalPriceEl.textContent = total.toFixed(2);

  // Remove item handlers
  document.querySelectorAll(".cart-item button").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = e.target.dataset.index;
      removeItem(index);
    });
  });
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// Checkout (placeholder for backend)
checkoutBtn.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  alert("Order placed successfully!");
  localStorage.removeItem("cart");
  renderCart();
  updateCartCount();
});

// Initial load
renderCart();
