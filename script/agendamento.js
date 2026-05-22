/* ============================================
   BARBEARIA REIS — agendamento.js
   ============================================ */

(function () {
  'use strict';

  // ── STATE ──
  let selectedService = null;
  let selectedPrice   = null;
  let selectedTime    = null;

  // ── STORAGE HELPERS ──
  function getBookings() {
    try { return JSON.parse(localStorage.getItem('reisBookings') || '[]'); }
    catch (e) { return []; }
  }

  function saveBookings(arr) {
    localStorage.setItem('reisBookings', JSON.stringify(arr));
  }

  function getNextId() {
    const bookings = getBookings();
    return bookings.length;
  }

  // ── TIME SLOTS ──
  const ALL_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00',
                     '13:00','14:00','15:00','16:00','17:00'];

  // ── DATE SETUP — bloqueia datas passadas ──
  function setupDateInput() {
    const dataEl = document.getElementById('data');
    const today  = new Date();
    const yyyy   = today.getFullYear();
    const mm     = String(today.getMonth() + 1).padStart(2, '0');
    const dd     = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    dataEl.min = todayStr;

    // Impede digitação manual de anos anteriores
    dataEl.addEventListener('change', function () {
      if (this.value && this.value < todayStr) {
        this.value = todayStr;
      }
      document.getElementById('sum-date').textContent = formatDate(this.value);
      renderTimeSlots();
    });

    // Também bloqueia no input direto
    dataEl.addEventListener('input', function () {
      if (this.value && this.value < todayStr) {
        this.value = todayStr;
      }
    });
  }

  // ── FORMAT DATE ──
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  // ── RENDER TIME SLOTS ──
  function renderTimeSlots() {
    const dateVal  = document.getElementById('data').value;
    const grid     = document.getElementById('timeGrid');
    const label    = document.getElementById('date-label-slots');

    if (!dateVal) {
      grid.innerHTML  = '<div class="no-times">📅 Selecione uma data para ver os horários disponíveis</div>';
      label.textContent = 'Selecione uma data primeiro';
      return;
    }

    label.textContent = `Horários para ${formatDate(dateVal)}`;

    const bookedTimes = getBookings()
      .filter(b => b.data === dateVal && b.status !== 'cancelado')
      .map(b => b.horario);

    grid.innerHTML = '';
    selectedTime   = null;
    document.getElementById('sum-time').textContent = '—';

    ALL_SLOTS.forEach(slot => {
      const btn = document.createElement('div');
      btn.className   = 'time-btn';
      btn.textContent = slot;

      if (bookedTimes.includes(slot)) {
        btn.classList.add('unavailable');
        btn.title = 'Horário ocupado';
      } else {
        btn.addEventListener('click', () => selectTime(btn, slot));
      }

      grid.appendChild(btn);
    });
  }

  // ── SELECT SERVICE ──
  window.selectService = function (card) {
    document.querySelectorAll('.price-card').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.price-check').textContent = '';
    });
    card.classList.add('selected');
    card.querySelector('.price-check').textContent = '✓';
    selectedService = card.dataset.service;
    selectedPrice   = 'R$ ' + card.dataset.price;
    document.getElementById('sum-service').textContent = selectedService;
    document.getElementById('sum-price').textContent   = selectedPrice;
    card.classList.remove('error');
  };

  // ── SELECT TIME ──
  function selectTime(btn, slot) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTime = slot;
    document.getElementById('sum-time').textContent = slot;
  }

  // ── VALIDATE ──
  function validate() {
    let ok = true;

    ['nome', 'whatsapp', 'data'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('error');
        ok = false;
      } else {
        el.classList.remove('error');
      }
    });

    if (!selectedService) {
      showToast('⚠️ Selecione um serviço!');
      ok = false;
    }

    if (!selectedTime) {
      showToast('⚠️ Selecione um horário!');
      ok = false;
    }

    return ok;
  }

  // ── TOAST ──
  function showToast(msg) {
    let toast = document.getElementById('reis-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'reis-toast';
      toast.style.cssText = `
        position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
        background:#1a1a1a;border:1px solid rgba(201,168,76,0.4);
        color:#c9a84c;padding:14px 28px;font-family:'Barlow Condensed',sans-serif;
        font-size:14px;letter-spacing:2px;z-index:99999;
        transition:opacity .3s;border-radius:2px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
  }

  // ── CONFIRMAR CORTE ──
  window.confirmarAgendamento = function () {
    if (!validate()) return;

    const nome      = document.getElementById('nome').value.trim();
    const whatsapp  = document.getElementById('whatsapp').value.trim();
    const data      = document.getElementById('data').value;
    const id        = getNextId();

    const booking = {
      id,
      nome,
      whatsapp,
      data,
      horario:   selectedTime,
      servico:   selectedService,
      preco:     selectedPrice,
      status:    'confirmado',
      criadoEm:  new Date().toISOString()
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    document.getElementById('sum-id').textContent = `#${String(id).padStart(4, '0')}`;

    document.getElementById('successDetail').innerHTML =
      `<strong>${nome}</strong>, seu <strong>${selectedService}</strong> está marcado para<br>
       <strong>${formatDate(data)}</strong> às <strong>${selectedTime}</strong>.<br><br>
       Aguarde confirmação pelo WhatsApp.`;
    document.getElementById('successId').textContent = `#${String(id).padStart(4, '0')}`;
    document.getElementById('successOverlay').classList.add('show');

    renderTimeSlots();
  };

  // ── CANCELAR FORM (limpar) ──
  window.cancelarForm = function () {
    if (!selectedService && !document.getElementById('nome').value && !selectedTime) return;

    if (!confirm('Deseja limpar todos os dados do formulário?')) return;
    resetForm();
    showToast('🗑 Formulário limpo.');
  };

  // ── FECHAR SUCESSO ──
  window.fecharSucesso = function () {
    document.getElementById('successOverlay').classList.remove('show');
    resetForm();
  };

  function resetForm() {
    document.getElementById('nome').value     = '';
    document.getElementById('whatsapp').value = '';
    document.getElementById('data').value     = '';
    selectedService = null;
    selectedPrice   = null;
    selectedTime    = null;

    document.querySelectorAll('.price-card').forEach(c => {
      c.classList.remove('selected', 'error');
      c.querySelector('.price-check').textContent = '';
    });

    document.getElementById('sum-id').textContent      = '#—';
    document.getElementById('sum-service').textContent = '—';
    document.getElementById('sum-price').textContent   = '—';
    document.getElementById('sum-date').textContent    = '—';
    document.getElementById('sum-time').textContent    = '—';

    renderTimeSlots();
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    setupDateInput();
    renderTimeSlots();
  });

})();
