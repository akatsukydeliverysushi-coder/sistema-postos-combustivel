const AUTH_STYLE = `
#auth-screen{position:fixed;inset:0;z-index:9999;background:linear-gradient(135deg,#111827,#1f2937);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}.auth-card{width:min(430px,100%);background:#fff;border-radius:18px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.auth-card h2{margin:0 0 6px}.auth-card p{color:#6b7280;margin:0 0 20px}.auth-tabs{display:flex;gap:8px;margin-bottom:18px}.auth-tabs button{flex:1;padding:11px;border:1px solid #d1d5db;border-radius:10px;background:#f3f4f6;cursor:pointer}.auth-tabs button.active{background:#111827;color:#fff}.auth-field{margin:12px 0}.auth-field label{display:block;font-weight:600;margin-bottom:6px}.auth-field input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:10px;font-size:16px}.auth-submit{width:100%;padding:13px;border:0;border-radius:10px;background:#111827;color:#fff;font-weight:700;cursor:pointer;margin-top:8px}.auth-secondary{width:100%;padding:10px;border:0;background:transparent;color:#374151;cursor:pointer}.auth-error{display:none;background:#fee2e2;color:#991b1b;padding:10px;border-radius:8px;margin:12px 0;font-size:14px}.auth-hint{font-size:12px!important;margin-top:12px!important}
`;
const style=document.createElement('style');style.textContent=AUTH_STYLE;document.head.appendChild(style);

const ADMIN_EMAIL='admin@sistemapostos.com';
function authEmailFromPhone(phone){const digits=String(phone||'').replace(/\D/g,'');if(digits.length<10)return null;return `${digits}@gerente.sistema-postos.local`;}
function showAuth(){
 let old=document.getElementById('auth-screen');if(old)old.remove();
 const box=document.createElement('div');box.id='auth-screen';
 box.innerHTML=`<div class="auth-card"><h2>⛽ Sistema de Postos</h2><p>Acesso seguro ao sistema</p><div class="auth-tabs"><button id="tab-adm" class="active">ADM</button><button id="tab-ger">Gerente</button></div><form id="auth-form"><div class="auth-field"><label id="auth-user-label">E-mail</label><input id="auth-user" required autocomplete="username" placeholder="admin@sistemapostos.com"></div><div class="auth-field"><label>Senha</label><input id="auth-pass" type="password" required minlength="6" autocomplete="current-password" placeholder="Senha"></div><div id="auth-error" class="auth-error"></div><button class="auth-submit" type="submit">Entrar</button><button id="btn-primeiro-adm" class="auth-secondary" type="button">Criar primeiro ADM</button></form></div>`;
 document.body.appendChild(box);
 let mode='adm';const user=box.querySelector('#auth-user'),label=box.querySelector('#auth-user-label');const tabAdm=box.querySelector('#tab-adm'),tabGer=box.querySelector('#tab-ger');
 function setMode(m){mode=m;const adm=m==='adm';tabAdm.classList.toggle('active',adm);tabGer.classList.toggle('active',!adm);label.textContent=adm?'E-mail':'Telefone';user.type=adm?'email':'tel';user.placeholder=adm?ADMIN_EMAIL:'(19) 99999-9999';user.value='';}
 tabAdm.onclick=()=>setMode('adm');tabGer.onclick=()=>setMode('gerente');
 box.querySelector('#btn-primeiro-adm').onclick=async()=>{const email=prompt('Digite o e-mail do primeiro ADM:',ADMIN_EMAIL);if(!email)return;const senha=prompt('Crie uma senha para o ADM (mínimo 6 caracteres):');if(!senha)return;try{const cred=await firebaseAuth.createUserWithEmailAndPassword(email.trim(),senha);await firebaseDb.collection('users').doc(cred.user.uid).set({role:'admin',nome:'Administrador',ativo:true,email:email.trim()},{merge:true});alert('ADM criado. Você já está conectado.');}catch(e){alert(authMessage(e));}};
 box.querySelector('#auth-form').onsubmit=async e=>{e.preventDefault();const err=box.querySelector('#auth-error');err.style.display='none';let login=user.value.trim();if(mode==='gerente'){const em=authEmailFromPhone(login);if(!em){err.textContent='Informe um telefone válido com DDD.';err.style.display='block';return;}login=em;}try{await firebaseAuth.signInWithEmailAndPassword(login,box.querySelector('#auth-pass').value);}catch(e){err.textContent=authMessage(e);err.style.display='block';}};
}
function authMessage(e){const c=e?.code||'';return ({'auth/invalid-credential':'E-mail ou senha incorretos.','auth/user-not-found':'Usuário não encontrado.','auth/wrong-password':'Senha incorreta.','auth/email-already-in-use':'Este usuário já está cadastrado.','auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.','auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos.','auth/network-request-failed':'Falha de conexão com o Firebase.'}[c])||'Não foi possível entrar. Confira os dados e tente novamente.';}

async function ensureUserProfile(user){
 const ref=firebaseDb.collection('users').doc(user.uid);const snap=await ref.get();
 if(snap.exists)return snap.data()||{};
 if((user.email||'').toLowerCase()!==ADMIN_EMAIL)return {__error:'Perfil não cadastrado para este usuário.'};
 const profile={role:'admin',nome:'Administrador',ativo:true,email:user.email||ADMIN_EMAIL};
 await ref.set(profile,{merge:true});
 return profile;
}

function firestoreMessage(e){
 const c=e?.code||'';
 if(c==='permission-denied')return 'Firestore bloqueou o acesso. Publique as regras de segurança para a coleção users.';
 if(c==='failed-precondition')return 'O Firestore ainda não foi criado/ativado neste projeto Firebase.';
 if(c==='unavailable')return 'Firestore está indisponível no momento. Verifique sua conexão.';
 return `Erro no Firestore${c?` (${c})`:''}. Abra o console do navegador (F12) para detalhes.`;
}

firebaseAuth.onAuthStateChanged(async user=>{
 if(!user){document.querySelector('main')?.classList.add('hidden');document.querySelector('header')?.classList.add('hidden');showAuth();return;}
 try{
  const profile=await ensureUserProfile(user);
  if(profile.__error)throw new Error(profile.__error);
  if(profile.ativo===false){await firebaseAuth.signOut();alert('Usuário desativado pelo ADM.');return;}
  document.getElementById('auth-screen')?.remove();document.querySelector('main')?.classList.remove('hidden');document.querySelector('header')?.classList.remove('hidden');
  window.usuarioFirebase={...profile,uid:user.uid,email:user.email};
  const sub=document.getElementById('subtitulo');if(sub)sub.textContent=profile.role==='admin'?'Painel Administrativo':'Painel do Gerente';
  if(profile.role==='gerente'&&profile.postoId&&typeof window.abrirGerentePorPosto==='function')window.abrirGerentePorPosto(profile.postoId);
 }catch(e){console.error('Erro ao carregar perfil:',e);await firebaseAuth.signOut();showAuth();const er=document.getElementById('auth-error');if(er){er.textContent=e?.code==='permission-denied'||e?.code==='failed-precondition'?firestoreMessage(e):(e?.message||'Não foi possível carregar o perfil.');er.style.display='block';}}
});
window.logoutFirebase=()=>firebaseAuth.signOut();