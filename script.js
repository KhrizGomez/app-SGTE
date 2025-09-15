// Simple UI interactions: toggle role chips and demo form submit

document.addEventListener('DOMContentLoaded', () => {
  const pushWrap = document.getElementById('push');
  function push(msg, kind='info', ms=3000){
    if(!pushWrap){ console.log(`[${kind}]`, msg); return; }
    const el = document.createElement('div');
    el.className = `push ${kind}`;
    el.innerHTML = `<div class="msg">${msg}</div><button class="close" aria-label="Cerrar">×</button>`;
    const closer = el.querySelector('.close');
    const remove = ()=>{ el.style.animation = 'push-out .2s ease-in forwards'; setTimeout(()=> el.remove(), 180); };
    closer?.addEventListener('click', remove);
    pushWrap.appendChild(el);
    setTimeout(remove, ms);
  }
  const chips = Array.from(document.querySelectorAll('.chip'));
  const optsContainer = document.getElementById('role-options');
  let selectedRole = null;

  function renderOptions(role){
    if(!optsContainer) return;
    // Clean existing
    optsContainer.innerHTML = '';

    if(!role){
      optsContainer.hidden = true;
      return;
    }

    if(role === 'estudiante'){
      optsContainer.hidden = false;
      const title = document.createElement('div');
      title.className = 'role-options__title';
      title.textContent = 'Opciones para Estudiante';
      const grid = document.createElement('div');
      grid.className = 'options-grid';

      const options = [
        { key:'dashboard', icon:'📊', title:'Dashboard', desc:'Resumen de tus solicitudes' },
        { key:'solicitudes', icon:'📝', title:'Solicitudes', desc:'Crea y administra solicitudes' },
        { key:'seguimiento', icon:'🔎', title:'Seguimiento', desc:'Consulta el estado en tiempo real' },
        { key:'asistente', icon:'🤖', title:'Asistente IA', desc:'Resuelve dudas con IA' },
        { key:'notificaciones', icon:'🔔', title:'Notificaciones', desc:'Alertas y recordatorios' },
        { key:'perfil', icon:'👤', title:'Perfil', desc:'Configura tu información' },
      ];

      options.forEach(op => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'option-card';
        card.dataset.key = op.key;
        card.innerHTML = `
          <span class="option-card__icon" aria-hidden="true">${op.icon}</span>
          <span class="option-card__text">
            <span class="option-card__title">${op.title}</span>
            <span class="option-card__desc">${op.desc}</span>
          </span>
        `;
        card.addEventListener('click', () => {
          console.log('Estudiante ->', op.key);
          push(`Seleccionaste: ${op.title}`, 'info');
        });
        grid.appendChild(card);
      });

      optsContainer.appendChild(title);
      optsContainer.appendChild(grid);
      return;
    }

    // Otros roles aún no implementados (se puede extender después)
    optsContainer.hidden = true;
  }

  chips.forEach(ch => {
    ch.setAttribute('aria-pressed', 'false');
    ch.addEventListener('click', () => {
      if (selectedRole === ch.dataset.rol) {
        selectedRole = null;
        ch.classList.remove('active');
        ch.setAttribute('aria-pressed', 'false');
        renderOptions(null);
        return;
      }
      chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      ch.classList.add('active');
      ch.setAttribute('aria-pressed', 'true');
      selectedRole = ch.dataset.rol;
      // Ir directo según rol seleccionado (sin mostrar role-options)
      if(selectedRole === 'estudiante'){
        if (optsContainer) optsContainer.hidden = true;
        window.location.href = 'modulo-estudiante.html';
        return;
      }
      if(selectedRole === 'coordinador'){
        if (optsContainer) optsContainer.hidden = true;
        window.location.href = 'modulo-coordinador.html';
        return;
      }
      if(selectedRole === 'decano'){
        if (optsContainer) optsContainer.hidden = true;
        window.location.href = 'modulo-decano.html';
        return;
      }
      // Otros roles: (por ahora) no navegan y pueden mostrar opciones cuando se implementen
      renderOptions(selectedRole);
    });
  });

  const form = document.querySelector('.form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!selectedRole) { push('Selecciona un rol para continuar.', 'warn'); return; }
    // Placeholder: replace with real auth
    console.log('Login:', { ...data, rol: selectedRole });
  push(`Bienvenido, ${data.usuario} (rol: ${selectedRole}).`, 'success');
  });

  // ==============================
  // Solicitud Externa de Credenciales
  // ==============================
  const extOpen = document.getElementById('ext-open');
  const extModal = document.getElementById('ext-modal');
  const extClose = document.getElementById('ext-close');
  const extCancel = document.getElementById('ext-cancel');
  const extForm = document.getElementById('ext-form');
  const extDrop = document.getElementById('ext-drop');
  const extFiles = document.getElementById('ext-files');
  const extList = document.getElementById('ext-filelist');

  function openExt(){ if(extModal) extModal.hidden = false; }
  function closeExt(){ if(extModal) extModal.hidden = true; }
  function bytes(n){
    if(n>=1e6) return (n/1e6).toFixed(1)+' MB';
    if(n>=1e3) return (n/1e3).toFixed(1)+' KB';
    return n+' B';
  }
  function renderFiles(files){
    if(!extList) return;
    extList.innerHTML = '';
    Array.from(files||[]).forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = `<span>📎</span><span class="name">${f.name}</span><span class="size">${bytes(f.size||0)}</span>`;
      extList.appendChild(li);
    });
  }

  if(extOpen){ extOpen.addEventListener('click', openExt); }
  if(extClose){ extClose.addEventListener('click', closeExt); }
  if(extCancel){ extCancel.addEventListener('click', closeExt); }
  if(extModal){ extModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeExt(); }); }

  // Dropzone
  if(extDrop){
    ['dragenter','dragover'].forEach(ev => extDrop.addEventListener(ev, (e)=>{ e.preventDefault(); e.stopPropagation(); extDrop.style.background = '#eef7f0'; }));
    ['dragleave','drop'].forEach(ev => extDrop.addEventListener(ev, (e)=>{ e.preventDefault(); e.stopPropagation(); extDrop.style.background = ''; }));
    extDrop.addEventListener('drop', (e)=>{
      const dt = e.dataTransfer; if(!dt) return;
      const files = dt.files; if(!files?.length) return;
      extFiles.files = files; // mirror into input
      renderFiles(files);
    });
    // click browse
    extDrop.addEventListener('click', (e)=>{
      const target = e.target.closest('.dz-browse');
      if(target){ extFiles?.click(); }
    });
  }
  if(extFiles){ extFiles.addEventListener('change', ()=> renderFiles(extFiles.files)); }

  // Persist request and handoff to coordinación/decano (localStorage queue)
  function saveExternalRequest(payload){
    try{
      const key = 'externalRequests';
      const raw = localStorage.getItem(key);
      const list = raw? JSON.parse(raw) : [];
      list.push(payload);
      localStorage.setItem(key, JSON.stringify(list));
    }catch(err){ console.error('Persistencia falló', err); }
  }

  if(extForm){
    extForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nombre = document.getElementById('ext-nombre')?.value?.trim();
      const email = document.getElementById('ext-email')?.value?.trim();
      const telefono = document.getElementById('ext-telefono')?.value?.trim();
      const idTipo = document.getElementById('ext-id-tipo')?.value || 'Cedula';
      const idNum = document.getElementById('ext-id-num')?.value?.trim();
      const universidad = document.getElementById('ext-universidad')?.value?.trim();
      const programa = document.getElementById('ext-programa')?.value?.trim();
      const motivo = document.getElementById('ext-motivo')?.value?.trim();
      const consent = document.getElementById('ext-consent')?.checked;
      if(!nombre || !email || !telefono || !idNum || !universidad || !programa || !motivo || !consent){ push('Completa todos los campos requeridos y acepta el consentimiento.', 'warn'); return; }
      const files = Array.from(extFiles?.files || []).map(f => ({ name:f.name, size:f.size, type:f.type }));
      if(files.length === 0){
        if(!confirm('No has adjuntado documentos. ¿Deseas continuar?')) return;
      }
      const id = 'EXT-' + (Date.now().toString(36).toUpperCase());
      const payload = {
        id,
        tipo:'Solicitud de credenciales externas',
        titulo:`Credenciales externas — ${nombre}`,
        prioridad:'Media',
        estado:'En proceso',
        creado: new Date().toISOString().slice(0,10),
        actualizado: new Date().toISOString().slice(0,10),
        estudiante: nombre,
        contacto:{ email, telefono },
        documento:{ tipo:idTipo, numero:idNum },
        origen:{ universidad, programa },
        motivo,
        files,
        traza:'validacion',
        current: 0
      };
      saveExternalRequest(payload);
  push('Tu solicitud fue enviada. Coordinación y Decanato serán notificados para su revisión.', 'success');
      closeExt();
      extForm.reset();
      renderFiles([]);
    });
  }

  // ==============================
  // Recuperar contraseña (modal)
  // ==============================
  const forgotLink = document.getElementById('forgot');
  const fpModal = document.getElementById('fp-modal');
  const fpClose = document.getElementById('fp-close');
  const fpCancel = document.getElementById('fp-cancel');
  const fpForm = document.getElementById('fp-form');
  const fpEmail = document.getElementById('fp-email');

  function openFp(){ if(fpModal) fpModal.hidden = false; fpEmail?.focus(); }
  function closeFp(){ if(fpModal) fpModal.hidden = true; }

  if(forgotLink){ forgotLink.addEventListener('click', (e)=>{ e.preventDefault(); openFp(); }); }
  if(fpClose){ fpClose.addEventListener('click', closeFp); }
  if(fpCancel){ fpCancel.addEventListener('click', closeFp); }
  if(fpModal){ fpModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeFp(); }); }
  if(fpForm){
    fpForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = fpEmail?.value?.trim();
  if(!email){ push('Ingresa tu correo institucional', 'warn'); fpEmail?.focus(); return; }
      // Simular envío
  push(`Hemos enviado un enlace de recuperación a ${email}.`, 'success');
      closeFp();
      fpForm.reset();
    });
  }
});
