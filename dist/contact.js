const form = document.querySelector('#inquiry');
const status = document.querySelector('#inquiry-status');
const fallback = document.querySelector('#inquiry-whatsapp');
const submit = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submit.disabled) return;

  const fields = new FormData(form);
  const message = [
    'Hi Shiva, I have a project inquiry.',
    '',
    'Name: ' + fields.get('name'),
    'Email: ' + fields.get('email'),
    'Project type: ' + fields.get('type'),
    '',
    fields.get('details')
  ].join('\n');
  const chat = new URL(fallback.href);
  chat.searchParams.set('text', message);
  fallback.hidden = true;
  submit.disabled = true;
  status.textContent = 'Sending by email…';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const endpoint = new URL(form.action);
    endpoint.pathname = '/ajax' + endpoint.pathname;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(fields),
      signal: controller.signal
    });
    const result = await response.json();
    const accepted = result.success === true || result.success === 'true';
    if (!response.ok || !accepted || /activat|confirm your email|check your email/i.test(result.message ?? '')) {
      throw new Error('Email submission was not accepted');
    }
    status.textContent = 'Your inquiry was submitted by email.';
  } catch {
    status.textContent = 'Email could not be confirmed. Review your message in WhatsApp and tap Send.';
    fallback.href = chat.href;
    fallback.hidden = false;
    window.location.assign(chat.href);
  } finally {
    clearTimeout(timeout);
    submit.disabled = false;
  }
});
