```javascript
/* =========================================
   LAURA CHRISTINA SHOP
========================================= */


/* =========================================
   PRODUKTE
========================================= */

const products = {

  "wrong-on-paper": {

    id: "wrong-on-paper",

    name: "Wrong on Paper",

    price: 14.90

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

  openCart();

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

}


/* =========================================
   WARENKORB AKTUALISIEREN
========================================= */

function updateCart() {

  const cartItems =
    document.getElementById(
      "cart-items"
    );


  const cartCount =
    document.getElementById(
      "cart-count"
    );


  const cartTotal =
    document.getElementById(
      "cart-total"
    );


  let total = 0;

  let quantityTotal = 0;


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <p style="
        color:#82756a;
        text-align:center;
        padding:40px 0;
      ">

        Dein Warenkorb ist noch leer.

      </p>

    `;

  } else {

    cartItems.innerHTML =
      cart.map(item => {

        const product =
          products[item.id];


        const itemTotal =
          product.price *
          item.quantity;


        total += itemTotal;

        quantityTotal +=
          item.quantity;


        return `

          <div class="cart-item">

            <div>

              <div class="cart-item-name">

                ${product.name}

              </div>

              <div class="cart-item-price">

                € ${product.price
                  .toFixed(2)
                  .replace(".", ",")}

                × ${item.quantity}

              </div>


              <div class="quantity-controls">

                <button
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

            </div>


            <button
              class="remove-item"
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

  }


  cartCount.textContent =
    quantityTotal;


  cartTotal.textContent =
    "€ " +
    total
      .toFixed(2)
      .replace(".", ",");

}


/* =========================================
   WARENKORB ÖFFNEN
========================================= */

function openCart() {

  document
    .getElementById("cart-drawer")
    .classList.add("active");


  document
    .getElementById("cart-overlay")
    .classList.add("active");

}


/* =========================================
   WARENKORB SCHLIESSEN
========================================= */

function closeCart() {

  document
    .getElementById("cart-drawer")
    .classList.remove("active");


  document
    .getElementById("cart-overlay")
    .classList.remove("active");

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

    Wichtig:
    Der Stripe Secret Key darf NICHT
    hier im Browser stehen.

    Später wird stattdessen z.B.
    /api/create-checkout-session
    aufgerufen.

  */


  alert(
    "Der Stripe-Checkout wird im nächsten Schritt aktiviert."
  );

}


/* =========================================
   INITIALISIERUNG
========================================= */

updateCart();


/* =========================================
   INSTAGRAM
========================================= */

/*
   ACHTUNG:

   Deinen bisherigen Instagram Access Token
   solltest du NICHT mehr direkt hier einsetzen.

   Für die finale Version wird der Instagram
   Feed über das Backend geladen.

*/


async function fetchInstagramPosts() {

  /*
    Wird in Schritt 3/4 über das Backend
    angeschlossen.
  */

}


/* =========================================
   ESC = WARENKORB SCHLIESSEN
========================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeCart();

    }

  }
);
```
