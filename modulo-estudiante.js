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

  // ==========================
  // Seguimiento (Estudiante)
  // ==========================
  const stSegGrid = document.getElementById('seg-list');
  const stSegQ = document.getElementById('seg-q');
  const stSegEmpty = document.getElementById('seg-empty');
  const stSegDetail = document.getElementById('seg-detail');
  const stSegId = document.getElementById('seg-det-id');
  const stSegTitle = document.getElementById('seg-title');
  const stSegTipo = document.getElementById('seg-tipo');
  const stSegPrio = document.getElementById('seg-prio');
  const stSegEstado = document.getElementById('seg-estado');
  const stSegCreado = document.getElementById('seg-creado');
  const stSegActual = document.getElementById('seg-actual');
  const stSegFiles = document.getElementById('seg-files');
  const stSegTl = document.getElementById('seg-tl');
  // File preview/download (Estudiante)
  const stFileModal = document.getElementById('st-file-modal');
  const stFileClose = document.getElementById('st-file-close');
  const stFileMeta = document.getElementById('st-file-meta');
  const stFilePreview = document.getElementById('st-file-preview');
  const stFileDl = document.getElementById('st-file-dl');
  let stFileCtx = { id:null, file:null };
  function stOpenFileModal(id, file){
    stFileCtx = { id, file };
    if(stFileMeta) stFileMeta.textContent = `${file.name}${file.size? ' · '+file.size:''}`;
    if(stFilePreview) stFilePreview.textContent = 'No hay vista previa disponible para este archivo.';
    if(stFileModal) stFileModal.hidden = false;
  }
  function stCloseFileModal(){ stFileCtx = { id:null, file:null }; if(stFileModal) stFileModal.hidden = true; }
  function stDownloadFile(id, file){
    const blob = new Blob([`Contenido simulado para ${file.name} del caso ${id}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  }
  if(stFileClose){ stFileClose.addEventListener('click', stCloseFileModal); }
  if(stFileModal){ stFileModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) stCloseFileModal(); }); }
  if(stFileDl){ stFileDl.addEventListener('click', ()=>{ if(stFileCtx.file) stDownloadFile(stFileCtx.id, stFileCtx.file); }); }

  let stSegRows = [
    { id: 'C-2101', titulo: 'Cambio de carrera - Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'Etapa 2/5', fecha:'2025-09-25', creado:'2025-09-10', actual:'2025-09-18', files:[{name:'carta.pdf', size:'120KB'}], tl:[
      {name:'Solicitud recibida', meta:'2025-09-10 · 09:44', desc:'Tu solicitud fue registrada en el sistema.', state:'done'},
      {name:'Revisión de documentos', meta:'2025-09-12 · 13:02', desc:'Se revisó la documentación.', state:'done'},
      {name:'Enviado a coordinación', meta:'2025-09-17 · 10:21', desc:'En evaluación por coordinación.', state:'current'},
      {name:'Resolución final', meta:'Pendiente', desc:'A la espera de resolución.', state:'pending'}
    ]},
    { id: 'C-2102', titulo: 'Homologación de materias - María López', tipo:'Homologación', prioridad:'Urgente', estado:'Etapa 3/5', fecha:'2025-09-27', creado:'2025-09-08', actual:'2025-09-19', files:[], tl:[
      {name:'Solicitud recibida', meta:'2025-09-08 · 10:00', state:'done'},
      {name:'Revisión de documentos', meta:'2025-09-09 · 15:10', state:'done'},
      {name:'Enviado a coordinación', meta:'2025-09-12 · 12:20', state:'current'},
      {name:'Resolución final', meta:'Pendiente', state:'pending'}
    ]},
    { id: 'C-2103', titulo: 'Certificado de matrícula - Carlos Ruiz', tipo:'Certificados académicos', prioridad:'Media', estado:'Etapa 2/5', fecha:'2025-09-22', creado:'2025-09-05', actual:'2025-09-15', files:[{name:'solicitud.pdf', size:'90KB'}], tl:[
      {name:'Solicitud recibida', meta:'2025-09-05 · 09:44', state:'done'},
      {name:'Revisión de documentos', meta:'2025-09-06 · 13:02', state:'current'},
      {name:'Emisión de certificado', meta:'Pendiente', state:'pending'}
    ]}
  ];

  let stSegFilter = '';
  function stRenderSegList(){
    if(!stSegGrid) return;
    stSegGrid.innerHTML = '';
    stSegRows
      .filter(r => !stSegFilter || JSON.stringify(r).toLowerCase().includes(stSegFilter))
      .forEach(r => {
        const li = document.createElement('li');
        li.className = 'seg-item';
        li.dataset.id = r.id;
        li.innerHTML = `
          <div class="seg-it-row"><span class="seg-it-id">${r.id}</span> <span class="seg-it-title">${r.titulo}</span></div>
          <div class="seg-it-sub">${r.tipo} · ${r.prioridad} · ${r.estado}${r.fecha? ' · vence '+r.fecha: ''}</div>
        `;
        stSegGrid.appendChild(li);
      });
    const first = stSegGrid.querySelector('.seg-item');
    if(first){ first.click(); }
  }

  function stRenderSegDetail(row){
    if(!row || !stSegDetail || !stSegEmpty) return;
    stSegEmpty.hidden = true; stSegDetail.hidden = false;
    stSegId.textContent = row.id;
    stSegTitle.textContent = row.titulo;
    stSegTipo.textContent = row.tipo;
    stSegPrio.textContent = row.prioridad;
    stSegEstado.textContent = row.estado;
    stSegCreado.textContent = row.creado || '—';
    stSegActual.textContent = row.actual || '—';
    // archivos
    stSegFiles.innerHTML = '';
    (row.files||[]).forEach(f=>{
      const li = document.createElement('li');
        li.innerHTML = `<span class="file-ico">📎</span><span class="file-name">${f.name}</span><span class="file-size">${f.size||''}</span><span class="file-actions"><button class="btn-ghost btn-small js-view" type="button">Ver</button><button class="btn-primary btn-small js-dl" type="button">Descargar</button></span>`;
      li.addEventListener('click', (ev)=>{
        const t = ev.target;
        if(!(t instanceof HTMLElement)) return;
        if(t.classList.contains('js-view')){ stOpenFileModal(row.id, f); }
        else if(t.classList.contains('js-dl')){ stDownloadFile(row.id, f); }
      });
      stSegFiles.appendChild(li);
    });
    // trazabilidad
    stSegTl.innerHTML = '';
    (row.tl||[]).forEach(step=>{
      const li = document.createElement('li');
      li.className = `tl-item ${step.state||''}`;
      li.innerHTML = `
        <div class="tl-dot">${step.state==='done'?'✔':step.state==='current'?'⌛':'•'}</div>
        <div class="tl-body">
          <div class="tl-title">${step.name||'—'}</div>
          <div class="tl-meta">${step.meta||''}</div>
          ${step.desc? `<div class="tl-desc">${step.desc}</div>`:''}
        </div>`;
      stSegTl.appendChild(li);
    });
  }

  if(stSegGrid){
    stRenderSegList();
    stSegGrid.addEventListener('click', (e)=>{
      const it = e.target.closest('.seg-item');
      if(!it) return;
      stSegGrid.querySelectorAll('.seg-item').forEach(x=>x.classList.remove('active'));
      it.classList.add('active');
      const row = stSegRows.find(r => r.id === it.dataset.id);
      stRenderSegDetail(row);
    });
  }

  if(stSegQ){
    stSegQ.addEventListener('input', () => {
      stSegFilter = (stSegQ.value||'').toLowerCase().trim();
      stRenderSegList();
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

  // Dashboard: click on notifications → open the exact same item in Notificaciones (no creation)
  const dashNotif = document.querySelector('#view-dashboard .notif');
  if (dashNotif){
    dashNotif.addEventListener('click', (e)=>{
      const item = e.target.closest('.notif__item');
      if(!item) return;
      const title = item.querySelector('.notif__title')?.textContent?.trim() || '';
      const desc = item.querySelector('.notif__desc')?.textContent?.trim() || '';
      // Go to Notificaciones view
      const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='notificaciones');
      nav?.click();
      // Ensure we open a matching existing notification; do not create new ones
      setTimeout(()=>{
        const list = document.getElementById('notif-list');
        if(!list){ return; }
        const cards = Array.from(list.querySelectorAll('.notif-card'));
        // 1) Match by title + description
        let match = cards.find(li => {
          const t = li.querySelector('.notif-card__title')?.textContent?.trim() || '';
          const d = li.querySelector('.notif-card__desc')?.textContent?.trim() || '';
          return t === title && d === desc;
        });
        // 2) Fallback: match by title only
        if(!match && title){
          match = cards.find(li => (li.querySelector('.notif-card__title')?.textContent?.trim() || '') === title);
        }
        // 3) Last fallback: open the first card
        if(!match){ match = cards[0] || null; }
        const primary = match?.querySelector('.pill--primary');
        if(primary){ primary.click(); }
      }, 60);
    });
  }

  // Dashboard: Calendar deep-link to trámites con fecha límite
  // Mapa de fechas destacadas en el calendario -> ID de trámite del catálogo
  // El calendario visible es de "April 2025" con días resaltados: 10, 14, 16, 20, 24.
  // Usaremos un mapeo fijo de demo al catálogo existente.
  const calendarMap = {
    // día: ID de catálogo
    '10': 'S-2012', // Certificado de conducta
    '14': 'S-2002', // Homologación de materias
    '16': 'S-2003', // Cambio de carrera
    '20': 'S-2011', // Solicitud de beca
    '24': 'S-2001', // Certificados académicos
  };

  function goToSolicitudById(catId){
    // Cambiar a la vista de Solicitudes
    const navItem = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='solicitudes');
    if(navItem){ navItem.click(); }
    // Esperar a que el grid esté en el DOM y simular click en la tarjeta
    setTimeout(()=>{
      const card = document.querySelector(`.soli-card[data-id="${catId}"]`);
      if(card){
        card.dispatchEvent(new MouseEvent('click', { bubbles:true }));
        showStatus('Abriendo trámite desde el calendario…','info');
      } else {
        // Si aún no se renderiza, forzar render y reintentar
        try{ renderStudentCards(); }catch{}
        const again = document.querySelector(`.soli-card[data-id="${catId}"]`);
        if(again){
          again.dispatchEvent(new MouseEvent('click', { bubbles:true }));
          showStatus('Abriendo trámite desde el calendario…','info');
        } else {
          showStatus('No se encontró el trámite asociado.','warn');
        }
      }
    }, 50);
  }

  // Acciones rápidas (Estudiante)
  const qa = document.getElementById('st-qa');
  if (qa){
    qa.addEventListener('click', (e)=>{
      const btn = e.target.closest('.qa-item');
      if(!btn) return;
      const act = btn.getAttribute('data-act');
      if(act === 'new'){
        // Ir a Solicitudes y abrir el primer trámite útil (Certificados académicos)
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='solicitudes');
        nav?.click();
        setTimeout(()=>{
          try{ renderStudentCards(); }catch{}
          const target = document.querySelector('.soli-card[data-id="S-2001"]') || document.querySelector('.soli-card');
          if(target){ target.dispatchEvent(new MouseEvent('click', { bubbles:true })); }
          showStatus('Crea tu nueva solicitud','info');
        }, 60);
      } else if (act === 'ai'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='asistente');
        nav?.click();
        setTimeout(()=>{ document.getElementById('chat-input')?.focus(); }, 30);
        showStatus('Abriendo asistente IA…', 'info');
      } else if (act === 'buscar'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='seguimiento');
        nav?.click();
        setTimeout(()=>{ document.getElementById('seg-texto')?.focus(); }, 30);
        showStatus('Ir a seguimiento para buscar','info');
      } else if (act === 'config'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='notificaciones');
        nav?.click();
        setTimeout(()=>{ document.getElementById('cfg-mail')?.focus(); }, 30);
        showStatus('Abriendo configuración de notificaciones','info');
      }
    });
  }

  // Vincular clicks a días del calendario
  const calendar = document.querySelector('#view-dashboard .calendar');
  if(calendar){
    calendar.addEventListener('click', (e)=>{
      const day = e.target.closest('.day');
      if(!day) return;
      const val = day.textContent.trim();
      const id = calendarMap[val];
      if(id){
        goToSolicitudById(id);
      }
    });
    // Accesibilidad por teclado
    calendar.querySelectorAll('.day').forEach(d => {
      d.setAttribute('tabindex','0');
      d.setAttribute('role','button');
      d.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){
          ev.preventDefault();
          const val = d.textContent.trim();
          const id = calendarMap[val];
          if(id) goToSolicitudById(id);
        }
      });
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
  const stCertTipoWrap = document.getElementById('st-cert-tipo-wrap');
  const stEta = document.getElementById('st-eta');
  const stReqs = document.getElementById('st-reqs');
  const stExtra = document.getElementById('st-extra');
  const stObsWrap = document.getElementById('st-obs-wrap');
  const stAttachWrap = document.getElementById('st-attach-wrap');
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
    { id:'S-2001', icon:'✈️', titulo:'Certificados académicos', desc:'Notas, récord y constancias', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Cédula o pasaporte','Matrícula vigente','Comprobante de pago'] },
    { id:'S-2002', icon:'📜', titulo:'Homologación de materias', desc:'Evalúa asignaturas cursadas', tipo:'Homologación', prioridad:'Alta', estado:'Requiere revisión', eta:'7-15 días hábiles', reqs:['Solicitud de homologación firmada','Sílabo de asignatura','Certificado de calificaciones'] },
    { id:'S-2003', icon:'🔄', titulo:'Cambio de carrera', desc:'Traslado a otra carrera', tipo:'Cambio de carrera', prioridad:'Alta', estado:'Disponible', eta:'10-20 días hábiles', reqs:['Carta de solicitud','Motivación del cambio','Historial académico'] },
    { id:'S-2004', icon:'🔁', titulo:'Cambio de paralelo', desc:'Cambia tu horario o grupo', tipo:'Otro', prioridad:'Baja', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Carta de solicitud','Justificación del cambio'] },
    { id:'S-2005', icon:'🪪', titulo:'Carné estudiantil', desc:'Genera o renueva tu carné', tipo:'Otro', prioridad:'Baja', estado:'Disponible', eta:'1-5 días hábiles', reqs:['Foto actualizada','Documento de identidad'] },
    { id:'S-2006', icon:'🧑\u200d🎓', titulo:'Aval de prácticas', desc:'Aprobación de prácticas', tipo:'Otro', prioridad:'Media', estado:'Disponible', eta:'5-10 días hábiles', reqs:['Carta de la empresa','Plan de prácticas'] },
    { id:'S-2007', icon:'📨', titulo:'Reactivación de matrícula', desc:'Reingreso tras suspensión', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión', eta:'3-7 días hábiles', reqs:['Solicitud de reactivación','Justificación'] },
    { id:'S-2008', icon:'🧮', titulo:'Corrección de notas', desc:'Rectifica calificaciones', tipo:'Otro', prioridad:'Urgente', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Evidencia de evaluación','Formulario de corrección'] },
    { id:'S-2009', icon:'🎓', titulo:'Solicitud de titulación', desc:'Proceso de titulación', tipo:'Otro', prioridad:'Alta', estado:'Disponible', eta:'15-30 días hábiles', reqs:['Solicitud de titulación','Cumplimiento de requisitos previos'] },
    { id:'S-2010', icon:'🧑\u200d🏫', titulo:'Validación de sílabo', desc:'Verifica contenidos', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión', eta:'3-5 días hábiles', reqs:['Sílabo','Solicitud de validación'] },
    { id:'S-2011', icon:'💳', titulo:'Solicitud de beca', desc:'Aplica a becas y ayudas', tipo:'Otro', prioridad:'Alta', estado:'Disponible', eta:'10-20 días hábiles', reqs:['Formulario de beca','Soporte socioeconómico'] },
    { id:'S-2012', icon:'📝', titulo:'Certificado de conducta', desc:'Emisión de conducta', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Documento de identidad'] },
  ];

  // Eliminado: generación de semestres (no se usa)

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

  // =============================
  // Trámite → esquema de campos
  // =============================
  // Definición simple por tipo/título: qué campos mostrar y sus props
  const formSchemas = {
    'Certificados académicos': {
      showCert: true,
      showObs: false,
      showAttach: true,
      extra: [],
      cert: { showTipo: true }
    },
    'Homologación': {
      showCert: false,
      showObs: true,
      showAttach: true,
      extra: [
        { kind:'text', id:'st-hom-asig', label:'Asignatura a homologar', placeholder:'Nombre de la asignatura' },
        { kind:'text', id:'st-hom-univ', label:'Institución de procedencia', placeholder:'Universidad/Instituto' }
      ]
    },
    'Cambio de carrera': {
      showCert: false,
      showObs: true,
      showAttach: true,
      extra: [
        { kind:'select', id:'st-carr-nueva', label:'Carrera destino', options:['Ingeniería de Software','Ingeniería Industrial','Administración','Contabilidad'] },
        { kind:'select', id:'st-carr-motivo', label:'Motivo', options:['Interés vocacional','Cambio de horario','Desempeño académico','Otros'] }
      ]
    },
    'Otro': {
      showCert: false,
      showObs: true,
      showAttach: true,
      extra: []
    }
  };

  // Overrides por ID de trámite (para afinar qué mostrar/ocultar)
  const idOverrides = {
    'S-2004': { showObs:false }, // Cambio de paralelo
    'S-2005': { showObs:false }, // Carné estudiantil
    'S-2007': { showObs:false }, // Reactivación de matrícula
    'S-2008': { showObs:false }, // Corrección de notas
    'S-2009': { showObs:false }, // Solicitud de titulación
    'S-2010': { showObs:false }, // Validación de sílabo
    'S-2011': { showObs:false }, // Beca
    'S-2012': { showObs:false }, // Certificado de conducta
  };

  function getSchemaFor(item){
    // Base por tipo o fallback a 'Otro'
    const base = formSchemas[item?.tipo] || formSchemas['Otro'];
    // Aplicar overrides por ID si existen
    const ov = idOverrides[item?.id] || {};
    // Derivar showAttach desde reqs si no está explícito
    const hasReqs = Array.isArray(item?.reqs) && item.reqs.length > 0;
    return {
      ...base,
      ...ov,
      showAttach: ov.showAttach ?? base.showAttach ?? hasReqs,
  cert: { ...(base.cert||{}), ...(ov.cert||{}) }
    };
  }

  function renderExtraFields(schema){
    if(!stExtra) return;
    stExtra.innerHTML = '';
    (schema.extra||[]).forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'field';
      if(f.kind === 'text'){
        wrap.innerHTML = `<span class="label">${f.label}</span><input id="${f.id}" class="select" placeholder="${f.placeholder||''}" />`;
      } else if (f.kind === 'select'){
        const opts = (f.options||[]).map(o => `<option>${o}</option>`).join('');
        wrap.innerHTML = `<span class="label">${f.label}</span><select id="${f.id}" class="select">${opts}</select>`;
      } else if (f.kind === 'textarea'){
        wrap.innerHTML = `<span class="label">${f.label}</span><textarea id="${f.id}" class="textarea" placeholder="${f.placeholder||''}"></textarea>`;
      }
      stExtra.appendChild(wrap);
    });
    // ocultar contenedor si no hay campos
    const has = (schema.extra||[]).length > 0;
    stExtra.parentElement && (stExtra.parentElement.hidden = false);
    stExtra.hidden = !has;
  }

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
      // ETA and requisitos
      if(stEta) stEta.value = item.eta || '—';
      if(stReqs){
        stReqs.innerHTML = '';
        (item.reqs||[]).forEach(r => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="file-ico">📌</span><span class="file-name">${r}</span>`;
          stReqs.appendChild(li);
        });
      }
      // Mostrar/ocultar campos según esquema
      const schema = getSchemaFor(item);
      const isCert = !!schema.showCert && item.tipo === 'Certificados académicos';
      stCertWrap.hidden = !isCert;
      if(isCert){
        stCertTipo.value = 'Seleccione una opción';
        const certCfg = schema.cert || {};
        if(stCertTipoWrap) stCertTipoWrap.hidden = certCfg.showTipo === false;
      }
      // Render extra fields
      renderExtraFields(schema);
      // Observaciones / Adjuntos (eliminar visualmente lo que no corresponda)
      if(stObsWrap){
        stObsWrap.hidden = schema.showObs === false;
        if(schema.showObs === false) { stObs.value = ''; }
      }
      if(stAttachWrap){
        const showAt = schema.showAttach !== false;
        stAttachWrap.hidden = !showAt;
        if(!showAt && stDzList){ stDzList.innerHTML = ''; }
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
