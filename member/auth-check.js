(async function () {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyfPOvrYT1dFuIqgy7qVpcEnIqbkGFKr0Letp2ru-ljGTGL9pOsJFyeUkIP_35-0umNrg/exec';
  const LOGIN_PAGE = './login.html';

  document.documentElement.style.visibility = 'hidden';

  const token = localStorage.getItem('mark_token');
  const expiry = parseInt(localStorage.getItem('mark_expiry') || '0');
  const userLevel = parseInt(localStorage.getItem('mark_level') || '0');

  function kick() {
    localStorage.removeItem('mark_token');
    localStorage.removeItem('mark_level');
    localStorage.removeItem('mark_expiry');
    window.location.href = LOGIN_PAGE;
  }

  if (!token || Date.now() > expiry) { kick(); return; }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validateToken', token })
    });
    const data = await res.json();

    if (!data.valid) { kick(); return; }

    if (typeof REQUIRED_LEVEL !== 'undefined' && userLevel < REQUIRED_LEVEL) {
      alert('⚠️ 此頁面需要更高等級的會員資格');
      kick();
      return;
    }

    document.documentElement.style.visibility = 'visible';

  } catch (e) {
    document.documentElement.style.visibility = 'visible';
  }
})();
