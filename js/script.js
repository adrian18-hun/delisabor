// ============================================
// DELISABOR · LÓGICA DE LA APLICACIÓN
// ============================================

// ---------- UTILIDADES ----------
const $ = (id) => document.getElementById(id);
const formatPrice = (n) => `S/ ${n.toFixed(2)}`;

function showToast(message, type = 'success') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  $('toastContainer').appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 380);
  }, 2600);
}

// ---------- DATOS DE PRODUCTOS ----------
const allProducts = [
  { id: '3', name: 'Tequeños grandes', price: 3.00, img: 'tequenos.jpg', description: 'Unidad de masa crujiente con queso derretido.' },
  { id: '4', name: 'Pan de guayaba (unidad)', price: 3.70, img: 'pan-guayaba.jpg', description: 'Unidad de pan suave relleno de guayaba.' },
  { id: '5', name: 'Tequeños pequeños', price: 2.00, img: 'tequenos.jpg', description: 'Unidad pequeña de tequeño crujiente.' },
  { id: '6', name: 'El duo', price: 5.00, img: 'tequenos.jpg', description: 'Tequeño grande + pan de guayaba.' }
];

// ============================================
// CARRITO (persistente)
// ============================================
let cart = JSON.parse(localStorage.getItem('delisabor-cart')) || [];
const cartCountEl = $('cart-count');
const cartItemsEl = $('cartItems');
const totalPriceEl = $('totalPrice');
const cartPanel = $('cartPanel');
const overlay = $('overlay');
const closeCartBtn = $('closeCart');
const cartIcon = $('cart-icon');
const checkoutBtn = $('checkoutBtn');
const clearCartBtn = $('clearCart');

function saveCart() {
  localStorage.setItem('delisabor-cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  cartCountEl.textContent = totalItems;

  if (totalItems > 0) {
    cartCountEl.classList.remove('bump');
    void cartCountEl.offsetWidth;
    cartCountEl.classList.add('bump');
  }

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-basket"></i>
        <p>Tu carrito está vacío.</p>
        <p style="font-size:0.85rem;">¡Agrega tus tequeños y panes favoritos!</p>
      </div>`;
    totalPriceEl.textContent = 'S/ 0.00';
    saveCart();
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="images/${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="qty-control">
          <button class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Quitar uno">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-index="${index}" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove="${index}" aria-label="Eliminar"><i class="fas fa-trash-alt"></i></button>
    </div>
  `).join('');

  totalPriceEl.textContent = formatPrice(total);
  saveCart();
}

// Delegación: cantidades y eliminar
cartItemsEl.addEventListener('click', (e) => {
  const qtyBtn = e.target.closest('.qty-btn');
  const removeBtn = e.target.closest('.remove-item');

  if (qtyBtn) {
    const idx = parseInt(qtyBtn.dataset.index, 10);
    const action = qtyBtn.dataset.action;
    if (action === 'increase') {
      cart[idx].quantity += 1;
    } else if (action === 'decrease' && cart[idx].quantity > 1) {
      cart[idx].quantity -= 1;
    }
    updateCartUI();
  }

  if (removeBtn) {
    const idx = parseInt(removeBtn.dataset.remove, 10);
    const removed = cart.splice(idx, 1)[0];
    updateCartUI();
    showToast(`${removed.name} eliminado del pedido`, 'warning');
  }
});

// Agregar producto al carrito
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
  showToast(`${product.name} añadido al pedido 🧺`);
}

// Botones Añadir de los productos
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const original = btn.innerHTML;
    addToCart(btn.dataset.id);
    btn.innerHTML = '<i class="fas fa-check"></i> Añadido';
    btn.style.background = '#2e6b3e';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.style.color = '';
    }, 900);
  });
});

// Abrir / cerrar carrito
cartIcon.addEventListener('click', (e) => {
  e.preventDefault();
  cartPanel.classList.add('open');
  overlay.classList.add('active');
});

function closeCart() {
  cartPanel.classList.remove('open');
  overlay.classList.remove('active');
}
closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

// Vaciar carrito
clearCartBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  cart = [];
  updateCartUI();
  showToast('Carrito vaciado', 'warning');
});

