const form = document.querySelector('#inquiry');
const draftStatus = document.querySelector('#inquiry-status');
const emailLink = document.querySelector('#inquiry-email');
const whatsappLink = document.querySelector('#inquiry-whatsapp');
const submit = form.querySelector('button[type="submit"]');
const recipient = emailLink.getAttribute('href');
const whatsappNumber = whatsappLink.href;

form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const subject = 'Portfolio inquiry: ' + fields.get('type');
  const message = [
    'Hi Shiva, I have a project inquiry.',
    '',
    'Name: ' + fields.get('name'),
    'Email: ' + fields.get('email'),
    'Project type: ' + fields.get('type'),
    '',
    fields.get('details')
  ].join('\r\n');

  emailLink.href = recipient + '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(message);
  const chat = new URL(whatsappNumber);
  chat.searchParams.set('text', message);
  whatsappLink.href = chat.href;
  emailLink.hidden = false;
  whatsappLink.hidden = false;
  draftStatus.textContent = 'Your draft is ready.';
});

form.addEventListener('input', () => {
  emailLink.hidden = true;
  whatsappLink.hidden = true;
  draftStatus.textContent = '';
});

submit.disabled = false;
