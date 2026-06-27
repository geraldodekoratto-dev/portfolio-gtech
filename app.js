const CAT_CONFIG = {
  PCP:      { icone: 'fa-industry',         cor: '#00c896', label: 'PCP' },
  Produção: { icone: 'fa-cogs',             cor: '#3b82f6', label: 'Produção' },
  Gestão:   { icone: 'fa-chart-bar',        cor: '#a855f7', label: 'Gestão' },
  Projetos: { icone: 'fa-drafting-compass', cor: '#f59e0b', label: 'Projetos' },
  Outro:    { icone: 'fa-lightbulb',        cor: '#ec4899', label: 'Outro' }
};

let appsGlobal = [];

function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── MENU HAMBÚRGUER ──
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('aberto');
  document.getElementById('hamburger').classList.toggle('ativo');
}
function fecharMenu() {
  document.getElementById('nav-links').classList.remove('aberto');
  document.getElementById('hamburger').classList.remove('ativo');
}

// ── MODAL ──
function abrirModal(id) {
  const app = appsGlobal.find(a => a.id === id);
  if (!app) return;
  const cfg = CAT_CONFIG[app.categoria] || CAT_CONFIG['Outro'];

  const catEl = document.getElementById('modal-cat');
  catEl.innerHTML = `<i class="fas ${cfg.icone}"></i> ${app.categoria}`;
  catEl.style.color = cfg.cor;

  document.getElementById('modal-nome').textContent = app.nome;
  document.getElementById('modal-desc').textContent = app.descricao;

  const link = document.getElementById('modal-link');
  if (app.link) {
    link.href = app.link;
    link.style.display = 'inline-flex';
  } else {
    link.style.display = 'none';
  }

  document.getElementById('modal').classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modal').classList.remove('ativo');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') fecharModal();
  });
  document.getElementById('modal-fechar').addEventListener('click', fecharModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
});

// ── APPS ──
async function carregarApps() {
  const res = await fetch('apps.json');
  const apps = await res.json();
  appsGlobal = apps;
  document.getElementById('total-apps').textContent = apps.length;
  renderApps(apps, 'todos');

  document.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderApps(apps, btn.dataset.cat);
    });
  });
}

function renderApps(apps, cat) {
  const grid = document.getElementById('apps-grid');
  const filtrados = cat === 'todos' ? apps : apps.filter(a => a.categoria === cat);

  if (filtrados.length === 0) {
    grid.innerHTML = '<p style="color:#8a9bb0;text-align:center;grid-column:1/-1;padding:40px">Nenhum app nesta categoria ainda.</p>';
    return;
  }

  grid.innerHTML = filtrados.map(app => {
    const cfg = CAT_CONFIG[app.categoria] || CAT_CONFIG['Outro'];
    const dominio = app.link && app.link.includes('g-tech.live');

    const thumb = app.screenshot
      ? `<img src="${app.screenshot}" alt="${app.nome}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML=buildPlaceholder('${app.nome}','${cfg.cor}','${cfg.icone}')"/>`
      : buildPlaceholder(app.nome, cfg.cor, cfg.icone);

    return `
    <div class="app-card ${app.destaque ? 'destaque' : ''} fade-card" onclick="abrirModal(${app.id})">
      <div class="app-thumb-placeholder" style="background:linear-gradient(135deg,#0a1628,#0d1f38)">
        ${thumb}
      </div>
      <div class="app-body">
        <div class="app-cat">
          ${app.categoria}
          ${app.destaque ? '<span class="destaque-badge">destaque</span>' : ''}
          ${dominio ? '<span class="dominio-badge"><i class="fas fa-globe"></i> g-tech.live</span>' : ''}
        </div>
        <div class="app-nome">${app.nome}</div>
        <div class="app-desc">${app.descricao}</div>
        <span class="app-link">Ver detalhes <i class="fas fa-arrow-right"></i></span>
      </div>
    </div>`;
  }).join('');

  // Animação de entrada com Intersection Observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visivel'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-card').forEach(card => observer.observe(card));
}

function buildPlaceholder(nome, cor, icone) {
  return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div style="width:56px;height:56px;border-radius:16px;background:${cor}22;border:1px solid ${cor}44;display:flex;align-items:center;justify-content:center">
      <i class="fas ${icone}" style="color:${cor};font-size:22px"></i>
    </div>
    <span style="font-size:13px;color:#4a6080;font-weight:500">${iniciais(nome)}</span>
  </div>`;
}

carregarApps();