// ============================================
// CHECKOUT (por WhatsApp)
// ============================================
const checkoutModal = $('checkoutModal');
const checkoutSummary = $('checkoutSummary');
const checkoutForm = $('checkoutForm');
const WA_NUMBER = '51987654321';

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Tu carrito está vacío. Agrega productos primero.', 'error');
    return;
  }
  // Resumen del pedido
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  checkoutSummary.innerHTML = cart.map(item =>
    `<p><span>${item.name} × ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)}</span></p>`
  ).join('') + `<p class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></p>`;

  closeCart();
  checkoutModal.classList.add('open');
});

function closeCheckout() {
  checkoutModal.classList.remove('open');
  checkoutForm.reset();
}
$('closeCheckout').addEventListener('click', closeCheckout);
checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) closeCheckout();
});

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = $('customerName').value.trim();
  const phone = $('customerPhone').value.trim().replace(/\D/g, '');
  const address = $('customerAddress').value.trim();
  const notes = $('orderNotes').value.trim();
  const payment = checkoutForm.querySelector('input[name="payment"]:checked').value;

  if (!name) return showToast('Ingresa tu nombre', 'error');
  if (phone.length < 9) return showToast('Ingresa un teléfono válido', 'error');

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  let message = `¡Hola DeliSabor! 🧀🥖 Quiero hacer un pedido:\n\n`;
  cart.forEach(item => {
    message += `• ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}\n`;
  });
  message += `\n*Total: ${formatPrice(total)}*\n\n`;
  message += `👤 Nombre: ${name}\n`;
  message += `📞 Teléfono: ${phone}\n`;
  if (address) message += `📍 Dirección: ${address}\n`;
  message += `💳 Pago: ${payment}\n`;
  if (notes) message += `📝 Notas: ${notes}\n`;

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

  cart = [];
  updateCartUI();
  closeCheckout();
  showToast('Pedido enviado por WhatsApp. ¡Gracias! 🎉');
});

// ============================================
// BÚSQUEDA
// ============================================
const searchModal = $('searchModal');
const searchInput = $('searchInput');
const searchResults = $('searchResults');

$('search-icon').addEventListener('click', (e) => {
  e.preventDefault();
  searchModal.classList.add('open');
  setTimeout(() => searchInput.focus(), 100);
});

function closeSearch() {
  searchModal.classList.remove('open');
  searchResults.innerHTML = '';
  searchInput.value = '';
}
$('closeSearch').addEventListener('click', closeSearch);
searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) closeSearch();
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    searchResults.innerHTML = '';
    return;
  }

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    searchResults.innerHTML = '<div class="empty-message"><i class="fas fa-search-minus"></i>No se encontraron productos.</div>';
    return;
  }

  searchResults.innerHTML = filtered.map(p => `
    <div class="search-result-item" data-id="${p.id}">
      <img src="images/${p.img}" alt="${p.name}">
      <div class="search-result-info">
        <h4>${p.name}</h4>
        <p>${formatPrice(p.price)}</p>
      </div>
      <span class="btn-tiny">Añadir</span>
    </div>
  `).join('');
});

searchResults.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result-item');
  if (!item) return;
  addToCart(item.dataset.id);
  closeSearch();
});

// ============================================
// FAVORITOS
// ============================================
let favorites = JSON.parse(localStorage.getItem('delisabor-favorites')) || [];
const favoritesModal = $('favoritesModal');
const favoritesList = $('favoritesList');
const favoritesIcon = $('favorites-icon');

function saveFavorites() {
  localStorage.setItem('delisabor-favorites', JSON.stringify(favorites));
}

