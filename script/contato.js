/* ============================================
   BARBEARIA REIS — contato.js
   ============================================ */

(function () {
  'use strict';

  window.enviarMensagem = function () {
    const nome   = document.getElementById('nome').value.trim();
    const tel    = document.getElementById('tel').value.trim();
    const assunto = document.getElementById('assunto').value;
    const msg    = document.getElementById('msg').value.trim();

    if (!nome) { alert('Por favor, informe seu nome!'); return; }
    if (!msg)  { alert('Por favor, escreva uma mensagem!'); return; }

    document.getElementById('successMsg').classList.add('show');

    if (tel) {
      const text = `Olá! Sou ${nome}.%0AAssunto: ${assunto || 'Contato geral'}%0A%0A${msg}`;
      setTimeout(() => {
        window.open(`https://wa.me/5584900000000?text=${text}`, '_blank');
      }, 1000);
    }

    setTimeout(() => {
      document.getElementById('nome').value    = '';
      document.getElementById('tel').value     = '';
      document.getElementById('assunto').value = '';
      document.getElementById('msg').value     = '';
      document.getElementById('successMsg').classList.remove('show');
    }, 4000);
  };

})();
