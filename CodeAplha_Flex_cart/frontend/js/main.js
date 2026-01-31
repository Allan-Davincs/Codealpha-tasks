// main.js

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;

  const cart = getCart();
  cartCountEl.textContent = cart.length;
}

// Run on page load
updateCartCount();

function isLoggedIn() {
  return !!localStorage.getItem("token");
}