function updateFavoritesUI() {
  favoritesIcon.style.color = favorites.length ? '#e85d4f' : '#4e3422';

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<div class="empty-message"><i class="fas fa-heart-broken"></i>No tienes favoritos aún. ¡Toca el corazón de un producto!</div>';
    return;
  }

  favoritesList.innerHTML = favorites.map((fav, idx) => `
    <div class="favorite-item">
      <img src="images/${fav.img}" alt="${fav.name}">
      <div class="favorite-item-info">
        <h4>${fav.name}</h4>
        <p>${formatPrice(fav.price)}</p>
      </div>
      <div class="favorite-item-actions">
        <button class="btn-tiny" data-fav-add="${idx}"><i class="fas fa-cart-plus"></i> Añadir</button>
        <button class="remove-favorite" data-fav-remove="${idx}" aria-label="Quitar de favoritos"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function toggleFavorite(product) {
  const idx = favorites.findIndex(f => f.id === product.id);
  if (idx === -1) {
    favorites.push(product);
    showToast(`${product.name} agregado a favoritos ❤️`);
  } else {
    favorites.splice(idx, 1);
    showToast(`${product.name} quitado de favoritos`, 'warning');
  }
  saveFavorites();
  updateFavoritesUI();
  updateFavButtons();
}

favoritesIcon.addEventListener('click', (e) => {
  e.preventDefault();
  favoritesModal.classList.add('open');
});

$('closeFavorites').addEventListener('click', () => favoritesModal.classList.remove('open'));
favoritesModal.addEventListener('click', (e) => {
  if (e.target === favoritesModal) favoritesModal.classList.remove('open');
});

favoritesList.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-fav-add]');
  const removeBtn = e.target.closest('[data-fav-remove]');

  if (addBtn) {
    const fav = favorites[parseInt(addBtn.dataset.favAdd, 10)];
    if (fav) addToCart(fav.id);
  }
  if (removeBtn) {
    favorites.splice(parseInt(removeBtn.dataset.favRemove, 10), 1);
    saveFavorites();
    updateFavoritesUI();
    updateFavButtons();
    showToast('Eliminado de favoritos', 'warning');
  }
});

// Corazones en las tarjetas de producto
function updateFavButtons() {
  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = btn.dataset.id;
    const isFav = favorites.some(f => f.id === id);
    if (isFav) {
      btn.innerHTML = '<i class="fas fa-heart"></i>';
      btn.style.background = '#e85d4f';
      btn.style.color = '#fff';
    } else {
      btn.innerHTML = '<i class="far fa-heart"></i>';
      btn.style.background = 'rgba(255,255,255,0.95)';
      btn.style.color = '#e85d4f';
    }
  });
}

document.querySelectorAll('.product-card').forEach(card => {
  const addBtn = card.querySelector('.add-to-cart');
  const product = allProducts.find(p => p.id === addBtn.dataset.id);

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.dataset.id = product.id;
  favBtn.setAttribute('aria-label', 'Agregar a favoritos');
  favBtn.style.cssText = 'position:absolute; top:12px; right:12px; z-index:4; width:40px; height:40px; border-radius:50%; border:2px solid #e85d4f; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1rem; transition:0.2s; box-shadow:0 4px 10px rgba(0,0,0,0.12);';
  card.appendChild(favBtn);

  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFavorite(product);
  });
});

updateFavButtons();

// ============================================
// HOME (volver arriba)
// ============================================
$('home-icon').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// MASCOTA INTERACTIVA
// ============================================
const mascota = $('mascota');
const mascotaMessage = $('mascotaMessage');

const mascotaMessages = [
  '¡Hola! 👋',
  '¿Quieres probar nuestros tequeños? 🧀',
  '¡Mmm, qué delicia! 😋',
  '¡Bienvenido a DeliSabor! 🎉',
  '¿Ya tienes hambre? 🍽️',
  '¡Nuestros productos son los mejores! ⭐',
  '¿Algo más que desees? 💕',
  '¡Que disfrutes tu compra! 🛍️',
  '¿Necesitas ayuda? 🤔'
];

let mascotaTimer;

function showMascotaMessage(message) {
  mascotaMessage.textContent = message;
  mascotaMessage.classList.add('show');
  clearTimeout(mascotaTimer);
  mascotaTimer = setTimeout(() => mascotaMessage.classList.remove('show'), 3000);
}

mascota.addEventListener('click', () => {
  mascota.classList.remove('clicked');
  void mascota.offsetWidth;
  mascota.classList.add('clicked');
  const msg = mascotaMessages[Math.floor(Math.random() * mascotaMessages.length)];
  showMascotaMessage(msg);
});

setTimeout(() => showMascotaMessage('¡Hola! Bienvenido a DeliSabor 👋'), 2000);

// ============================================
// ESCRITURA DE TECLAS Y CIERRE GLOBAL
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeCart();
  closeSearch();
  favoritesModal.classList.remove('open');
  closeCheckout();
});

// ============================================
// HEADER STICKY + ANIMACIONES DE APARICIÓN
// ============================================
const header = $('mainHeader');
document.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ============================================
// AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
// ============================================
$('year').textContent = new Date().getFullYear();

// ============================================
// INICIALIZACIÓN
// ============================================
updateCartUI();
updateFavoritesUI();