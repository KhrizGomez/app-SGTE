document.addEventListener('DOMContentLoaded', () => {
  // Views
  const pageTitle = document.getElementById('page-title');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSolicitudes = document.getElementById('view-solicitudes');
  const viewSeguimiento = document.getElementById('view-seguimiento');
  const viewAsistente = document.getElementById('view-asistente');
  const viewNotifs = document.getElementById('view-notificaciones');
  const statusBar = document.getElementById('status');
  const pushWrap = document.getElementById('push');

  function hideAll(){
    [viewDashboard, viewSolicitudes, viewSeguimiento, viewAsistente, viewNotifs].forEach(v => {
      if(!v) return; v.classList.remove('view--active'); v.setAttribute('hidden','');
    });
  }

  // Sidebar active switching + view routing
  const items = document.querySelectorAll('.nav__item');
  items.forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    items.forEach(i => i.classList.remove('active'));
    a.classList.add('active');
    const key = a.getAttribute('data-key');
    hideAll();
    if(key === 'dashboard'){
      pageTitle.textContent = 'Panel de control principal';
      viewDashboard.classList.add('view--active');
      viewDashboard.removeAttribute('hidden');
    } else if (key === 'solicitudes'){
      pageTitle.textContent = 'Registro de solicitud';
      viewSolicitudes.classList.add('view--active');
      viewSolicitudes.removeAttribute('hidden');
    } else if (key === 'seguimiento'){
      pageTitle.textContent = 'Seguimiento de trámites';
      if(viewSeguimiento){ viewSeguimiento.classList.add('view--active'); viewSeguimiento.removeAttribute('hidden'); }
    } else if (key === 'asistente'){
      pageTitle.textContent = 'Asistente de inteligencia artificial';
      if(viewAsistente){ viewAsistente.classList.add('view--active'); viewAsistente.removeAttribute('hidden'); }
    } else if (key === 'notificaciones'){
      pageTitle.textContent = 'Configuración y historial de notificaciones';
      if(viewNotifs){ viewNotifs.classList.add('view--active'); viewNotifs.removeAttribute('hidden'); }
    }
  }));

  // Logout: regresar al login
  const logoutBtn = document.querySelector('.power');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Push notifications (emergent top-right)
  function push(msg, kind='info', ms=3000){
    if(!pushWrap){
      if(statusBar){
        statusBar.className = `status ${kind}`;
        statusBar.textContent = msg;
        statusBar.hidden = false;
        clearTimeout(statusBar._t);
        statusBar._t = setTimeout(()=>{ statusBar.hidden = true; }, ms);
      }
      return;
    }
    const el = document.createElement('div');
    el.className = `push ${kind}`;
    el.innerHTML = `<div class="msg">${msg}</div><button class="close" aria-label="Cerrar">×</button>`;
    const closer = el.querySelector('.close');
    const remove = ()=>{ el.style.animation = 'push-out .2s ease-in forwards'; setTimeout(()=> el.remove(), 180); };
    closer?.addEventListener('click', remove);
    pushWrap.appendChild(el);
    setTimeout(remove, ms);
  }

  function showStatus(msg, kind='info', ms=2600){ push(msg, kind, ms); }

  // Buscador (demo) en Seguimiento
  const btnBuscar = document.getElementById('seg-buscar');
  if(btnBuscar){
    btnBuscar.addEventListener('click', () => {
      showStatus('Búsqueda ejecutada (demo)', 'info');
    });
  }

  // Simple bar chart (fake data)
  const data = [8, 11, 1, 12, 5, 7, 2, 4, 6];
  const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
  const bars = document.getElementById('bars');
  const lbls = document.getElementById('bars-labels');
  if (bars && lbls){
    const max = Math.max(...data) || 1;
    data.forEach((v,i) => {
      const b = document.createElement('div');
      b.className = 'bar';
      b.style.height = `${(v/max)*100}%`;
      bars.appendChild(b);
      const l = document.createElement('div');
      l.textContent = labels[i];
      lbls.appendChild(l);
    });
  }

  // Chat básico (demo)
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatClear = document.getElementById('chat-clear');
  function appendUser(text){
    if(!chatWindow) return;
    const wrap = document.createElement('div');
    wrap.className = 'msg msg--user';
    wrap.innerHTML = `<div class="msg__avatar">Tú</div><div class="msg__bubble">${text}<div class="msg__meta">Ahora</div></div>`;
    chatWindow.appendChild(wrap); chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  function appendIA(text){
    if(!chatWindow) return;
    const wrap = document.createElement('div');
    wrap.className = 'msg msg--ia';
    wrap.innerHTML = `<div class="msg__avatar">IA</div><div class="msg__bubble">${text}<div class="msg__meta">Ahora</div></div>`;
    chatWindow.appendChild(wrap); chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  // Autosize textarea
  function autosize(){ if(!chatInput) return; chatInput.style.height = 'auto'; chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px'; }
  if(chatInput){ chatInput.addEventListener('input', autosize); setTimeout(autosize,0); }

  function send(){
    const text = chatInput?.value?.trim();
    if(!text) return; appendUser(text); chatInput.value=''; autosize();
    // Indicador escribiendo…
    if(!chatWindow) return;
    const typing = document.createElement('div');
    typing.className = 'msg msg--ia';
    typing.innerHTML = '<div class="msg__avatar">IA</div><div class="msg__bubble">Escribiendo…</div>';
    chatWindow.appendChild(typing); chatWindow.scrollTop = chatWindow.scrollHeight;
    // Respuesta demo con algunas reglas básicas
    setTimeout(() => {
      typing.remove();
      const lower = text.toLowerCase();
      let resp = 'Gracias por tu consulta. En breve agregaremos conexión con el backend.';
      if(lower.includes('certificado')){
        resp = 'Para solicitar un certificado académico: ingresa a Solicitudes > Certificados académicos, selecciona el tipo (notas, récord, constancia), adjunta requerimientos y envía. Tiempo estimado: 1-3 días hábiles.';
      } else if(lower.includes('homolog')){
        resp = 'Requisitos para homologación: sílabo de la asignatura, certificado de calificaciones, y solicitud firmada. Evaluación por coordinación ~ 7-15 días.';
      } else if(lower.includes('cuánto') || lower.includes('tiempo')){
        resp = 'El tiempo de procesamiento varía por trámite: certificados (1-3 días), homologación (7-15 días), validación de sílabos (3-5 días).';
      }
      appendIA(resp);
    }, 600);
  }
  if(chatSend){ chatSend.addEventListener('click', send); }
  if(chatInput){
    chatInput.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
    });
  }
  if(chatClear && chatWindow){ chatClear.addEventListener('click', ()=>{ chatWindow.innerHTML=''; }); }
  // Sugerencias
  document.querySelectorAll('.sugg').forEach(a => a.addEventListener('click', (e)=>{
    e.preventDefault(); const q = a.getAttribute('data-q'); if(q && chatInput){ chatInput.value = q; send(); }
  }));

  // Dropzone básico en Solicitudes
  // Nuevo: Solicitudes Estudiante como cards + modal con filtros
  const sgrid = document.getElementById('st-sgrid');
  const stBuscar = document.getElementById('st-buscar');
  const stFilTipo = document.getElementById('st-fil-tipo');
  const stFilPrio = document.getElementById('st-fil-prio');
  const stFilEstado = document.getElementById('st-fil-estado');
  const stFilClear = document.getElementById('st-fil-clear');

  const stModal = document.getElementById('st-modal');
  const stClose = document.getElementById('st-close');
  const stForm = document.getElementById('st-form');
  const stId = document.getElementById('st-id');
  const stTramite = document.getElementById('st-tramite');
  const stCertWrap = document.getElementById('st-cert-wrap');
  const stCertTipo = document.getElementById('st-cert-tipo');
  const stCertSem = document.getElementById('st-cert-sem');
  const stObs = document.getElementById('st-obs');
  const stDropzone = document.getElementById('st-dropzone');
  const stFileInput = document.getElementById('st-file-input');
  const stDzList = document.getElementById('st-dz-list');
  const stCancel = document.getElementById('st-cancel');

  let stFilter = '';
  let stTipo = '';
  let stPrio = '';
  let stEstado = '';

  // Catálogo de trámites (demo)
  const catalogo = [
    { id:'S-2001', icon:'✈️', titulo:'Certificados académicos', desc:'Notas, récord y constancias', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible' },
    { id:'S-2002', icon:'📜', titulo:'Homologación de materias', desc:'Evalúa asignaturas cursadas', tipo:'Homologación', prioridad:'Alta', estado:'Requiere revisión' },
    { id:'S-2003', icon:'🔄', titulo:'Cambio de carrera', desc:'Traslado a otra carrera', tipo:'Cambio de carrera', prioridad:'Alta', estado:'Disponible' },
    { id:'S-2004', icon:'🔁', titulo:'Cambio de paralelo', desc:'Cambia tu horario o grupo', tipo:'Otro', prioridad:'Baja', estado:'Disponible' },
    { id:'S-2005', icon:'🪪', titulo:'Carné estudiantil', desc:'Genera o renueva tu carné', tipo:'Otro', prioridad:'Baja', estado:'Disponible' },
    { id:'S-2006', icon:'🧑\u200d🎓', titulo:'Aval de prácticas', desc:'Aprobación de prácticas', tipo:'Otro', prioridad:'Media', estado:'Disponible' },
    { id:'S-2007', icon:'📨', titulo:'Reactivación de matrícula', desc:'Reingreso tras suspensión', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión' },
    { id:'S-2008', icon:'🧮', titulo:'Corrección de notas', desc:'Rectifica calificaciones', tipo:'Otro', prioridad:'Urgente', estado:'Disponible' },
    { id:'S-2009', icon:'🎓', titulo:'Solicitud de titulación', desc:'Proceso de titulación', tipo:'Otro', prioridad:'Alta', estado:'Disponible' },
    { id:'S-2010', icon:'🧑\u200d🏫', titulo:'Validación de sílabo', desc:'Verifica contenidos', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión' },
    { id:'S-2011', icon:'💳', titulo:'Solicitud de beca', desc:'Aplica a becas y ayudas', tipo:'Otro', prioridad:'Alta', estado:'Disponible' },
    { id:'S-2012', icon:'📝', titulo:'Certificado de conducta', desc:'Emisión de conducta', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible' },
  ];

  function renderStudentCards(){
    if(!sgrid) return;
    sgrid.innerHTML = '';
    catalogo
      .filter(r => {
        const tOk = !stTipo || r.tipo === stTipo;
        const pOk = !stPrio || r.prioridad === stPrio;
        const eOk = !stEstado || r.estado === stEstado;
        const sOk = !stFilter || `${r.titulo} ${r.tipo} ${r.desc}`.toLowerCase().includes(stFilter);
        return tOk && pOk && eOk && sOk;
      })
      .forEach(r => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'soli-card';
        card.dataset.id = r.id;
        card.innerHTML = `
          <span class="soli-ico" aria-hidden="true">${r.icon}</span>
          <span class="soli-txt">
            <span class="soli-title">${r.titulo}</span>
            <span class="soli-desc">${r.desc}</span>
          </span>`;
        sgrid.appendChild(card);
      });
  }
  renderStudentCards();

  // Filtros
  if (stBuscar){ stBuscar.addEventListener('input', ()=>{ stFilter = stBuscar.value.trim().toLowerCase(); renderStudentCards(); }); }
  if (stFilTipo){ stFilTipo.addEventListener('change', ()=>{ stTipo = stFilTipo.value; renderStudentCards(); }); }
  if (stFilPrio){ stFilPrio.addEventListener('change', ()=>{ stPrio = stFilPrio.value; renderStudentCards(); }); }
  if (stFilEstado){ stFilEstado.addEventListener('change', ()=>{ stEstado = stFilEstado.value; renderStudentCards(); }); }
  if (stFilClear){ stFilClear.addEventListener('click', ()=>{
    stFilter = stTipo = stPrio = stEstado = '';
    if (stBuscar) stBuscar.value = '';
    if (stFilTipo) stFilTipo.value = '';
    if (stFilPrio) stFilPrio.value = '';
    if (stFilEstado) stFilEstado.value = '';
    renderStudentCards();
  }); }

  // Abrir modal al seleccionar un trámite
  function openStModal(){ if(stModal) stModal.hidden = false; }
  function closeStModal(){ if(stModal) stModal.hidden = true; }
  if (sgrid){
    sgrid.addEventListener('click', (e)=>{
      const btn = e.target.closest('.soli-card');
      if(!btn) return;
      const id = btn.dataset.id;
      const item = catalogo.find(x => x.id === id);
      if(!item) return;
      stId.value = item.id;
      stTramite.value = item.titulo;
      stObs.value = '';
      // Campos específicos para certificados
      const isCert = item.tipo === 'Certificados académicos';
      stCertWrap.hidden = !isCert;
      if(isCert){
        stCertTipo.value = 'Seleccione una opción';
        stCertSem.value = 'Seleccione una opción';
      }
      // Limpiar adjuntos previos
      if(stDzList) stDzList.innerHTML = '';
      openStModal();
    });
  }
  if (stClose){ stClose.addEventListener('click', closeStModal); }
  if (stModal){ stModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeStModal(); }); }
  if (stCancel){ stCancel.addEventListener('click', closeStModal); }

  // Dropzone dentro del modal
  if (stDropzone && stFileInput && stDzList){
    stDropzone.addEventListener('click', () => stFileInput.click());
    stDropzone.addEventListener('dragover', (e) => { e.preventDefault(); stDropzone.classList.add('is-over'); });
    stDropzone.addEventListener('dragleave', () => stDropzone.classList.remove('is-over'));
    stDropzone.addEventListener('drop', (e) => {
      e.preventDefault(); stDropzone.classList.remove('is-over');
      stHandleFiles(e.dataTransfer.files);
    });
    stFileInput.addEventListener('change', () => stHandleFiles(stFileInput.files));

    function stHandleFiles(files){
      Array.from(files).forEach(f => {
        const item = document.createElement('div');
        item.className = 'dz-item';
        item.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
        stDzList.appendChild(item);
      });
      stFileInput.value = '';
    }
  }

  if (stForm){
    stForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const id = stId.value;
      const tramite = stTramite.value;
  showStatus(`Solicitud enviada: ${tramite} (Ref: ${id})`, 'success');
      closeStModal();
    });
  }

  // Notificaciones: detalle + leído + deep-link
  const notifList = document.getElementById('notif-list');
  const stNotifModal = document.getElementById('st-notif-modal');
  const stNotifClose = document.getElementById('st-notif-close');
  const stNotifIco = document.getElementById('st-notif-ico');
  const stNotifHead = document.getElementById('st-notif-head');
  const stNotifDesc = document.getElementById('st-notif-desc');
  const stNotifTime = document.getElementById('st-notif-time');
  const stNotifGoto = document.getElementById('st-notif-goto');
  const stNotifMark = document.getElementById('st-notif-mark');
  let stNotifCtx = { li:null, caseId:null };

  function stOpenNotifModal(fromLi){
    stNotifCtx.li = fromLi;
    const icon = fromLi.querySelector('.notif-card__icon')?.textContent?.trim() || '🔔';
    const title = fromLi.querySelector('.notif-card__title')?.textContent?.trim() || 'Notificación';
    const desc = fromLi.querySelector('.notif-card__desc')?.textContent?.trim() || '';
    const time = fromLi.querySelector('.notif-card__time')?.textContent?.trim() || '';
    stNotifCtx.caseId = (desc.match(/(C-\d{4})/)||[])[1] || null;
    if(stNotifIco) stNotifIco.textContent = icon;
    if(stNotifHead) stNotifHead.textContent = title;
    if(stNotifDesc) stNotifDesc.textContent = desc;
    if(stNotifTime) stNotifTime.textContent = time;
    if(stNotifModal) stNotifModal.hidden = false;
  }
  function stCloseNotifModal(){ if(stNotifModal) stNotifModal.hidden = true; }
  stNotifClose?.addEventListener('click', stCloseNotifModal);
  stNotifModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) stCloseNotifModal(); });

  // Delegate clicks in notif list
  if(notifList){
    notifList.addEventListener('click', (e)=>{
      const t = e.target;
      if(!(t instanceof HTMLElement)) return;
      const li = t.closest('.notif-card');
      if(!li) return;
      if(t.classList.contains('js-read')){
        li.style.opacity = .55; t.setAttribute('disabled',''); t.textContent = 'Leído';
        try{ showStatus('Notificación marcada como leída','success'); }catch{}
        return;
      }
      // If clicked primary button or body, open details
      if(t.classList.contains('pill--primary') || t.classList.contains('notif-card__body') || t.closest('.notif-card__body')){
        stOpenNotifModal(li);
      }
    });
  }

  stNotifMark?.addEventListener('click', ()=>{
    const btn = stNotifCtx.li?.querySelector('.js-read');
    if(btn){ btn.click(); }
    else { try{ showStatus('Notificación marcada como leída','success'); }catch{} }
    stCloseNotifModal();
  });
  stNotifGoto?.addEventListener('click', ()=>{
    // Cambiar a Seguimiento
    const navItem = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='seguimiento');
    if(navItem){ navItem.click(); }
    stCloseNotifModal();
  });

  // Preferencias de canales (localStorage demo)
  const storageKey = 'sgte_notif_prefs';
  const inputs = ['cfg-wa','cfg-mail','cfg-app','cfg-sms']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const btnSave = document.getElementById('cfg-save');
  const btnReset = document.getElementById('cfg-reset');
  // Cargar
  try{
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    inputs.forEach(inp => { if(saved[inp.id] !== undefined) inp.checked = !!saved[inp.id]; });
  }catch{}
  // Guardar
  if(btnSave){ btnSave.addEventListener('click', ()=>{
    const prefs = {}; inputs.forEach(inp => prefs[inp.id] = inp.checked);
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  showStatus('Preferencias guardadas', 'success');
  });}
  // Restablecer
  if(btnReset){ btnReset.addEventListener('click', ()=>{
    inputs.forEach(inp => inp.checked = (inp.id==='cfg-mail' || inp.id==='cfg-app'));
    localStorage.removeItem(storageKey);
  });}
});
