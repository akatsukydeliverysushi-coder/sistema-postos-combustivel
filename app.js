const DEFAULT_PRODUCTS = [
  {id:'gasolina-adt',nome:'Gasolina ADT',categoria:'Gasolinas',ativo:true},
  {id:'gasolina-f',nome:'Gasolina F',categoria:'Gasolinas',ativo:true},
  {id:'etanol-adt',nome:'Etanol ADT',categoria:'Etanóis',ativo:true},
  {id:'etanol-f',nome:'Etanol F',categoria:'Etanóis',ativo:true},
  {id:'diesel-s500',nome:'Diesel S500',categoria:'Diesel',ativo:true},
  {id:'diesel-s10',nome:'Diesel S10',categoria:'Diesel',ativo:true}
];
const load=(key,fallback)=>JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));
let produtos=load('produtos_combustivel',DEFAULT_PRODUCTS);
let postos=load('postos_combustivel',[]);
let gerentes=load('gerentes_combustivel',[]);
const save=()=>{localStorage.setItem('produtos_combustivel',JSON.stringify(produtos));localStorage.setItem('postos_combustivel',JSON.stringify(postos));localStorage.setItem('gerentes_combustivel',JSON.stringify(gerentes));};
const esc=t=>String(t??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const id=prefix=>prefix+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const category=p=>p.categoria||'Outros';
function formatL(n){return Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})+' L';}
function renderProdutos(){
 const el=document.getElementById('lista-produtos');
 el.innerHTML=produtos.map((p,i)=>`<div class="data-item"><div class="data-main"><strong>${esc(p.nome)}</strong><small>${esc(category(p))}</small></div><div class="data-actions"><span class="badge ${p.ativo?'':'off'}">${p.ativo?'Ativo':'Inativo'}</span><button class="mini-btn" onclick="editarProduto(${i})">Editar</button><button class="mini-btn" onclick="toggleProduto(${i})">${p.ativo?'Desativar':'Ativar'}</button></div></div>`).join('')||'<p class="empty">Nenhum produto cadastrado.</p>';
}
function renderPostos(){
 const list=document.getElementById('lista-postos');
 list.innerHTML=postos.map((p,i)=>`<div class="data-item"><div class="data-main"><strong>${esc(p.nome)}</strong><small>Código: ${esc(p.codigo||'-')}</small></div><div class="data-actions"><span class="badge ${p.ativo?'':'off'}">${p.ativo?'Ativo':'Inativo'}</span><button class="mini-btn" onclick="editarPosto(${i})">Editar</button><button class="mini-btn" onclick="togglePosto(${i})">${p.ativo?'Desativar':'Ativar'}</button></div></div>`).join('')||'<p class="empty">Nenhum posto cadastrado.</p>';
 const geral=document.getElementById('postos');
 geral.innerHTML=postos.filter(p=>p.ativo).map((p,i)=>`<button class="posto-btn" onclick="selecionarPosto(${postos.indexOf(p)},this)">🏢 ${esc(p.nome)}</button>`).join('')||'<p class="empty">Nenhum posto cadastrado ainda.</p>';
}
function renderGerentes(){
 const el=document.getElementById('lista-gerentes');
 el.innerHTML=gerentes.map((g,i)=>{const p=postos.find(x=>x.id===g.postoId);return `<div class="data-item"><div class="data-main"><strong>${esc(g.nome)}</strong><small>Login: ${esc(g.login)} · Posto: ${esc(p?.nome||'Não vinculado')}</small></div><div class="data-actions"><span class="badge ${g.ativo?'':'off'}">${g.ativo?'Ativo':'Inativo'}</span><button class="mini-btn" onclick="editarGerente(${i})">Editar</button><button class="mini-btn" onclick="toggleGerente(${i})">${g.ativo?'Desativar':'Ativar'}</button></div></div>`}).join('')||'<p class="empty">Nenhum gerente cadastrado.</p>';
}
function renderAll(){renderProdutos();renderPostos();renderGerentes();}
function abrirModal(titulo,html,onSave){
 const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal"><h2>${titulo}</h2><form id="modalForm">${html}<div id="modalError" class="error"></div><div class="form-actions"><button type="button" class="cancel" id="cancelar">Cancelar</button><button type="submit">Salvar</button></div></form></div>`;document.body.appendChild(wrap);
 wrap.querySelector('#cancelar').onclick=()=>wrap.remove();wrap.querySelector('form').onsubmit=e=>{e.preventDefault();try{onSave(new FormData(e.target),wrap)}catch(err){wrap.querySelector('#modalError').textContent=err.message||'Confira os dados.'}};
}
function produtoForm(p={}){return `<div class="field"><label>Nome do produto</label><input name="nome" required value="${esc(p.nome||'')}"></div><div class="field"><label>Categoria</label><select name="categoria"><option ${p.categoria==='Gasolinas'?'selected':''}>Gasolinas</option><option ${p.categoria==='Etanóis'?'selected':''}>Etanóis</option><option ${p.categoria==='Diesel'?'selected':''}>Diesel</option></select></div>`}
function novoProduto(){abrirModal('Novo produto',produtoForm(),(f,w)=>{produtos.push({id:id('prod'),nome:f.get('nome').trim(),categoria:f.get('categoria'),ativo:true});save();renderAll();w.remove()})}
function editarProduto(i){abrirModal('Editar produto',produtoForm(produtos[i]),(f,w)=>{produtos[i].nome=f.get('nome').trim();produtos[i].categoria=f.get('categoria');save();renderAll();w.remove()})}
function toggleProduto(i){produtos[i].ativo=!produtos[i].ativo;save();renderAll()}
function postoForm(p={}){return `<div class="field"><label>Nome do posto</label><input name="nome" required value="${esc(p.nome||'')}"></div><div class="field"><label>Código do posto</label><input name="codigo" value="${esc(p.codigo||'')}"></div>`}
function novoPosto(){abrirModal('Novo posto',postoForm(),(f,w)=>{postos.push({id:id('posto'),nome:f.get('nome').trim(),codigo:f.get('codigo').trim(),ativo:true});save();renderAll();w.remove()})}
function editarPosto(i){abrirModal('Editar posto',postoForm(postos[i]),(f,w)=>{postos[i].nome=f.get('nome').trim();postos[i].codigo=f.get('codigo').trim();save();renderAll();w.remove()})}
function togglePosto(i){postos[i].ativo=!postos[i].ativo;save();renderAll()}
function gerenteForm(g={}){return `<div class="field"><label>Nome</label><input name="nome" required value="${esc(g.nome||'')}"></div><div class="field"><label>Login</label><input name="login" required value="${esc(g.login||'')}"></div><div class="field"><label>Senha</label><input name="senha" type="password" ${g.id?'':'required'} placeholder="${g.id?'Deixe em branco para manter a atual':''}"></div><div class="field"><label>Posto</label><select name="postoId" required>${postos.map(p=>`<option value="${p.id}" ${p.id===g.postoId?'selected':''}>${esc(p.nome)}</option>`).join('')}</select></div>`}
function novoGerente(){if(!postos.length)return alert('Cadastre um posto antes de cadastrar um gerente.');abrirModal('Novo gerente',gerenteForm(),(f,w)=>{gerentes.push({id:id('ger'),nome:f.get('nome').trim(),login:f.get('login').trim(),senha:f.get('senha'),postoId:f.get('postoId'),ativo:true});save();renderGerentes();w.remove()})}
function editarGerente(i){abrirModal('Editar gerente',gerenteForm(gerentes[i]),(f,w)=>{const g=gerentes[i];g.nome=f.get('nome').trim();g.login=f.get('login').trim();if(f.get('senha'))g.senha=f.get('senha');g.postoId=f.get('postoId');save();renderGerentes();w.remove()})}
function toggleGerente(i){gerentes[i].ativo=!gerentes[i].ativo;save();renderGerentes()}
function zerarCards(){['gasolina-adt','gasolina-f','etanol-adt','etanol-f','diesel-s500','diesel-s10','total-gasolinas','total-etanol','total-diesel'].forEach(x=>document.getElementById(x).textContent='0,00 L')}
function mostrarGeral(){document.querySelectorAll('.posto-btn').forEach(b=>b.classList.remove('active'));document.getElementById('btnGeral').classList.add('active');document.getElementById('titulo-geral').textContent='Visão Geral';zerarCards()}
function selecionarPosto(index,button){document.querySelectorAll('.posto-btn').forEach(b=>b.classList.remove('active'));button.classList.add('active');document.getElementById('btnGeral').classList.remove('active');document.getElementById('titulo-geral').textContent=postos[index].nome;zerarCards()}
function mudarSecao(nome){document.querySelectorAll('.app-section').forEach(s=>s.classList.add('hidden'));document.getElementById('section-'+nome).classList.remove('hidden');document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.section===nome))}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>mudarSecao(b.dataset.section));
document.getElementById('btnGeral').onclick=mostrarGeral;document.getElementById('novoProduto').onclick=novoProduto;document.getElementById('novoPosto').onclick=novoPosto;document.getElementById('novoGerente').onclick=novoGerente;
renderAll();mostrarGeral();