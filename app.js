const produtos = [
  { id: 'gasolina-adt', nome: 'Gasolina ADT', categoria: 'gasolinas' },
  { id: 'gasolina-f', nome: 'Gasolina F', categoria: 'gasolinas' },
  { id: 'etanol-adt', nome: 'Etanol ADT', categoria: 'etanol' },
  { id: 'etanol-f', nome: 'Etanol F', categoria: 'etanol' },
  { id: 'diesel-s500', nome: 'Diesel S500', categoria: 'diesel' },
  { id: 'diesel-s10', nome: 'Diesel S10', categoria: 'diesel' }
];

let postos = JSON.parse(localStorage.getItem('postos_combustivel') || '[]');

function mostrarGeral() {
  document.querySelectorAll('.posto-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btnGeral').classList.add('active');
  document.querySelector('.welcome h2').textContent = 'Visão Geral';
}

function renderPostos() {
  const area = document.getElementById('postos');
  if (!postos.length) {
    area.innerHTML = '<p class="empty">Nenhum posto cadastrado ainda.</p>';
    return;
  }
  area.innerHTML = postos.map((posto, i) =>
    `<button class="posto-btn" onclick="selecionarPosto(${i}, this)">🏢 ${escapeHtml(posto.nome || `Posto ${i + 1}`)}</button>`
  ).join('');
}

function selecionarPosto(index, button) {
  document.querySelectorAll('.posto-btn').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  document.getElementById('btnGeral').classList.remove('active');
  document.querySelector('.welcome h2').textContent = postos[index].nome || `Posto ${index + 1}`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

renderPostos();
