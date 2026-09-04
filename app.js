/* =========================================
LAURA CHRISTINA SHOP
========================================= */

/* =========================================
PRODUKTE
========================================= */

const products = {
"unfiltered-hearts": {
id: "unfiltered-hearts",
name: "Unfiltered Hearts",
price: 17.99,
image: "./UnfilteredHearts-cover.png"
}
};

/* =========================================
WARENKORB
========================================= */

const STORAGE_KEY = "lauraChristinaCart";

let shoppingCart = [];

try {
shoppingCart =
JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

if (!Array.isArray(shoppingCart)) {
shoppingCart = [];
}
} catch (error) {
console.error("Warenkorb konnte nicht geladen werden:", error);
shoppingCart = [];
}

/* =========================================
WARENKORB SPEICHERN
========================================= */

function saveCart() {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify(shoppingCart)
);
}

/* =========================================
PRODUKT HINZUFÜGEN
========================================= */

function addToCart(productId) {
const product = products[productId];

if (!product) {
console.error("Produkt nicht gefunden:", productId);
return;
}

const existingProduct =
shoppingCart.find(item => item.id === productId);

if (existingProduct) {
existingProduct.quantity++;
} else {
shoppingCart.push({
id: productId,
quantity: 1
});
}

saveCart();
updateCart();

console.log(
`${product.name} wurde zum Warenkorb hinzugefügt.`
);
}

/* =========================================
MENGE ÄNDERN
========================================= */

function changeQuantity(productId, amount) {
const item =
shoppingCart.find(item => item.id === productId);

if (!item) return;

item.quantity += amount;

if (item.quantity <= 0) {
shoppingCart =
shoppingCart.filter(
item => item.id !== productId
);
}

saveCart();
updateCart();
renderCartPage();
}

/* =========================================
PRODUKT ENTFERNEN
========================================= */

function removeFromCart(productId) {
shoppingCart =
shoppingCart.filter(
item => item.id !== productId
);

saveCart();
updateCart();
renderCartPage();
}

/* =========================================
WARENKORB-ANZAHL AKTUALISIEREN
========================================= */

function updateCart() {
const cartCount =
document.getElementById("cart-count");

if (!cartCount) return;

let quantityTotal = 0;

shoppingCart.forEach(item => {
quantityTotal += item.quantity;
});

cartCount.textContent = quantityTotal;
}

/* =========================================
WARENKORB-SEITE ÖFFNEN
========================================= */

function openCart() {
window.location.href = "warenkorb.html";
}

/* =========================================
WARENKORB-SEITE RENDERN
========================================= */

function renderCartPage() {
const cartItems =
document.getElementById("cart-page-items");

const cartTotal =
document.getElementById("cart-page-total");

if (!cartItems || !cartTotal) return;

let total = 0;

if (shoppingCart.length === 0) {
cartItems.innerHTML = `       <div class="empty-cart">         <h2>Dein Warenkorb ist leer.</h2>         <p>
          Vielleicht ist das richtige Buch
          ja nur einen Klick entfernt.         </p>         <a href="shop.html" class="continue-shopping">
          Zum Shop         </a>       </div>
    `;

 
cartTotal.textContent = "€ 0,00";

return;
 

}

cartItems.innerHTML =
shoppingCart.map(item => {

 
  const product = products[item.id];

  if (!product) return "";

  const itemTotal =
    product.price * item.quantity;

  total += itemTotal;

  return `
    <div class="cart-page-item">

      <div class="cart-page-product">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div class="cart-page-product-info">

          <h2>${product.name}</h2>

          <p>Taschenbuch</p>

          <span class="cart-page-price">
            € ${product.price
              .toFixed(2)
              .replace(".", ",")}
          </span>

        </div>

      </div>


      <div class="cart-page-quantity">

        <button
          type="button"
          onclick="changeQuantity('${product.id}', -1)"
        >
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button
          type="button"
          onclick="changeQuantity('${product.id}', 1)"
        >
          +
        </button>

      </div>


      <div class="cart-page-item-total">
        € ${itemTotal
          .toFixed(2)
          .replace(".", ",")}
      </div>


      <button
        type="button"
        class="cart-page-remove"
        onclick="removeFromCart('${product.id}')"
      >
        Entfernen
      </button>

    </div>
  `;

}).join("");
 

cartTotal.textContent =
"€ " +
total.toFixed(2).replace(".", ",");
}

/* =========================================
CHECKOUT
========================================= */

function checkout() {

if (shoppingCart.length === 0) {
alert("Dein Warenkorb ist noch leer.");
return;
}

alert(
"Der Stripe-Checkout wird im nächsten Schritt aktiviert."
);
}

/* =========================================
PRODUKTBILDER
========================================= */

function changeProductImage(button, imagePath) {

const mainImage =
document.getElementById("main-product-image");

if (!mainImage) return;

mainImage.src = imagePath;

document
.querySelectorAll(".gallery-thumb")
.forEach(thumb => {
thumb.classList.remove("active");
});

button.classList.add("active");
}

/* =========================================
INSTAGRAM
========================================= */

async function fetchInstagramPosts() {

/*
Wird später über das Backend
angeschlossen.
*/

}

/* =========================================
FUNKTIONEN GLOBAL VERFÜGBAR MACHEN
========================================= */

window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.checkout = checkout;
window.changeProductImage = changeProductImage;

/* =========================================
INITIALISIERUNG
========================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

 
updateCart();
renderCartPage();
 

}
);
