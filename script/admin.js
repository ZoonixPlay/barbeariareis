/* ============================================
   BARBEARIA REIS — admin.js
   ============================================ */

(function () {
  'use strict';

  // ── CONFIG ──
  const SENHA = 'reis'; // Altere a senha aqui!
  let currentFilter = 'todos';
  let cancelTarget  = null;

  // ── LOGIN ──
  window.entrar = function () {
    const val = document.getElementById('senhaInput').value;
    if (val === SENHA) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display  = 'block';
      initDashboard();
    } else {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('senhaInput').value = '';
      document.getElementById('senhaInput').focus();
    }
  };

  window.sair = function () {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display   = 'none';
    document.getElementById('senhaInput').value          = '';
    document.getElementById('loginError').style.display  = 'none';
  };

  // ── STORAGE ──
  function getBookings() {
    try { return JSON.parse(localStorage.getItem('reisBookings') || '[]'); }
    catch (e) { return []; }
  }

  function saveBookings(arr) {
    localStorage.setItem('reisBookings', JSON.stringify(arr));
  }

  // ── DATE / TIME ──
  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(d) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  function updateClock() {
    const now  = new Date();
    const opts = { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' };
    document.getElementById('topDateTime').textContent = now.toLocaleString('pt-BR', opts).toUpperCase();
  }

  // ── STATS ──
  function updateStats() {
    const bookings = getBookings();
    const today    = todayStr();
    document.getElementById('statTotal').textContent       = bookings.length;
    document.getElementById('statHoje').textContent        = bookings.filter(b => b.data === today && b.status !== 'cancelado').length;
    document.getElementById('statConfirmados').textContent = bookings.filter(b => b.status === 'confirmado').length;
    document.getElementById('statCancelados').textContent  = bookings.filter(b => b.status === 'cancelado').length;
  }

  // ── FILTER ──
  window.setFilter = function (f, btn) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
  };

  // ── RENDER TABLE ──
  function renderTable() {
    let bookings = getBookings();
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    const dateF  = document.getElementById('dateFilter').value;
    const today  = todayStr();

    if (currentFilter === 'confirmado') bookings = bookings.filter(b => b.status === 'confirmado');
    else if (currentFilter === 'cancelado') bookings = bookings.filter(b => b.status === 'cancelado');
    else if (currentFilter === 'hoje') bookings = bookings.filter(b => b.data === today);

    if (search) bookings = bookings.filter(b =>
      b.nome.toLowerCase().includes(search) ||
      b.servico.toLowerCase().includes(search) ||
      b.whatsapp.includes(search)
    );

    if (dateF) bookings = bookings.filter(b => b.data === dateF);

    bookings = [...bookings].sort((a, b) => {
      if (a.data !== b.data) return b.data.localeCompare(a.data);
      return b.horario.localeCompare(a.horario);
    });

    document.getElementById('countBadge').textContent = `${bookings.length} registro${bookings.length !== 1 ? 's' : ''}`;

    if (bookings.length === 0) {
      document.getElementById('tableContainer').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">Nenhum registro encontrado</div>
        </div>`;
      return;
    }

    const rows = bookings.map(b => {
      const isToday    = b.data === today;
      const isCanceled = b.status === 'cancelado';
      const wppNum  = b.whatsapp.replace(/\D/g, '');
      const wppMsg  = encodeURIComponent(
        `Olá ${b.nome}! 👋\n✂ Seu agendamento na *Barbearia Reis* está confirmado!\n\n📅 Data: ${formatDate(b.data)}\n⏰ Horário: ${b.horario}\n💈 Serviço: ${b.servico}\n💰 Valor: ${b.preco}\n\nTe esperamos!`
      );
      const wppLink = `https://wa.me/55${wppNum}?text=${wppMsg}`;

      return `
        <tr class="${isCanceled ? 'cancelado' : ''}">
          <td class="td-id">#${String(b.id).padStart(4, '0')}</td>
          <td class="td-name">
            ${b.nome}
            ${isToday && !isCanceled ? '<br><span class="today-chip">HOJE</span>' : ''}
          </td>
          <td class="td-phone">${b.whatsapp}</td>
          <td class="td-service">${b.servico}</td>
          <td class="td-datetime">
            <span class="td-date-val">${formatDate(b.data)}</span><br>
            <span class="td-time-val">${b.horario}</span>
          </td>
          <td class="td-price">${b.preco}</td>
          <td><span class="badge badge-${b.status}">${b.status}</span></td>
          <td>
            <div class="actions">
              <a href="${wppLink}" target="_blank" class="btn-wpp">📱 WhatsApp</a>
              <button class="btn-cancel" onclick="pedirCancelar(${b.id})" ${isCanceled ? 'disabled' : ''}>
                ✕ Cancelar
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    document.getElementById('tableContainer').innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Serviço</th>
            <th>Data / Hora</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    updateStats();
  }

  // ── CANCEL ──
  window.pedirCancelar = function (id) {
    const b = getBookings().find(x => x.id === id);
    if (!b) return;
    cancelTarget = id;
    document.getElementById('cancelModalText').innerHTML =
      `Cancelar agendamento de <strong style="color:var(--white)">${b.nome}</strong>?<br>
       <strong style="color:var(--gold)">${b.servico}</strong> · ${formatDate(b.data)} às ${b.horario}<br><br>
       <small>O horário será liberado para novos agendamentos.</small>`;
    document.getElementById('cancelModal').classList.add('show');
  };

  window.fecharModal = function () {
    document.getElementById('cancelModal').classList.remove('show');
    cancelTarget = null;
  };

  window.executarCancelamento = function () {
    if (cancelTarget === null) return;
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === cancelTarget);
    if (idx >= 0) {
      bookings[idx].status = 'cancelado';
      saveBookings(bookings);
    }
    window.fecharModal();
    renderTable();
  };

  // ── INIT ──
  function initDashboard() {
    updateClock();
    setInterval(updateClock, 30000);
    setInterval(() => { updateStats(); renderTable(); }, 5000);
    renderTable();
    updateStats();
  }

  // ── KEYBOARD ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.fecharModal();
    if (e.key === 'Enter' && document.getElementById('senhaInput') === document.activeElement) {
      window.entrar();
    }
  });

  // ── EXPOSE renderTable for oninput handler ──
  window.renderTable = renderTable;

})();
