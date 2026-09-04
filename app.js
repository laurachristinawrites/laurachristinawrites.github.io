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

let cart =
JSON.parse(
localStorage.getItem("lauraChristinaCart")
) || [];

/* =========================================
WARENKORB SPEICHERN
========================================= */

function saveCart() {

localStorage.setItem(
"lauraChristinaCart",
JSON.stringify(cart)
);

}

/* =========================================
PRODUKT HINZUFÜGEN
========================================= */

function addToCart(productId) {

const product = products[productId];

if (!product) {

 
console.error(
  "Produkt nicht gefunden:",
  productId
);

return;
 

}

const existingProduct =
cart.find(
item =>
item.id === productId
);

if (existingProduct) {

 
existingProduct.quantity++;
 

} else {

 
cart.push({

  id: productId,

  quantity: 1

});
 

}

saveCart();

updateCart();

/*
Kein Drawer mehr:
Der Nutzer sieht die aktualisierte
Anzahl oben rechts.
*/

}

/* =========================================
MENGE ÄNDERN
========================================= */

function changeQuantity(
productId,
amount
) {

const item =
cart.find(
item =>
item.id === productId
);

if (!item) return;

item.quantity += amount;

if (item.quantity <= 0) {

 
cart =
  cart.filter(
    item =>
      item.id !== productId
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

cart =
cart.filter(
item =>
item.id !== productId
);

saveCart();

updateCart();

renderCartPage();

}

/* =========================================
WARENKORB AKTUALISIEREN
========================================= */

function updateCart() {

const cartCount =
document.getElementById(
"cart-count"
);

if (!cartCount) return;

let quantityTotal = 0;

cart.forEach(item => {

 
quantityTotal +=
  item.quantity;
 

});

cartCount.textContent =
quantityTotal;

}

/* =========================================
WARENKORB SEITE ÖFFNEN
========================================= */

function openCart() {

window.location.href =
"warenkorb.html";

}

/* =========================================
CART SEITE RENDERN
========================================= */

function renderCartPage() {

const cartItems =
document.getElementById(
"cart-page-items"
);

const cartTotal =
document.getElementById(
"cart-page-total"
);

if (!cartItems || !cartTotal) return;

let total = 0;

if (cart.length === 0) {

 
cartItems.innerHTML = `

  <div class="empty-cart">

    <h2>Dein Warenkorb ist leer.</h2>

    <p>
      Vielleicht ist das richtige Buch
      ja nur einen Klick entfernt.
    </p>

    <a
      href="shop.html"
      class="continue-shopping"
    >
      Zum Shop
    </a>

  </div>

`;


cartTotal.textContent =
  "€ 0,00";


return;
 

}

cartItems.innerHTML =
cart.map(item => {

 
  const product =
    products[item.id];


  if (!product) return "";


  const itemTotal =
    product.price *
    item.quantity;


  total += itemTotal;


  return `

    <div class="cart-page-item">

      <div class="cart-page-product">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div class="cart-page-product-info">

          <h2>
            ${product.name}
          </h2>

          <p>
            Taschenbuch
          </p>

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
          onclick="
            changeQuantity(
              '${product.id}',
              -1
            )
          "
        >
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button
          type="button"
          onclick="
            changeQuantity(
              '${product.id}',
              1
            )
          "
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
        onclick="
          removeFromCart(
            '${product.id}'
          )
        "
      >
        Entfernen
      </button>

    </div>

  `;

}).join("");
 

cartTotal.textContent =
"€ " +
total
.toFixed(2)
.replace(".", ",");

}

/* =========================================
CHECKOUT
========================================= */

function checkout() {

if (cart.length === 0) {

 
alert(
  "Dein Warenkorb ist noch leer."
);

return;
 

}

/*
STRIPE KOMMT HIER IN SCHRITT 3.

 
Der Stripe Secret Key darf NICHT
im Browser stehen.

Später wird hier dein Backend
/api/create-checkout-session
aufgerufen.
 

*/

alert(
"Der Stripe-Checkout wird im nächsten Schritt aktiviert."
);

}

/* =========================================
PRODUKTBILDER
========================================= */

function changeProductImage(
button,
imagePath
) {

const mainImage =
document.getElementById(
"main-product-image"
);

if (!mainImage) return;

mainImage.src =
imagePath;

document
.querySelectorAll(
".gallery-thumb"
)
.forEach(
thumb => {

 
    thumb.classList.remove(
      "active"
    );

  }
);
 

button.classList.add(
"active"
);

}

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

/* =========================================
ESC
========================================= */

document.addEventListener(
"keydown",
event => {

 
if (
  event.key === "Escape"
) {

  /*
    Auf der neuen Warenkorb-Seite
    gibt es keinen Drawer mehr.
  */

}
 

}
);

/* =========================================
INSTAGRAM
========================================= */

async function fetchInstagramPosts() {

/*
Wird später über das Backend
angeschlossen.
*/

}
