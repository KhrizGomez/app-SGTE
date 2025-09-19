document.addEventListener('DOMContentLoaded', () => {
  const pageTitle = document.getElementById('page-title');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSolicitudes = document.getElementById('view-solicitudes');
  const viewSeguimiento = document.getElementById('view-seguimiento');
  const viewNotifs = document.getElementById('view-notificaciones');
  const viewReportes = document.getElementById('view-reportes');
  const statusBar = document.getElementById('status');
  const pushWrap = document.getElementById('push');

  function hideAll(){
    [viewDashboard, viewSolicitudes, viewSeguimiento, viewNotifs, viewReportes].forEach(v => {
      if(!v) return; v.classList.remove('view--active'); v.setAttribute('hidden','');
    });
  }

  // Sidebar routing
  const items = document.querySelectorAll('.nav__item');
  items.forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    items.forEach(i => i.classList.remove('active'));
    a.classList.add('active');
    const key = a.getAttribute('data-key');
    hideAll();
    if(key === 'dashboard'){
      pageTitle.textContent = 'Panel de control principal';
      if(viewDashboard){ viewDashboard.classList.add('view--active'); viewDashboard.removeAttribute('hidden'); }
    } else if (key === 'solicitudes'){
      pageTitle.textContent = 'Solicitudes';
      if(viewSolicitudes){ viewSolicitudes.classList.add('view--active'); viewSolicitudes.removeAttribute('hidden'); }
    } else if (key === 'seguimiento'){
      pageTitle.textContent = 'Seguimiento de trámites';
      if(viewSeguimiento){ viewSeguimiento.classList.add('view--active'); viewSeguimiento.removeAttribute('hidden'); }
    } else if (key === 'notificaciones'){
      pageTitle.textContent = 'Notificaciones';
      if(viewNotifs){ viewNotifs.classList.add('view--active'); viewNotifs.removeAttribute('hidden'); }
    } else if (key === 'reportes'){
      pageTitle.textContent = 'Reportes y análisis';
      if(viewReportes){ viewReportes.classList.add('view--active'); viewReportes.removeAttribute('hidden'); }
      renderReports();
    }
  }));

  // Logout
  const logoutBtn = document.querySelector('.power');
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> window.location.href = 'index.html');

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

  // Bars chart
  const data = [15, 11, 28, 45, 17, 22, 31, 29, 12];
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

  // Dashboard: Calendar deep-link to trámites (Coordinador)
  // Calendario visible "April 2025" con días destacados 10,14,16,20,24
  // Mapeo de demo: día -> ID de trámite (rows)
  const coCalendarMap = {
    '10': 'T-1007', // Certificado de matrícula
    '14': 'T-1008', // Convalidación internacional
    '16': 'T-1012', // Corrección de notas
    '20': 'T-1010', // Cambio de paralelo
    '24': 'T-1011', // Certificado de conducta
  };

  function coGoToTramiteById(tid){
    // Cambiar a la vista Solicitudes
    const navItem = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='solicitudes');
    if(navItem){ navItem.click(); }
    // Asegurar render y abrir modal de edición del trámite
    setTimeout(()=>{
      try{ renderCards(); }catch{}
      const card = document.querySelector(`.soli-card[data-id="${tid}"]`);
      const editBtn = card?.querySelector('.js-edit');
      if(editBtn){
        editBtn.dispatchEvent(new MouseEvent('click', { bubbles:true }));
        showStatus('Abriendo trámite desde el calendario…','info');
      } else {
        showStatus('No se encontró el trámite asociado.','warn');
      }
    }, 60);
  }

  const coCalendar = document.querySelector('#view-dashboard .calendar');
  if(coCalendar){
    coCalendar.addEventListener('click', (e)=>{
      const day = e.target.closest('.day');
      if(!day) return;
      const val = day.textContent.trim();
      const id = coCalendarMap[val];
      if(id){ coGoToTramiteById(id); }
    });
    // Accesibilidad por teclado
    coCalendar.querySelectorAll('.day').forEach(d => {
      d.setAttribute('tabindex','0');
      d.setAttribute('role','button');
      d.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){
          ev.preventDefault();
          const val = d.textContent.trim();
          const id = coCalendarMap[val];
          if(id) coGoToTramiteById(id);
        }
      });
    });
  }

  // Acciones rápidas (Coordinador)
  const coQa = document.getElementById('co-qa');
  if (coQa){
    coQa.addEventListener('click', (e)=>{
      const btn = e.target.closest('.qa-item');
      if(!btn) return;
      const act = btn.getAttribute('data-act');
      if(act === 'new'){
        // Ir a Solicitudes y abrir formulario nuevo
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='solicitudes');
        nav?.click();
        setTimeout(()=>{ document.getElementById('co-nuevo')?.click(); }, 50);
      } else if (act === 'buscar'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='seguimiento');
        nav?.click();
        setTimeout(()=>{ document.getElementById('seg-q')?.focus(); }, 40);
      } else if (act === 'config'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='notificaciones');
        nav?.click();
        setTimeout(()=>{ document.getElementById('co-cfg-mail')?.focus(); }, 40);
      } else if (act === 'reportes'){
        const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='reportes');
        nav?.click();
        setTimeout(()=>{ document.getElementById('rep-q')?.focus(); }, 40);
      }
    });
  }

  // Dashboard: click on notifications → open in Notificaciones modal (Coordinador)
  const coDashNotif = document.querySelector('#view-dashboard .notif');
  if (coDashNotif){
    coDashNotif.addEventListener('click', (e)=>{
      const item = e.target.closest('.notif__item');
      if(!item) return;
      const nav = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='notificaciones');
      nav?.click();
      setTimeout(()=>{
        const rawTitle = item.querySelector('.notif__title')?.textContent || '';
        const baseTitle = rawTitle.replace('•','').trim();
        const list = document.getElementById('co-notif-list');
        let match = null;
        if(list && baseTitle){
          match = Array.from(list.querySelectorAll('.notif-card')).find(li => {
            const t = li.querySelector('.notif-card__title')?.textContent?.replace('•','').trim();
            return t === baseTitle;
          });
        }
        const primary = match?.querySelector('.js-detail');
        if(primary){
          primary.click();
        } else if (list){
          list.querySelector('.notif-card .js-detail')?.click();
        }
      }, 60);
    });
  }

  // Donut: purely CSS via conic-gradient; update center total if needed.
  // If later we need dynamic percentages, we could compute and set style on #donut.

  // ==========================
  // Solicitudes (Coordinador)
  // ==========================
  const grid = document.getElementById('co-sgrid');
  const btnNuevo = document.getElementById('co-nuevo');
  const txtBuscar = document.getElementById('co-buscar');
  const filTipo = document.getElementById('co-fil-tipo');
  const filPrio = document.getElementById('co-fil-prio');
  const filEstado = document.getElementById('co-fil-estado');
  const filClear = document.getElementById('co-fil-clear');

  // Modal refs (created in HTML)
  const modal = document.getElementById('co-modal');
  const modalClose = document.getElementById('co-close');
  const form = document.getElementById('co-form');
  const fldId = document.getElementById('co-id');
  const fldTitulo = document.getElementById('co-titulo');
  const fldTipo = document.getElementById('co-tipo');
  const fldPrioridad = document.getElementById('co-prioridad');
  const fldEstado = document.getElementById('co-estado');
  const fldResp = document.getElementById('co-responsable');
  const fldFecha = document.getElementById('co-fecha');
  const fldDesc = document.getElementById('co-desc');
  const selTraza = document.getElementById('co-traza');
  const tl = document.getElementById('co-tl');
  const customWrap = document.getElementById('co-custom');
  const stepName = document.getElementById('co-step-name');
  const stepRole = document.getElementById('co-step-role');
  const stepAdd = document.getElementById('co-step-add');
  const stepList = document.getElementById('co-steps');
  const btnCancel = document.getElementById('co-cancelar');

  let rows = [
    { id: 'T-1001', titulo: 'Homologación de materias', tipo:'Homologación', prioridad:'Alta', estado:'Publicado', fecha:'2025-09-25', traza:'homologacion', custom:[] },
    { id: 'T-1002', titulo: 'Certificados académicos', tipo:'Certificados académicos', prioridad:'Media', estado:'En revisión', fecha:'2025-09-20', traza:'basico', custom:[] },
    { id: 'T-1003', titulo: 'Cambio de carrera', tipo:'Cambio de carrera', prioridad:'Urgente', estado:'Publicado', fecha:'2025-10-05', traza:'validacion', custom:[] },
    { id: 'T-1004', titulo: 'Baja de matrícula parcial', tipo:'Baja de matrícula', prioridad:'Media', estado:'Borrador', fecha:'2025-09-30', traza:'basico', custom:[] },
    { id: 'T-1005', titulo: 'Solicitud de beca institucional', tipo:'Otro', prioridad:'Urgente', estado:'En revisión', fecha:'2025-09-18', traza:'validacion', custom:[] },
    { id: 'T-1006', titulo: 'Actualización de datos personales', tipo:'Otro', prioridad:'Baja', estado:'Publicado', fecha:'2025-10-10', traza:'basico', custom:[] },
    { id: 'T-1007', titulo: 'Certificado de matrícula', tipo:'Certificados académicos', prioridad:'Media', estado:'Publicado', fecha:'2025-09-22', traza:'basico', custom:[] },
    { id: 'T-1008', titulo: 'Convalidación internacional de asignaturas', tipo:'Homologación', prioridad:'Alta', estado:'En revisión', fecha:'2025-10-01', traza:'homologacion', custom:[] },
    { id: 'T-1009', titulo: 'Reactivación de matrícula', tipo:'Otro', prioridad:'Alta', estado:'En revisión', fecha:'2025-09-28', traza:'validacion', custom:[] },
    { id: 'T-1010', titulo: 'Cambio de paralelo', tipo:'Otro', prioridad:'Baja', estado:'Borrador', fecha:'2025-09-19', traza:'basico', custom:[] },
    { id: 'T-1011', titulo: 'Certificado de conducta', tipo:'Certificados académicos', prioridad:'Media', estado:'Publicado', fecha:'2025-10-03', traza:'basico', custom:[] },
    { id: 'T-1012', titulo: 'Corrección de notas', tipo:'Otro', prioridad:'Urgente', estado:'En revisión', fecha:'2025-09-16', traza:'validacion', custom:[] },
    { id: 'T-1013', titulo: 'Aval de prácticas preprofesionales', tipo:'Otro', prioridad:'Media', estado:'Publicado', fecha:'2025-10-08', traza:'validacion', custom:[] },
    { id: 'T-1014', titulo: 'Solicitud de titulación', tipo:'Otro', prioridad:'Alta', estado:'Borrador', fecha:'2025-11-15', traza:'personalizada', custom:[
      { name:'Recepción', role:'Coordinador' },
      { name:'Verificación de requisitos', role:'Coordinador' },
      { name:'Revisión final', role:'Coordinador' },
      { name:'Aprobación', role:'Decano' },
      { name:'Notificación', role:'Coordinador' },
      { name:'Finalizado', role:'Coordinador' }
    ] },
    { id: 'T-1015', titulo: 'Emisión de carné estudiantil', tipo:'Otro', prioridad:'Baja', estado:'Publicado', fecha:'2025-09-21', traza:'basico', custom:[] },
  ];
  let filter = '';
  let fTipo = '';
  let fPrio = '';
  let fEstado = '';

  function renderCards(){
    if(!grid) return;
    grid.innerHTML = '';
    rows.filter(r => {
        const textOk = !filter || JSON.stringify(r).toLowerCase().includes(filter);
        const tipoOk = !fTipo || r.tipo === fTipo;
        const prioOk = !fPrio || r.prioridad === fPrio;
        const estOk = !fEstado || r.estado === fEstado;
        return textOk && tipoOk && prioOk && estOk;
      })
      .forEach(r => {
        const card = document.createElement('div');
        card.className = 'soli-card';
        card.dataset.id = r.id;
        card.innerHTML = `
          <span class="soli-ico" aria-hidden="true">📄</span>
          <span class="soli-txt">
            <span class="soli-title">${r.titulo}</span>
            <span class="soli-desc">${r.tipo} · ${r.prioridad} · ${r.estado}${r.fecha? ' · vence '+r.fecha: ''}</span>
            <span class="soli-actions">
              <button class="pill pill--primary js-edit" data-id="${r.id}">Editar</button>
              <button class="pill pill--light js-dup" data-id="${r.id}">Duplicar</button>
            </span>
          </span>`;
        grid.appendChild(card);
      });
  }
  renderCards();

  function setFormFrom(row){
    fldId.value = row?.id || '';
    fldTitulo.value = row?.titulo || '';
    fldTipo.value = row?.tipo || '';
    fldPrioridad.value = row?.prioridad || 'Baja';
    fldEstado.value = row?.estado || 'Borrador';
    fldResp.value = row?.responsable || '';
    fldFecha.value = row?.fecha || '';
    fldDesc.value = row?.desc || '';
    selTraza.value = row?.traza || 'basico';
    // custom
    stepList.innerHTML = '';
    (row?.custom || []).forEach((s)=> addStep(s.name || s, s.role || 'Coordinador'));
    updateTrazaPreview();
    handleCustomVisibility();
  }

  function getForm(){
    return {
      id: fldId.value || `T-${Math.floor(Math.random()*9000)+1000}`,
      titulo: fldTitulo.value.trim(),
      tipo: fldTipo.value,
      prioridad: fldPrioridad.value,
      estado: fldEstado.value,
      responsable: fldResp.value.trim(),
      fecha: fldFecha.value,
      desc: fldDesc.value.trim(),
      traza: selTraza.value,
      custom: Array.from(stepList.querySelectorAll('li')).map(li => ({
        name: li.querySelector('.txt')?.textContent.trim() || '',
        role: li.dataset.role || 'Coordinador',
      })),
    };
  }

  function updateTrazaPreview(){
    if(!tl) return;
    tl.innerHTML = '';
    let steps = [];
    const map = {
      basico: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Revisión', role:'Coordinador'},
        {name:'Aprobación', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      validacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Validación documental', role:'Coordinador'},
        {name:'Revisión coordinación', role:'Coordinador'},
        {name:'Aprobación decanato', role:'Decano'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      homologacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Evaluación de homologación', role:'Coordinador'},
        {name:'Resolución', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
    };
    if (selTraza.value === 'personalizada'){
      steps = Array.from(stepList.querySelectorAll('li')).map(li => ({
        name: li.querySelector('.txt')?.textContent.trim() || '',
        role: li.dataset.role || 'Coordinador',
      }));
    } else {
      steps = map[selTraza.value] || map.basico;
    }
    // Determine completed steps count for preview (simple heuristic)
    const doneCount = Math.max(1, Math.min(steps.length, 2));
    steps.forEach((step,idx)=>{
      const li = document.createElement('li');
      const isDone = idx < doneCount;
      const isPending = idx >= doneCount;
      li.className = `tl-item ${isPending?'pending':''}`;
      const roleClass = `role--${(step.role||'Coordinador').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
      li.innerHTML = `
        <div class="tl-dot">${isDone?'✔':'•'}</div>
        <div class="tl-body">
          <div class="tl-title">${step.name}</div>
          <div class="tl-meta">Paso ${idx+1}</div>
          <div class="role role-badge ${roleClass}"><span class="dot"></span>${step.role || 'Coordinador'}</div>
        </div>`;
      tl.appendChild(li);
      if (tl.classList.contains('timeline--h') && idx < steps.length-1){
        const conn = document.createElement('div');
        conn.className = 'tl-connector';
        tl.appendChild(conn);
      }
    });
  }

  function handleCustomVisibility(){
    if(!customWrap) return;
    customWrap.hidden = selTraza.value !== 'personalizada';
  }

  function addStep(name, role='Coordinador'){
    const li = document.createElement('li');
    li.dataset.role = role;
    const roleClass = `role--${role.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
    li.innerHTML = `
      <span class="txt">${name}</span>
      <span class="role"><span class="role-badge ${roleClass}"><span class="dot"></span>${role}</span></span>
      <button class="rm" type="button">Quitar</button>`;
    li.querySelector('.rm').addEventListener('click', ()=>{ li.remove(); updateTrazaPreview(); });
    stepList.appendChild(li);
  }

  function openModal(){ if(modal) modal.hidden = false; }
  function closeModal(){ if(modal) modal.hidden = true; }
  if (btnNuevo){
    btnNuevo.addEventListener('click', ()=>{
      setFormFrom({ estado:'Borrador', prioridad:'Baja', traza:'basico', custom:[] });
      openModal();
      fldTitulo?.focus();
    });
  }
  if (grid){
    grid.addEventListener('click', (e)=>{
      const edit = e.target.closest('.js-edit');
      const dup = e.target.closest('.js-dup');
      const id = (edit||dup)?.getAttribute('data-id');
      if(!id) return;
      const row = rows.find(r => r.id === id);
      if(!row) return;
      if (edit){
        setFormFrom(row); openModal(); fldTitulo?.focus();
      } else if (dup){
        const copy = { ...row, id: `T-${Math.floor(Math.random()*9000)+1000}`, titulo: row.titulo + ' (Copia)' };
        rows.unshift(copy); renderCards();
      }
    });
  }
  if (modalClose){ modalClose.addEventListener('click', closeModal); }
  if (modal){ modal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeModal(); }); }

  if (txtBuscar){
    txtBuscar.addEventListener('input', ()=>{
      filter = txtBuscar.value.trim().toLowerCase();
      renderCards();
    });
  }
  if (filTipo){ filTipo.addEventListener('change', ()=>{ fTipo = filTipo.value; renderCards(); }); }
  if (filPrio){ filPrio.addEventListener('change', ()=>{ fPrio = filPrio.value; renderCards(); }); }
  if (filEstado){ filEstado.addEventListener('change', ()=>{ fEstado = filEstado.value; renderCards(); }); }
  if (filClear){
    filClear.addEventListener('click', ()=>{
      fTipo = fPrio = fEstado = '';
      filter = '';
      if (filTipo) filTipo.value = '';
      if (filPrio) filPrio.value = '';
      if (filEstado) filEstado.value = '';
      if (txtBuscar) txtBuscar.value = '';
      renderCards();
    });
  }

  if (selTraza){
    selTraza.addEventListener('change', ()=>{ handleCustomVisibility(); updateTrazaPreview(); });
  }
  if (stepAdd){
    stepAdd.addEventListener('click', ()=>{
      const name = stepName.value.trim();
      const role = stepRole?.value || 'Coordinador';
      if(!name) return;
      addStep(name, role);
      stepName.value = '';
      updateTrazaPreview();
    });
  }
  if (form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = getForm();
  if(!data.titulo){ showStatus('El título es obligatorio', 'warn'); fldTitulo.focus(); return; }
      const idx = rows.findIndex(r => r.id === data.id);
      if(idx >= 0){ rows[idx] = data; } else { rows.unshift(data); }
      renderCards();
      closeModal();
    });
  }
  if (btnCancel){ btnCancel.addEventListener('click', closeModal); }

  // ==========================
  // Seguimiento (Coordinador)
  // ==========================
  const segQ = document.getElementById('seg-q');
  const segList = document.getElementById('seg-list');
  const segEmpty = document.getElementById('seg-empty');
  const segDetail = document.getElementById('seg-detail');
  const segDetId = document.getElementById('seg-det-id');
  const segTitle = document.getElementById('seg-title');
  const segEst = document.getElementById('seg-est');
  const segTipo = document.getElementById('seg-tipo');
  const segPrio = document.getElementById('seg-prio');
  const segEstado = document.getElementById('seg-estado');
  const segCreado = document.getElementById('seg-creado');
  const segActual = document.getElementById('seg-actual');
  const segFiles = document.getElementById('seg-files');
  const segTl = document.getElementById('seg-tl');
  const segNext = document.getElementById('seg-next');
  const segResol = document.getElementById('seg-resol');

  // Seed active cases
  const flowMap = {
    basico: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Revisión', role:'Coordinador'},
      {name:'Aprobación', role:'Decano'},
      {name:'Notificación', role:'Coordinador'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    validacion: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Validación documental', role:'Coordinador'},
      {name:'Revisión coordinación', role:'Coordinador'},
      {name:'Aprobación decanato', role:'Decano'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    homologacion: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Evaluación de homologación', role:'Coordinador'},
      {name:'Resolución', role:'Decano'},
      {name:'Notificación', role:'Coordinador'},
      {name:'Finalizado', role:'Coordinador'}
    ],
  };

  let casos = [
    {
      id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En proceso',
      creado:'2025-09-02', actualizado:'2025-09-04', traza:'validacion', files:[
        {name:'Solicitud.pdf', size:'120 KB'}, {name:'HistorialAcademico.pdf', size:'340 KB'}
      ],
      steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-02': null, done: idx<1? '2025-09-03': null })),
      current: 1
    },
    {
      id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'En proceso',
      creado:'2025-09-01', actualizado:'2025-09-05', traza:'homologacion', files:[
        {name:'Programas.pdf', size:'1.2 MB'}
      ],
      steps: flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-01': null, done: idx<2? (idx===0? '2025-09-02':'2025-09-04') : null })),
      current: 2
    },
    {
      id:'C-2103', titulo:'Certificado de matrícula - Carlos Ruiz', estudiante:'Carlos Ruiz', tipo:'Certificados académicos', prioridad:'Media', estado:'En proceso',
      creado:'2025-09-03', actualizado:'2025-09-03', traza:'basico', files:[
        {name:'ComprobantePago.pdf', size:'85 KB'}
      ],
      steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03': null, done: idx<1? '2025-09-03' : null })),
      current: 1
    },
    {
      id:'C-2104', titulo:'Baja de matrícula parcial - Pedro Gómez', estudiante:'Pedro Gómez', tipo:'Baja de matrícula', prioridad:'Baja', estado:'En proceso',
      creado:'2025-09-04', actualizado:'2025-09-04', traza:'validacion', files:[
        {name:'FormularioBaja.docx', size:'45 KB'}
      ],
      steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-04': null, done: idx<1? '2025-09-04' : null })),
      current: 1
    },
    {
      id:'C-2105', titulo:'Certificado de notas - Andrea Silva', estudiante:'Andrea Silva', tipo:'Certificados académicos', prioridad:'Alta', estado:'En proceso',
      creado:'2025-09-05', actualizado:'2025-09-05', traza:'basico', files:[
        {name:'ComprobantePago_2.pdf', size:'90 KB'}, {name:'CopiaCedula.png', size:'220 KB'}
      ],
      steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-05': null, done: idx<1? '2025-09-05' : null })),
      current: 1
    },
    {
      id:'C-2106', titulo:'Convalidación internacional - Luis Herrera', estudiante:'Luis Herrera', tipo:'Homologación', prioridad:'Media', estado:'En proceso',
      creado:'2025-09-06', actualizado:'2025-09-07', traza:'homologacion', files:[
        {name:'PlanEstudiosExtranjero.pdf', size:'2.4 MB'}
      ],
      steps: flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-06': null, done: idx<1? '2025-09-06' : null })),
      current: 1
    },
    {
      id:'C-2107', titulo:'Actualización de datos - Sofía Méndez', estudiante:'Sofía Méndez', tipo:'Otro', prioridad:'Baja', estado:'En proceso',
      creado:'2025-09-03', actualizado:'2025-09-06', traza:'validacion', files:[
        {name:'SoporteCambioDireccion.pdf', size:'150 KB'}
      ],
      steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03': null, done: idx<2? (idx===0? '2025-09-04':'2025-09-06') : null })),
      current: 2
    },
    {
      id:'C-2108', titulo:'Emisión de carné - Diego Torres', estudiante:'Diego Torres', tipo:'Otro', prioridad:'Media', estado:'En proceso',
      creado:'2025-09-07', actualizado:'2025-09-08', traza:'basico', files:[
        {name:'FotoCarnet.jpg', size:'320 KB'}
      ],
      steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-07': null, done: idx<1? '2025-09-07' : null })),
      current: 1
    },
    {
      id:'C-2109', titulo:'Aval de prácticas - Valeria Núñez', estudiante:'Valeria Núñez', tipo:'Otro', prioridad:'Urgente', estado:'En proceso',
      creado:'2025-09-08', actualizado:'2025-09-09', traza:'validacion', files:[
        {name:'CartaEmpresa.pdf', size:'110 KB'}, {name:'Convenio.pdf', size:'300 KB'}
      ],
      steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-08': null, done: idx<1? '2025-09-08' : null })),
      current: 1
    }
  ];

  // Merge external requests (from login page) into casos if not present yet
  try{
    const extRaw = localStorage.getItem('externalRequests');
    if(extRaw){
      const extList = JSON.parse(extRaw);
      extList.forEach(req => {
        if(!casos.find(c => c.id === req.id)){
          const map = flowMap[req.traza] || flowMap.validacion || flowMap.basico;
          const steps = map.map((s,idx)=>({ ...s, started: idx===0? req.creado : null, done: null }));
          casos.unshift({
            id: req.id,
            titulo: req.titulo,
            estudiante: req.estudiante,
            tipo: req.tipo || 'Otro',
            prioridad: req.prioridad || 'Media',
            estado: req.estado || 'En proceso',
            creado: req.creado,
            actualizado: req.actualizado || req.creado,
            traza: req.traza || 'validacion',
            files: (req.files||[]).map(f => ({name:f.name, size: (f.size? (Math.round(f.size/1024)+' KB') : '—')})),
            steps,
            current: req.current || 0
          });
        }
      });
    }
  }catch(err){ console.warn('No se pudo integrar solicitudes externas', err); }

  function fmtDate(d){
    return d || '—';
  }

  function daysBetween(d1, d2){
    if(!d1 || !d2) return null;
    const a = new Date(d1+'T00:00:00');
    const b = new Date(d2+'T00:00:00');
    const diff = Math.round((b - a) / (1000*60*60*24));
    return diff;
  }

  function renderSegList(){
    if(!segList) return;
    const q = (segQ?.value || '').trim().toLowerCase();
    segList.innerHTML = '';
    casos.filter(c => !q || JSON.stringify(c).toLowerCase().includes(q))
      .forEach(c => {
        const li = document.createElement('li');
        li.className = 'seg-item';
        li.dataset.id = c.id;
        li.innerHTML = `
          <div class="seg-it-row"><span class="seg-it-id">${c.id}</span> <span class="seg-it-title">${c.titulo}</span></div>
          <div class="seg-it-sub">${c.estudiante} · ${c.tipo} · ${c.prioridad} · Etapa ${c.current+1}/${c.steps.length}</div>
        `;
        li.addEventListener('click', ()=> selectCaso(c.id));
        segList.appendChild(li);
      });
  }

  function selectCaso(id){
    const c = casos.find(x => x.id === id);
    if(!c) return;
    // Active item highlight
    segList?.querySelectorAll('.seg-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
    // Show detail
    if(segEmpty) segEmpty.hidden = true;
    if(segDetail) segDetail.hidden = false;
    if(segDetId) segDetId.textContent = id;
    if(segTitle) segTitle.textContent = c.titulo;
    if(segEst) segEst.textContent = c.estudiante;
    if(segTipo) segTipo.textContent = c.tipo;
    if(segPrio) segPrio.textContent = c.prioridad;
    if(segEstado) segEstado.textContent = c.estado;
    if(segCreado) segCreado.textContent = fmtDate(c.creado);
    if(segActual) segActual.textContent = fmtDate(c.actualizado);
    // files
    if(segFiles){
      segFiles.innerHTML = '';
      c.files.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="file-ico">📎</span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span><span class="file-actions"><button id = "btn-ver" class="btn-ghost btn-small js-view" type="button">Ver</button><button class="btn-primary btn-small js-dl" type="button">Descargar</button></span>`;
        li.querySelector('.js-view')?.addEventListener('click', ()=> openFileModal(c.id, f));
        li.querySelector('.js-dl')?.addEventListener('click', ()=> downloadFile(c.id, f));
        segFiles.appendChild(li);
      });
    }
    // timeline with durations
    if(segTl){
      segTl.innerHTML = '';
      c.steps.forEach((s, idx) => {
        const li = document.createElement('li');
        const isPending = idx > c.current;
        li.className = `tl-item ${isPending? 'pending':''}`;
        const roleClass = `role--${(s.role||'Coordinador').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
        // Compute duration per step if finished
        let meta = `Paso ${idx+1}`;
        if(s.started && s.done){
          const d = daysBetween(s.started, s.done);
          if (d !== null) meta += ` · ${d} día${d===1?'':'s'}`;
        } else if(idx === c.current && s.started){
          const d = daysBetween(s.started, c.actualizado || new Date().toISOString().slice(0,10));
          if (d !== null) meta += ` · en curso · ${d} día${d===1?'':'s'}`;
        }
        li.innerHTML = `
          <div class="tl-dot">${idx <= c.current && s.done ? '✔' : '•'}</div>
          <div class="tl-body">
            <div class="tl-title">${s.name}</div>
            <div class="tl-meta">${meta}</div>
            <div class="role role-badge ${roleClass}"><span class="dot"></span>${s.role || 'Coordinador'}</div>
          </div>`;
        segTl.appendChild(li);
      });
    }

    // actions
    if(segNext && segResol){
      const isLast = c.current >= c.steps.length-1;
      segNext.hidden = isLast;
      segResol.hidden = !isLast;
      segNext.onclick = () => avanzarCaso(c.id);
      segResol.onclick = () => resolverCaso(c.id);
    }
    // rejection banner
    const rej = document.getElementById('seg-reject');
    if(rej){
      if(c.estado === 'Rechazado'){
        rej.hidden = false;
        rej.textContent = `Rechazado el ${fmtDate(c.rechazadoFecha)}. Motivo: ${c.rechazo || '—'}`;
      } else {
        rej.hidden = true;
        rej.textContent = '';
      }
    }
  }

  function avanzarCaso(id){
    const c = casos.find(x => x.id === id);
    if(!c) return;
    const now = new Date().toISOString().slice(0,10);
    // Mark current step as done if not already
    const idx = c.current;
    if(c.steps[idx] && !c.steps[idx].done){
      if(!c.steps[idx].started) c.steps[idx].started = now;
      c.steps[idx].done = now;
    }
    // Advance pointer if not last
    if(c.current < c.steps.length-1){
      c.current += 1;
      if(!c.steps[c.current].started) c.steps[c.current].started = now;
      c.estado = c.current >= c.steps.length-1 ? 'En resolución' : 'En proceso';
    }
    c.actualizado = now;
    renderSegList();
    selectCaso(id);
  }

  function resolverCaso(id){
    const c = casos.find(x => x.id === id);
    if(!c) return;
    const now = new Date().toISOString().slice(0,10);
    // Ensure last step marked done
    const last = c.steps.length-1;
    if(!c.steps[last].started) c.steps[last].started = now;
    c.steps[last].done = now;
    c.current = last;
    c.estado = 'Finalizado';
    c.actualizado = now;
    // For demo, append a fake resolution file
    c.files.push({name:`Resolucion_${c.id}.pdf`, size:'64 KB'});
    renderSegList();
    selectCaso(id);
  }

  // Reject flow
  const rejModal = document.getElementById('rej-modal');
  const rejClose = document.getElementById('rej-close');
  const rejCancel = document.getElementById('rej-cancel');
  const rejConfirm = document.getElementById('rej-confirm');
  const rejReason = document.getElementById('rej-reason');
  let rejTargetId = null;

  function openRejModal(id){ rejTargetId = id; if(rejModal) rejModal.hidden = false; }
  function closeRejModal(){ rejTargetId = null; if(rejModal) rejModal.hidden = true; }

  const btnRechazar = document.getElementById('seg-rechazar');
  if(btnRechazar){ btnRechazar.addEventListener('click', ()=>{
    const active = segDetId?.textContent?.trim();
    if(active) openRejModal(active);
  }); }
  if(rejClose){ rejClose.addEventListener('click', closeRejModal); }
  if(rejCancel){ rejCancel.addEventListener('click', closeRejModal); }
  if(rejModal){ rejModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeRejModal(); }); }
  if(rejConfirm){ rejConfirm.addEventListener('click', ()=>{
    const reason = rejReason?.value?.trim();
  if(!reason){ showStatus('Por favor, indica el motivo del rechazo.', 'warn'); return; }
    const c = casos.find(x => x.id === rejTargetId);
    if(!c) { closeRejModal(); return; }
    const now = new Date().toISOString().slice(0,10);
    c.estado = 'Rechazado';
    c.rechazo = reason;
    c.rechazadoFecha = now;
    c.actualizado = now;
    closeRejModal();
    renderSegList();
    selectCaso(c.id);
  }); }

  // File preview/download
  const fileModal = document.getElementById('file-modal');
  const fileClose = document.getElementById('file-close');
  const fileMeta = document.getElementById('file-meta');
  const filePreview = document.getElementById('file-preview');
  const fileDl = document.getElementById('file-dl');
  let fileCtx = { id:null, file:null };
  function openFileModal(id, file){
    fileCtx = { id, file };
    if(fileMeta) fileMeta.textContent = `${file.name} · ${file.size}`;
    if(filePreview) filePreview.textContent = 'No hay vista previa disponible para este archivo.';
    if(fileModal) fileModal.hidden = false;
  }
  function closeFileModal(){ fileCtx = { id:null, file:null }; if(fileModal) fileModal.hidden = true; }
  function downloadFile(id, file){
    // Demo: create a fake blob and trigger download
    const blob = new Blob([`Contenido simulado para ${file.name} del caso ${id}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }
  if(fileClose){ fileClose.addEventListener('click', closeFileModal); }
  if(fileModal){ fileModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeFileModal(); }); }
  if(fileDl){ fileDl.addEventListener('click', ()=>{ if(fileCtx.file) downloadFile(fileCtx.id, fileCtx.file); }); }

  if(segQ){ segQ.addEventListener('input', renderSegList); }
  renderSegList();

  // ==========================
  // Notificaciones (Coordinador)
  // ==========================
  const coNotifList = document.getElementById('co-notif-list');
  const statUnread = document.getElementById('co-stat-unread');
  const statWeek = document.getElementById('co-stat-week');
  const statImportant = document.getElementById('co-stat-important');
  const statTotal = document.getElementById('co-stat-total');
  const statSched = document.getElementById('co-stat-sched');

  // Preferences controls
  const cfg = {
    wa: document.getElementById('co-cfg-wa'),
    mail: document.getElementById('co-cfg-mail'),
    app: document.getElementById('co-cfg-app'),
    sms: document.getElementById('co-cfg-sms'),
    available: document.getElementById('co-cfg-available'),
    start: document.getElementById('co-cfg-start'),
    end: document.getElementById('co-cfg-end'),
    dndStart: document.getElementById('co-dnd-start'),
    dndEnd: document.getElementById('co-dnd-end'),
    days: {
      mon: document.getElementById('co-day-mon'),
      tue: document.getElementById('co-day-tue'),
      wed: document.getElementById('co-day-wed'),
      thu: document.getElementById('co-day-thu'),
      fri: document.getElementById('co-day-fri'),
      sat: document.getElementById('co-day-sat'),
      sun: document.getElementById('co-day-sun'),
    },
    saveBtn: document.getElementById('co-cfg-save'),
    resetBtn: document.getElementById('co-cfg-reset'),
  };

  let coNotifs = [
    { id:'N-3001', icon:'⚠️', title:'Falta documento en trámite C-2102', desc:'Sube el sustentante de convalidación.', time:'Hace 6 minutos', important:true, read:false },
    { id:'N-3002', icon:'🔁', title:'Recordatorio de etapa pendiente', desc:'Caso C-2101 lleva 2 días en la misma etapa.', time:'Hace 1 hora', important:false, read:false },
    { id:'N-3003', icon:'📥', title:'Nueva solicitud recibida', desc:'Caso C-2110 creado por Secretaría.', time:'Hoy 09:10', important:false, read:false },
    { id:'N-3004', icon:'🗓', title:'Vence plazo de revisión', desc:'Caso C-2105 vence mañana.', time:'Ayer 18:30', important:true, read:true },
    { id:'N-3005', icon:'✅', title:'Resolución emitida', desc:'Se generó resolución para C-2103.', time:'Ayer 11:22', important:false, read:true },
    { id:'N-3006', icon:'📧', title:'Correo devuelto', desc:'No se pudo notificar al estudiante (C-2108).', time:'Esta semana', important:false, read:false },
    { id:'N-3007', icon:'🔔', title:'Revisión asignada', desc:'Nuevo caso asignado a tu bandeja.', time:'Esta semana', important:false, read:false },
    { id:'N-3008', icon:'🚩', title:'Prioridad cambiada a Urgente', desc:'Caso C-2109 actualizado.', time:'Esta semana', important:true, read:false },
    { id:'N-3009', icon:'📬', title:'Tienes un nuevo mensaje de coordinación', desc:'Revisa los comentarios en tu solicitud.', time:'Hoy', important:false, read:false },
  ];

  function loadCoPrefs(){
    try{
      const raw = localStorage.getItem('coNotifPrefs');
      if(!raw) return;
      const p = JSON.parse(raw);
      if(cfg.wa) cfg.wa.checked = !!p.wa;
      if(cfg.mail) cfg.mail.checked = !!p.mail;
      if(cfg.app) cfg.app.checked = !!p.app;
      if(cfg.sms) cfg.sms.checked = !!p.sms;
      if(cfg.available) cfg.available.checked = p.available !== false;
      if(cfg.start && p.start) cfg.start.value = p.start;
      if(cfg.end && p.end) cfg.end.value = p.end;
      if(cfg.dndStart && p.dndStart) cfg.dndStart.value = p.dndStart;
      if(cfg.dndEnd && p.dndEnd) cfg.dndEnd.value = p.dndEnd;
      if(cfg.days){
        Object.keys(cfg.days).forEach(k => { if(p.days && k in p.days) cfg.days[k].checked = !!p.days[k]; });
      }
    }catch{}
  }
  function saveCoPrefs(){
    const p = {
      wa: !!cfg.wa?.checked,
      mail: !!cfg.mail?.checked,
      app: !!cfg.app?.checked,
      sms: !!cfg.sms?.checked,
      available: !!cfg.available?.checked,
      start: cfg.start?.value || '08:00',
      end: cfg.end?.value || '18:00',
      dndStart: cfg.dndStart?.value || '22:00',
      dndEnd: cfg.dndEnd?.value || '07:00',
      days: {
        mon: !!cfg.days?.mon?.checked,
        tue: !!cfg.days?.tue?.checked,
        wed: !!cfg.days?.wed?.checked,
        thu: !!cfg.days?.thu?.checked,
        fri: !!cfg.days?.fri?.checked,
        sat: !!cfg.days?.sat?.checked,
        sun: !!cfg.days?.sun?.checked,
      },
    };
    localStorage.setItem('coNotifPrefs', JSON.stringify(p));
    updateCoStats();
  showStatus('Preferencias guardadas', 'success');
  }
  function resetCoPrefs(){
    localStorage.removeItem('coNotifPrefs');
    loadCoPrefs();
    updateCoStats();
  }

  function renderCoNotifs(){
    if(!coNotifList) return;
    coNotifList.innerHTML = '';
    coNotifs.forEach(n => {
      const li = document.createElement('li');
      li.className = 'notif-card';
      li.innerHTML = `
        <div class="notif-card__icon">${n.icon}</div>
        <div class="notif-card__body">
          <div class="notif-card__title">${n.title}${n.important? ' <span style="color:#dc2626">•</span>':''}</div>
          <div class="notif-card__desc">${n.desc}</div>
          <div class="notif-card__actions">
            <button class="pill pill--primary js-detail">Ver detalle</button>
            <button class="pill pill--light js-read">${n.read? 'Leído':'Marcar leído'}</button>
          </div>
        </div>
        <div class="notif-card__time">${n.time}</div>
      `;
  li.querySelector('.js-read')?.addEventListener('click', ()=>{ n.read = true; renderCoNotifs(); updateCoStats(); try{ showStatus('Notificación marcada como leída','success'); }catch{} });
      li.querySelector('.js-detail')?.addEventListener('click', ()=> openNotifModal(n));
      coNotifList.appendChild(li);
    });
    updateCoStats();
  }

  // Notif detail modal and deep-link
  const notifModal = document.getElementById('notif-modal');
  const notifClose = document.getElementById('notif-close');
  const notifIco = document.getElementById('notif-ico');
  const notifTitle = document.getElementById('notif-title');
  const notifDesc = document.getElementById('notif-desc');
  const notifTime = document.getElementById('notif-time');
  const notifGoto = document.getElementById('notif-goto');
  const notifMark = document.getElementById('notif-mark');
  let notifCtx = { id:null };

  function openNotifModal(n){
    notifCtx = { id: n.id, caseId: (n.desc.match(/(C-\d{4})/)||[])[1] };
    if(notifIco) notifIco.textContent = n.icon || '🔔';
    if(notifTitle) notifTitle.textContent = n.title || 'Notificación';
    if(notifDesc) notifDesc.textContent = n.desc || '';
    if(notifTime) notifTime.textContent = n.time || '';
    if(notifModal) notifModal.hidden = false;
  }
  function closeNotifModal(){ if(notifModal) notifModal.hidden = true; }
  notifClose?.addEventListener('click', closeNotifModal);
  notifModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeNotifModal(); });
  notifMark?.addEventListener('click', ()=>{ const n = coNotifs.find(x=>x.id===notifCtx.id); if(n){ n.read = true; renderCoNotifs(); try{ showStatus('Notificación marcada como leída','success'); }catch{} } closeNotifModal(); });
  notifGoto?.addEventListener('click', ()=>{
    // Navigate to Seguimiento and select case if we can parse it
    const caseId = notifCtx.caseId;
    const itemSeguimiento = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='seguimiento');
    if(itemSeguimiento){ itemSeguimiento.click(); }
    if(caseId){
      // Allow view to render then select
      setTimeout(()=>{ selectCaso(caseId); }, 50);
    }
    closeNotifModal();
  });

  function updateCoStats(){
    const unread = coNotifs.filter(n => !n.read).length;
    const important = coNotifs.filter(n => n.important).length;
    const total = coNotifs.length;
    if(statUnread) statUnread.textContent = String(unread);
    if(statImportant) statImportant.textContent = String(important);
    if(statTotal) statTotal.textContent = String(total);
    if(statWeek) statWeek.textContent = String(Math.max(5, Math.ceil(total*0.6))); // demo
    // horario text from prefs
    const pRaw = localStorage.getItem('coNotifPrefs');
    if(pRaw){
      try{
        const p = JSON.parse(pRaw);
        if(statSched) statSched.textContent = p.available === false ? 'Pausado' : `${p.start||'08:00'}-${p.end||'18:00'}`;
      }catch{}
    }
  }

  // Wire prefs buttons
  cfg.saveBtn?.addEventListener('click', saveCoPrefs);
  cfg.resetBtn?.addEventListener('click', resetCoPrefs);
  loadCoPrefs();
  renderCoNotifs();

  // ==========================
  // Reportes (Coordinador)
  // ==========================
  const repDesde = document.getElementById('rep-desde');
  const repHasta = document.getElementById('rep-hasta');
  const repTipo = document.getElementById('rep-tipo');
  const repPrio = document.getElementById('rep-prio');
  const repEstado = document.getElementById('rep-estado');
  const repQ = document.getElementById('rep-q');
  const repExport = document.getElementById('rep-export');
  const repPrint = document.getElementById('rep-print');
  const repClear = document.getElementById('rep-clear');
  const repTable = document.getElementById('rep-table')?.querySelector('tbody');
  const kpiProm = document.getElementById('kpi-prom');
  const kpiTotal = document.getElementById('kpi-total');
  const kpiRes = document.getElementById('kpi-res');
  const kpiRech = document.getElementById('kpi-rech');
  const kpiSla = document.getElementById('kpi-sla');
  const repBars = document.getElementById('rep-bars');
  const repBarsLabels = document.getElementById('rep-bars-labels');
  const repDonut = document.getElementById('rep-donut');
  const repDonutTotal = document.getElementById('rep-donut-total');

  // Combine data from 'rows' (trámites definidos) and 'casos' (seguimiento) into a historical dataset demo
  function toDate(s){ return s ? new Date(s+'T00:00:00') : null; }
  function dateInRange(d, from, to){ if(!d) return false; if(from && d < from) return false; if(to && d > to) return false; return true; }
  function durationDays(s,e){ if(!s||!e) return null; return Math.max(0, Math.round((toDate(e)-toDate(s))/(1000*60*60*24))); }

  function getHistory(){
    // Build from casos and from rows (treat as templates with no resolution)
    const hist = [];
    // casos (with states over time)
    casos.forEach(c => {
      const lastStep = c.steps[c.steps.length-1];
      const resolved = c.estado === 'Finalizado' ? (lastStep?.done || c.actualizado) : null;
      hist.push({
        id: c.id, titulo: c.titulo, tipo: c.tipo, prioridad: c.prioridad,
        estado: c.estado, creado: c.creado, resuelto: resolved,
        dias: durationDays(c.creado, resolved), sla: (c.tipo==='Homologación'? 10 : 5)
      });
    });
    // Derive some finished examples from rows as historical completions (synthetic)
    rows.slice(0,6).forEach((r,i)=>{
      const creado = '2025-08-'+String(10+i).padStart(2,'0');
      const dias = (r.prioridad==='Urgente'? 2 : r.prioridad==='Alta'? 4 : 6);
      const resuelto = '2025-08-'+String(10+i+dias).padStart(2,'0');
      hist.push({ id: 'H-'+r.id, titulo: r.titulo, tipo: r.tipo, prioridad: r.prioridad, estado:'Finalizado', creado, resuelto, dias, sla:(r.tipo==='Homologación'?10:5) });
    });
    // add some rejected
    hist.push({ id:'H-R100', titulo:'Solicitud fuera de plazo', tipo:'Otro', prioridad:'Media', estado:'Rechazado', creado:'2025-08-18', resuelto:'2025-08-18', dias:0, sla:5 });
    return hist;
  }

  function applyRepFilters(data){
    const from = repDesde?.value ? toDate(repDesde.value) : null;
    const to = repHasta?.value ? toDate(repHasta.value) : null;
    const t = repTipo?.value || '';
    const p = repPrio?.value || '';
    const e = repEstado?.value || '';
    const q = (repQ?.value || '').trim().toLowerCase();
    return data.filter(d => {
      const dDate = toDate(d.creado);
      if(!dateInRange(dDate, from, to)) return false;
      if(t && d.tipo !== t) return false;
      if(p && d.prioridad !== p) return false;
      if(e && d.estado !== e) return false;
      if(q && !JSON.stringify(d).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function repaintBars(counts){
    if(!repBars || !repBarsLabels) return;
    repBars.innerHTML=''; repBarsLabels.innerHTML='';
    const labels = Object.keys(counts);
    const data = labels.map(k => counts[k]);
    const max = Math.max(...data, 1);
    data.forEach((v,i)=>{
      const b = document.createElement('div'); b.className='bar'; b.style.height = `${(v/max)*100}%`; repBars.appendChild(b);
      const l = document.createElement('div'); l.textContent = labels[i]; repBarsLabels.appendChild(l);
    });
  }
  function repaintDonut(finalizados, proceso, rechazados){
    if(!repDonut || !repDonutTotal) return;
    const total = finalizados+proceso+rechazados;
    const f = total? Math.round((finalizados/total)*100) : 0;
    const p = total? Math.round((proceso/total)*100) : 0;
    const r = 100 - f - p;
    repDonut.style.background = `conic-gradient(#10b981 0 ${f}%, #f59e0b ${f}% ${f+p}%, #ef4444 ${f+p}% 100%)`;
    repDonutTotal.textContent = String(total);
  }

  function renderReports(){
    const all = getHistory();
    const data = applyRepFilters(all);
    // KPIs
    const total = data.length;
    const finalizados = data.filter(d => d.estado==='Finalizado');
    const rechazados = data.filter(d => d.estado==='Rechazado');
    const enproc = data.filter(d => d.estado==='En proceso');
    const prom = Math.round((finalizados.map(d=>d.dias||0).reduce((a,b)=>a+b,0) / Math.max(finalizados.length,1)) || 0);
    const tasaRes = total? Math.round((finalizados.length/total)*100) : 0;
    const tasaRech = total? Math.round((rechazados.length/total)*100) : 0;
    const slaCumpl = finalizados.length? Math.round((finalizados.filter(d => (d.dias||0) <= d.sla).length / finalizados.length)*100) : 0;
    if(kpiProm) kpiProm.textContent = `${prom} d`;
    if(kpiTotal) kpiTotal.textContent = String(total);
    if(kpiRes) kpiRes.textContent = `${tasaRes}%`;
    if(kpiRech) kpiRech.textContent = `${tasaRech}%`;
    if(kpiSla) kpiSla.textContent = `${slaCumpl}%`;
    // Bars by type
    const byType = {};
    data.forEach(d => { byType[d.tipo] = (byType[d.tipo]||0)+1; });
    repaintBars(byType);
    // Donut by state
    repaintDonut(finalizados.length, enproc.length, rechazados.length);
    // Table
    if(repTable){
      repTable.innerHTML = '';
      data.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${d.id}</td><td>${d.titulo}</td><td>${d.tipo}</td><td>${d.prioridad}</td><td>${d.estado}</td><td>${d.creado||'—'}</td><td>${d.resuelto||'—'}</td><td>${d.dias??'—'}</td><td>${d.sla}d</td>`;
        repTable.appendChild(tr);
      });
    }
  }

  function exportCSV(){
    const all = getHistory();
    const data = applyRepFilters(all);
    const rowsCsv = [
      ['ID','Título','Tipo','Prioridad','Estado','Creado','Resuelto','Días','SLA']
    ].concat(data.map(d => [d.id,d.titulo,d.tipo,d.prioridad,d.estado,d.creado||'',d.resuelto||'',String(d.dias??''),String(d.sla)]));
    const csv = rowsCsv.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reportes.csv'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  }

  function printReports(){
    window.print();
  }

  // Wire report events
  repDesde?.addEventListener('change', renderReports);
  repHasta?.addEventListener('change', renderReports);
  repTipo?.addEventListener('change', renderReports);
  repPrio?.addEventListener('change', renderReports);
  repEstado?.addEventListener('change', renderReports);
  repQ?.addEventListener('input', renderReports);
  repExport?.addEventListener('click', exportCSV);
  repPrint?.addEventListener('click', printReports);
  repClear?.addEventListener('click', ()=>{
    if(repDesde) repDesde.value=''; if(repHasta) repHasta.value=''; if(repTipo) repTipo.value=''; if(repPrio) repPrio.value=''; if(repEstado) repEstado.value=''; if(repQ) repQ.value='';
    renderReports();
  });
});
