// Estado del carrito
let cart = [];
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cartItems');
const totalPriceEl = document.getElementById('totalPrice');
const cartPanel = document.getElementById('cartPanel');
const overlay = document.getElementById('overlay');
const closeCartBtn = document.getElementById('closeCart');
const cartIcon = document.getElementById('cart-icon');
const checkoutBtn = document.getElementById('checkoutBtn');

// Función para actualizar UI del carrito
function updateCartUI() {
  // Actualizar contador
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalItems;

  // Renderizar items
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p style="text-align:center; color:#8f6e53; margin-top:40px;">Tu carrito está vacío.</p>';
    totalPriceEl.textContent = 'Total: S/ 0.00';
    return;
  }

  let itemsHtml = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    itemsHtml += `
      <div class="cart-item">
        <img src="images/${item.img}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">S/ ${item.price.toFixed(2)} x ${item.quantity}</div>
        </div>
        <button class="remove-item" data-index="${index}" aria-label="Eliminar"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
  });
  cartItemsEl.innerHTML = itemsHtml;
  totalPriceEl.textContent = `Total: S/ ${total.toFixed(2)}`;

  // Asignar eventos a botones eliminar
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      cart.splice(idx, 1);
      updateCartUI();
    });
  });
}

// Agregar al carrito
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const name = e.currentTarget.getAttribute('data-name');
    const price = parseFloat(e.currentTarget.getAttribute('data-price'));
    const img = e.currentTarget.getAttribute('data-img');

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, img, quantity: 1 });
    }
    updateCartUI();
    
    // Feedback visual
    e.currentTarget.innerHTML = '<i class="fas fa-check"></i> Añadido';
    setTimeout(() => {
      e.currentTarget.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
    }, 800);
  });
});

// Abrir carrito
cartIcon.addEventListener('click', (e) => {
  e.preventDefault();
  cartPanel.classList.add('open');
  overlay.classList.add('active');
});

// Cerrar carrito
function closeCart() {
  cartPanel.classList.remove('open');
  overlay.classList.remove('active');
}
closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

// Checkout (simulado)
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío. Agrega productos primero.');
    return;
  }
  alert('¡Gracias por tu pedido en DeliSabor! 🧀🥖\nTotal: ' + totalPriceEl.textContent + '\nRecibirás tu confirmación por correo.');
  cart = [];
  updateCartUI();
  closeCart();
});

// Cierre con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

// Inicializar
updateCartUI();

// ============================================
// FUNCIONALIDAD: ICONO DE INICIO
// ============================================
const homeIcon = document.getElementById('home-icon');
homeIcon.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// FUNCIONALIDAD: BÚSQUEDA
// ============================================
const searchIcon = document.getElementById('search-icon');
const searchModal = document.getElementById('searchModal');
const closeSearchBtn = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Datos de productos disponibles
const allProducts = [
  { id: '1', name: 'Tequeños clásicos', price: '32.50', img: 'tequenos.jpg', description: '12 unidades de masa dorada y queso fundido.' },
  { id: '2', name: 'Pan de guayaba', price: '24.90', img: 'pan-guayaba.jpg', description: 'Pan suave relleno de dulce de guayaba.' },
  { id: '3', name: 'Tequeños grandes', price: '3.00', img: 'tequenos.jpg', description: 'Unidad de masa crujiente y queso derretido.' },
  { id: '4', name: 'Pan de guayaba (unidad)', price: '3.70', img: 'pan-guayaba.jpg', description: 'Unidad de pan suave con guayaba.' },
  { id: '5', name: 'Tequeños pequeños', price: '2.00', img: 'tequenos.jpg', description: 'Unidad pequeña de tequeño crujiente.' },
  { id: '6', name: 'El duo', price: '5.00', img: 'tequenos.jpg', description: 'Combinación de tequeño y pan de guayaba.' }
];

searchIcon.addEventListener('click', (e) => {
  e.preventDefault();
  searchModal.classList.add('open');
  searchInput.focus();
});

closeSearchBtn.addEventListener('click', () => {
  searchModal.classList.remove('open');
  searchResults.innerHTML = '';
  searchInput.value = '';
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  if (query.length === 0) {
    searchResults.innerHTML = '';
    return;
  }
  
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.description.toLowerCase().includes(query)
  );
  
  if (filtered.length === 0) {
    searchResults.innerHTML = '<div class="empty-message">No se encontraron productos.</div>';
    return;
  }
  
  searchResults.innerHTML = filtered.map(p => `
    <div class="search-result-item" onclick="document.querySelector('[data-id=\"${p.id}\"]').click(); searchModal.classList.remove('open');">
      <img src="images/${p.img}" alt="${p.name}">
      <div class="search-result-info">
        <h4>${p.name}</h4>
        <p>S/ ${p.price}</p>
      </div>
    </div>
  `).join('');
});

// Cerrar con click fuera del modal
searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) {
    searchModal.classList.remove('open');
  }
});

// ============================================
// FUNCIONALIDAD: FAVORITOS
// ============================================
const favoritesIcon = document.getElementById('favorites-icon');
const favoritesModal = document.getElementById('favoritesModal');
const closeFavoritesBtn = document.getElementById('closeFavorites');
const favoritesList = document.getElementById('favoritesList');

let favorites = JSON.parse(localStorage.getItem('delisabor-favorites')) || [];

function updateFavoritesUI() {
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<div class="empty-message">No tienes favoritos aún. ¡Agrega tus productos favoritos!</div>';
    favoritesIcon.style.color = '#4e3422';
    return;
  }
  
  favoritesIcon.style.color = '#e85d4f';
  favoritesList.innerHTML = favorites.map((fav, idx) => `
    <div class="favorite-item">
      <img src="images/${fav.img}" alt="${fav.name}">
      <div class="favorite-item-info">
        <h4>${fav.name}</h4>
        <p>S/ ${fav.price}</p>
      </div>
      <button class="remove-favorite" onclick="removeFavorite(${idx})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

