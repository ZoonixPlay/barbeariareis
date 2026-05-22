/* ============================================
   BARBEARIA REIS — produtos.js
   ============================================ */

(function () {
  'use strict';

  const products = [
    { id:1,  name:"Pomada Strong Hold",        category:"pomada",  icon:"🏺", desc:"Fixação extra forte com brilho moderado. Para looks estruturados e duradouros.",     price:35, badge:"Top" },
    { id:2,  name:"Pomada Matte Effect",        category:"pomada",  icon:"⚫", desc:"Acabamento fosco natural. Ideal para looks modernos sem brilho.",                   price:32, badge:null },
    { id:3,  name:"Pomada Water Based",         category:"pomada",  icon:"💧", desc:"Base d'água, fácil de lavar. Fixação média com brilho sutil.",                      price:28, badge:null },
    { id:4,  name:"Cera de Argila Premium",     category:"pomada",  icon:"🟤", desc:"Textura de argila para volume e definição. Sem resíduo e leve fixação.",            price:38, badge:"Novo" },
    { id:5,  name:"Máquina Cortadora Pro X7",   category:"maquina", icon:"⚡", desc:"Potência profissional, 5 pentes inclusos. Lâmina de aço inox, motor turbo.",        price:189, badge:"Pro" },
    { id:6,  name:"Máquina de Acabamento Zero", category:"maquina", icon:"🔋", desc:"Sem fio, bateria de longa duração. Perfeita para contorno e acabamento.",           price:145, badge:null },
    { id:7,  name:"Máquina Combo Corte+Barba",  category:"maquina", icon:"✂",  desc:"Kit completo para corte e barba. Inclui 8 pentes e estojo de couro.",              price:220, badge:"Combo" },
    { id:8,  name:"Óleo para Barba",            category:"cuidado", icon:"🌿", desc:"Hidrata, amaicia e dá brilho à barba. Fragrância amadeirada premium.",              price:42, badge:null },
    { id:9,  name:"Shampoo Anticaspa",          category:"cuidado", icon:"🧴", desc:"Fórmula especializada para couro cabeludo. Uso diário, sem ressecar.",              price:25, badge:null },
    { id:10, name:"Balm Pós-Barba",             category:"cuidado", icon:"🌸", desc:"Acalma a pele irritada após o barbear. Hidratação imediata.",                       price:30, badge:null },
  ];

  let cart = {};
  let currentFilter = 'todos';

  // ── RENDER PRODUCTS ──
  function renderProducts(filter = 'todos') {
    const grid     = document.getElementById('productsGrid');
    const filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);
    grid.innerHTML = '';

    filtered.forEach((p, i) => {
      const card = document.createElement('div');
      card.className       = 'product-card';
      card.dataset.category = p.category;

      const catLabel = p.category === 'pomada'  ? '🏺 Pomada'
                     : p.category === 'maquina' ? '⚡ Máquina'
                     :                            '✨ Cuidado';

      card.innerHTML = `
        <div class="product-img">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          ${p.icon}
        </div>
        <div class="product-info">
          <div class="product-category">${catLabel}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-footer">
            <div class="product-price">R$ ${p.price}</div>
            <button class="btn-add" onclick="addToCart(${p.id})">+ Adicionar</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  }

  window.filterProducts = function (cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
  };

  // ── CART ──
  window.addToCart = function (id) {
    if (!cart[id]) cart[id] = { ...products.find(p => p.id === id), qty: 0 };
    cart[id].qty++;
    updateCartCount();
    openCart();
    renderCart();
  };

  window.removeFromCart = function (id) {
    delete cart[id];
    renderCart();
    updateCartCount();
  };

  window.changeQty = function (id, delta) {
    cart[id].qty += delta;
    if (cart[id].qty <= 0) window.removeFromCart(id);
    else { renderCart(); updateCartCount(); }
  };

  function updateCartCount() {
    const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = total;
  }

  function renderCart() {
    const items    = Object.values(cart);
    const itemsEl  = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');

    if (items.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Seu carrinho está vazio.</p>
          <p style="margin-top:8px;font-size:13px;color:rgba(212,197,169,0.5)">Adicione produtos para começar!</p>
        </div>`;
      footerEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-icon">${item.icon}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">R$ ${item.price} cada</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <span class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</span>
      </div>
    `).join('');

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    footerEl.innerHTML = `
      <div class="cart-total">
        <div class="cart-total-line"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2)}</span></div>
        <div class="cart-total-line"><span>Entrega</span><span style="color:var(--gold)">A combinar</span></div>
        <div class="cart-total-final">
          <span>Total</span>
          <span>R$ ${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="btn-checkout" onclick="checkout()">Finalizar Pedido via WhatsApp</button>
    `;
  }

  window.checkout = function () {
    const items = Object.values(cart);
    if (!items.length) return;
    const lista = items.map(i => `${i.qty}x ${i.name} (R$${i.price * i.qty})`).join('%0A');
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const msg   = `Olá Barbearia Reis! Quero fazer um pedido:%0A%0A${lista}%0A%0A*Total: R$${total.toFixed(2)}*`;
    window.open(`https://wa.me/5584900000000?text=${msg}`, '_blank');
  };

  window.openCart = function () {
    renderCart();
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('cartOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.closeCart = function () {
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('show');
    document.body.style.overflow = '';
  };

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
  });

})();
