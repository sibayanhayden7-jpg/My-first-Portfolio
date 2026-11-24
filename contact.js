// Contact form: sends to contact/send.php and shows feedback inline (no alert popups).
// Wrapped in a function so it cannot clash with variables in script.js.
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn    = form.querySelector('button[type="submit"]');
  const status = document.getElementById('formStatus');
  const label  = btn.textContent.trim();

  const stamp = () => { form.elements.ts.value = Date.now(); };
  stamp();

  function show(message, type) {            // type: "success" | "error" | "loading"
    status.textContent = message;
    status.className = 'form-status ' + type;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending...';
    show('Sending your message...', 'loading');

    try {
      const res  = await fetch('contact/send.php', { method: 'POST', body: new FormData(form) });
      const data = await res.json();

      if (data.ok) {
        show('✓ ' + data.message, 'success');
        form.reset();
        stamp();
        setTimeout(() => { status.className = 'form-status'; status.textContent = ''; }, 8000);
      } else {
        show('✕ ' + data.message, 'error');
      }
    } catch (err) {
      show('✕ Network error. Please check your connection and try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();