function addToFavorites(id, name, price, img) {
  const exists = favorites.find(fav => fav.id === id);
  if (!exists) {
    favorites.push({ id, name, price, img });
    localStorage.setItem('delisabor-favorites', JSON.stringify(favorites));
    updateFavoritesUI();
  }
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem('delisabor-favorites', JSON.stringify(favorites));
  updateFavoritesUI();
}

favoritesIcon.addEventListener('click', (e) => {
  e.preventDefault();
  favoritesModal.classList.add('open');
});

closeFavoritesBtn.addEventListener('click', () => {
  favoritesModal.classList.remove('open');
});

favoritesModal.addEventListener('click', (e) => {
  if (e.target === favoritesModal) {
    favoritesModal.classList.remove('open');
  }
});

// Agregar botón de favoritos a cada producto
document.querySelectorAll('.product-card').forEach(card => {
  const addBtn = card.querySelector('.add-to-cart');
  const productId = addBtn.getAttribute('data-id');
  const productName = addBtn.getAttribute('data-name');
  const productPrice = addBtn.getAttribute('data-price');
  const productImg = addBtn.getAttribute('data-img');
  
  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.innerHTML = '<i class="far fa-heart"></i>';
  favBtn.setAttribute('aria-label', 'Agregar a favoritos');
  favBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: white; border: 2px solid #e85d4f; color: #e85d4f; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; transition: 0.2s; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;';
  
  card.style.position = 'relative';
  card.appendChild(favBtn);
  
  favBtn.addEventListener('click', () => {
    addToFavorites(productId, productName, productPrice, productImg);
    favBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favBtn.style.background = '#e85d4f';
    favBtn.style.color = 'white';
  });
  
  // Verificar si está en favoritos al cargar
  if (favorites.find(fav => fav.id === productId)) {
    favBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favBtn.style.background = '#e85d4f';
    favBtn.style.color = 'white';
  }
});

// Inicializar favoritos
updateFavoritesUI();

// ============================================
// MASCOTA INTERACTIVA
// ============================================
const mascota = document.getElementById('mascota');
const mascotaMessage = document.getElementById('mascotaMessage');

// Mensajes de la mascota
const mascotaMessages = [
  '¡Hola! 👋',
  '¿Quieres probar nuestros tequeños? 🧀',
  '¡Mmm, qué delicia! 😋',
  '¡Bienvenido a DeliSabor! 🎉',
  '¿Ya tienes hambre? 🍽️',
  '¡Nuestros productos son los mejores! ⭐',
  '¿Algo más que desees? 💕',
  '¡Que disfrutes tu compra! 🛍️',
  '¡Te quiero! 💚',
  '¿Necesitas ayuda? 🤔'
];

function showMascotaMessage(message) {
  mascotaMessage.textContent = message;
  mascotaMessage.classList.add('show');
  
  // Ocultar mensaje después de 3 segundos
  setTimeout(() => {
    mascotaMessage.classList.remove('show');
  }, 3000);
}

// Click en la mascota
mascota.addEventListener('click', () => {
  // Animación de bounce
  mascota.classList.remove('clicked');
  void mascota.offsetWidth; // Trigger reflow
  mascota.classList.add('clicked');
  
  // Mostrar mensaje aleatorio
  const randomMessage = mascotaMessages[Math.floor(Math.random() * mascotaMessages.length)];
  showMascotaMessage(randomMessage);
});

// Hover en la mascota
mascota.addEventListener('mouseenter', () => {
  mascota.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.2)) brightness(1.05)';
});

mascota.addEventListener('mouseleave', () => {
  mascota.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
});

// Saludar aleatoriamente cuando carga la página
setTimeout(() => {
  showMascotaMessage('¡Hola! Bienvenido a DeliSabor 👋');
}, 2000);