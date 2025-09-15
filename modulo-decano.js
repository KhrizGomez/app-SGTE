document.addEventListener('DOMContentLoaded', () => {
  // Nota: Este archivo es una copia inicial de modulo-coordinador.js para el Decano.
  // Podrá divergir en el futuro sin afectar al módulo de Coordinación.

  const pageTitle = document.getElementById('page-title');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSolicitudes = document.getElementById('view-solicitudes');
  const viewSeguimiento = document.getElementById('view-seguimiento');
  const viewNotifs = document.getElementById('view-notificaciones');
  const viewReportes = document.getElementById('view-reportes');
  const viewAdmin = document.getElementById('view-admin');
  const sysBanner = document.getElementById('sys-banner');
  const sysBannerText = document.getElementById('sys-banner-text');
  const statusBar = document.getElementById('status');
  const pushWrap = document.getElementById('push');

  // Push notifications (emergent top-right)
  function push(msg, kind='info', ms=3000){
    if(!pushWrap){
      // fallback to inline status
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
    const remove = ()=>{
      el.style.animation = 'push-out .2s ease-in forwards';
      setTimeout(()=> el.remove(), 180);
    };
    closer?.addEventListener('click', remove);
    pushWrap.appendChild(el);
    setTimeout(remove, ms);
  }

  // Keep API compatibility with existing calls
  function showStatus(msg, kind='info', ms=2600){ push(msg, kind, ms); }

  function hideAll(){
    [viewDashboard, viewSolicitudes, viewSeguimiento, viewNotifs, viewReportes, viewAdmin].forEach(v => {
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
      pageTitle.textContent = 'Dashboard';
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
    } else if (key === 'administracion'){
      pageTitle.textContent = 'Administración del sistema';
      if(viewAdmin){ viewAdmin.classList.add('view--active'); viewAdmin.removeAttribute('hidden'); }
      loadSysSettings();
    }
  }));

  // Logout
  const logoutBtn = document.querySelector('.power');
  if (logoutBtn) logoutBtn.addEventListener('click', ()=> window.location.href = 'index.html');

  // Bars chart (dashboard)
  const data = [9, 11, 19, 22, 7];
  const labels = ['Copper','Silver','Gold','Platinum','Diamond'];
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

  // ==========================
  // Solicitudes (Decano)
  // ==========================
  const grid = document.getElementById('co-sgrid');
  const btnNuevo = document.getElementById('co-nuevo');
  const txtBuscar = document.getElementById('co-buscar');
  const filTipo = document.getElementById('co-fil-tipo');
  const filPrio = document.getElementById('co-fil-prio');
  const filEstado = document.getElementById('co-fil-estado');
  const filClear = document.getElementById('co-fil-clear');

  // Modal refs (HTML comparte los mismos IDs que coordinador por ahora)
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
    (row?.custom || []).forEach((s)=> addStep(s.name || s, s.role || 'Decano'));
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
        role: li.dataset.role || 'Decano',
      })),
    };
  }

  function updateTrazaPreview(){
    if(!tl) return;
    tl.innerHTML = '';
    let steps = [];
    const map = {
      basico: [
        {name:'Recepción', role:'Secretaría'},
        {name:'Revisión', role:'Coordinador'},
        {name:'Aprobación', role:'Decano'},
        {name:'Notificación', role:'Estudiante'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      validacion: [
        {name:'Recepción', role:'Secretaría'},
        {name:'Validación documental', role:'Secretaría'},
        {name:'Revisión coordinación', role:'Coordinador'},
        {name:'Aprobación decanato', role:'Decano'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      homologacion: [
        {name:'Recepción', role:'Secretaría'},
        {name:'Evaluación de homologación', role:'Docente'},
        {name:'Resolución', role:'Decano'},
        {name:'Notificación', role:'Estudiante'},
        {name:'Finalizado', role:'Coordinador'}
      ],
    };
    if (selTraza.value === 'personalizada'){
      steps = Array.from(stepList.querySelectorAll('li')).map(li => ({
        name: li.querySelector('.txt')?.textContent.trim() || '',
        role: li.dataset.role || 'Decano',
      }));
    } else {
      steps = map[selTraza.value] || map.basico;
    }
    // Determine completed steps count for preview (simple heuristic)
    const doneCount = Math.max(1, Math.min(steps.length, 2));
    steps.forEach((step,idx)=>{
      const li = document.createElement('li');
      const isPending = idx >= doneCount;
      li.className = `tl-item ${isPending?'pending':''}`;
      const roleClass = `role--${(step.role||'Decano').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
      li.innerHTML = `
        <div class="tl-dot">${idx < doneCount ? '✔' : '•'}</div>
        <div class="tl-body">
          <div class="tl-title">${step.name}</div>
          <div class="tl-meta">Paso ${idx+1}</div>
          <div class="role role-badge ${roleClass}"><span class="dot"></span>${step.role || 'Decano'}</div>
        </div>`;
      tl.appendChild(li);
      if (tl.classList.contains('timeline--h') && idx < steps.length-1){
        const conn = document.createElement('div');
        conn.className = 'tl-connector';
        tl.appendChild(conn);
      }
    });
  }

  function handleCustomVisibility(){ if(!customWrap) return; customWrap.hidden = selTraza.value !== 'personalizada'; }

  function addStep(name, role='Decano'){
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
  btnNuevo?.addEventListener('click', ()=>{ setFormFrom({ estado:'Borrador', prioridad:'Baja', traza:'basico', custom:[] }); openModal(); fldTitulo?.focus(); });
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeModal(); });
  txtBuscar?.addEventListener('input', ()=>{ filter = txtBuscar.value.trim().toLowerCase(); renderCards(); });
  filTipo?.addEventListener('change', ()=>{ fTipo = filTipo.value; renderCards(); });
  filPrio?.addEventListener('change', ()=>{ fPrio = filPrio.value; renderCards(); });
  filEstado?.addEventListener('change', ()=>{ fEstado = filEstado.value; renderCards(); });
  filClear?.addEventListener('click', ()=>{ fTipo=fPrio=fEstado=''; filter=''; if(filTipo)filTipo.value=''; if(filPrio)filPrio.value=''; if(filEstado)filEstado.value=''; if(txtBuscar)txtBuscar.value=''; renderCards(); });
  selTraza?.addEventListener('change', ()=>{ handleCustomVisibility(); updateTrazaPreview(); });
  stepAdd?.addEventListener('click', ()=>{ const name = stepName.value.trim(); const role = stepRole?.value || 'Decano'; if(!name) return; addStep(name, role); stepName.value=''; updateTrazaPreview(); });
  form?.addEventListener('submit', (e)=>{ e.preventDefault(); const data = getForm(); if(!data.titulo){ showStatus('El título es obligatorio', 'warn'); fldTitulo.focus(); return; } const idx = rows.findIndex(r => r.id === data.id); if(idx>=0){ rows[idx]=data; } else { rows.unshift(data); } renderCards(); closeModal(); });
  btnCancel?.addEventListener('click', closeModal);

  grid?.addEventListener('click', (e)=>{
    const edit = e.target.closest('.js-edit');
    const dup = e.target.closest('.js-dup');
    const id = (edit||dup)?.getAttribute('data-id');
    if(!id) return;
    const row = rows.find(r => r.id === id);
    if(!row) return;
    if (edit){ setFormFrom(row); openModal(); fldTitulo?.focus(); }
    else if (dup){ const copy = { ...row, id: `T-${Math.floor(Math.random()*9000)+1000}`, titulo: row.titulo + ' (Copia)' }; rows.unshift(copy); renderCards(); }
  });

  // ==========================
  // Seguimiento (Decano)
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

  const flowMap = {
    basico: [
      {name:'Recepción', role:'Secretaría'},
      {name:'Revisión', role:'Coordinador'},
      {name:'Aprobación', role:'Decano'},
      {name:'Notificación', role:'Estudiante'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    validacion: [
      {name:'Recepción', role:'Secretaría'},
      {name:'Validación documental', role:'Secretaría'},
      {name:'Revisión coordinación', role:'Coordinador'},
      {name:'Aprobación decanato', role:'Decano'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    homologacion: [
      {name:'Recepción', role:'Secretaría'},
      {name:'Evaluación de homologación', role:'Docente'},
      {name:'Resolución', role:'Decano'},
      {name:'Notificación', role:'Estudiante'},
      {name:'Finalizado', role:'Coordinador'}
    ],
  };

  let casos = [
    { id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En proceso', creado:'2025-09-02', actualizado:'2025-09-04', traza:'validacion', files:[{name:'Solicitud.pdf', size:'120 KB'}], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-02': null, done: idx<1? '2025-09-03': null })), current: 1 },
    { id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'En proceso', creado:'2025-09-01', actualizado:'2025-09-05', traza:'homologacion', files:[{name:'Programas.pdf', size:'1.2 MB'}], steps: flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-01': null, done: idx<2? (idx===0? '2025-09-02':'2025-09-04') : null })), current: 2 },
    { id:'C-2103', titulo:'Certificados académicos - Pedro Gómez', estudiante:'Pedro Gómez', tipo:'Certificados académicos', prioridad:'Media', estado:'Publicado', creado:'2025-09-03', actualizado:'2025-09-06', traza:'basico', files:[{name:'Solicitud.pdf', size:'80 KB'}], steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03' : null, done: idx<1? '2025-09-04': null })), current: 1 },
    { id:'C-2104', titulo:'Baja de matrícula - Lucía Vega', estudiante:'Lucía Vega', tipo:'Baja de matrícula', prioridad:'Media', estado:'Borrador', creado:'2025-09-07', actualizado:'2025-09-07', traza:'basico', files:[], steps: flowMap.basico.map((s)=>({ ...s })), current: 0 },
    { id:'C-2105', titulo:'Cambio de paralelo - Álvaro Ruiz', estudiante:'Álvaro Ruiz', tipo:'Otro', prioridad:'Baja', estado:'En proceso', creado:'2025-09-08', actualizado:'2025-09-09', traza:'basico', files:[{name:'Justificación.pdf', size:'210 KB'}], steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-08' : null, done: null })), current: 0 },
    { id:'C-2106', titulo:'Corrección de notas - Elena Díaz', estudiante:'Elena Díaz', tipo:'Otro', prioridad:'Urgente', estado:'En proceso', creado:'2025-09-04', actualizado:'2025-09-06', traza:'validacion', files:[{name:'Evidencia.png', size:'320 KB'}], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-04' : null, done: idx<2? (idx===0? '2025-09-05':'2025-09-06') : null })), current: 2 },
    { id:'C-2107', titulo:'Solicitud de beca - Javier León', estudiante:'Javier León', tipo:'Otro', prioridad:'Alta', estado:'En proceso', creado:'2025-09-10', actualizado:'2025-09-11', traza:'validacion', files:[{name:'Formulario.pdf', size:'95 KB'}], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-10' : null, done: null })), current: 1 },
    { id:'C-2108', titulo:'Validación de sílabo - Sara Molina', estudiante:'Sara Molina', tipo:'Otro', prioridad:'Media', estado:'Publicado', creado:'2025-09-05', actualizado:'2025-09-08', traza:'basico', files:[], steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-05': null, done: idx<1? '2025-09-06' : null })), current: 1 },
    { id:'C-2109', titulo:'Aval de prácticas - Hugo Rivas', estudiante:'Hugo Rivas', tipo:'Otro', prioridad:'Media', estado:'En proceso', creado:'2025-09-12', actualizado:'2025-09-13', traza:'validacion', files:[{name:'Carta.pdf', size:'140 KB'}], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-12': null, done: null })), current: 1 },
    { id:'C-2110', titulo:'Solicitud de titulación - Karla Peña', estudiante:'Karla Peña', tipo:'Otro', prioridad:'Alta', estado:'Borrador', creado:'2025-09-14', actualizado:'2025-09-14', traza:'basico', files:[], steps: flowMap.basico.map((s)=>({ ...s })), current: 0 },
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
          casos.unshift({ id:req.id, titulo:req.titulo, estudiante:req.estudiante, tipo:req.tipo||'Otro', prioridad:req.prioridad||'Media', estado:req.estado||'En proceso', creado:req.creado, actualizado:req.actualizado||req.creado, traza:req.traza||'validacion', files:(req.files||[]).map(f => ({name:f.name, size:(f.size? (Math.round(f.size/1024)+' KB') : '—')})), steps, current:req.current||0 });
        }
      });
    }
  }catch(err){ console.warn('No se pudo integrar solicitudes externas', err); }

  function fmtDate(d){ return d || '—'; }
  function daysBetween(d1, d2){ if(!d1 || !d2) return null; const a = new Date(d1+'T00:00:00'); const b = new Date(d2+'T00:00:00'); return Math.round((b - a) / (1000*60*60*24)); }

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
    segList?.querySelectorAll('.seg-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
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
    if(segFiles){
      segFiles.innerHTML = '';
      c.files.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="file-ico">📎</span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span><span class="file-actions"><button class="btn-ghost btn-small js-view" type="button">Ver</button><button class="btn-primary btn-small js-dl" type="button">Descargar</button></span>`;
        li.querySelector('.js-view')?.addEventListener('click', ()=> openFileModal(c.id, f));
        li.querySelector('.js-dl')?.addEventListener('click', ()=> downloadFile(c.id, f));
        segFiles.appendChild(li);
      });
    }
    if(segTl){
      segTl.innerHTML = '';
      c.steps.forEach((s, idx) => {
        const li = document.createElement('li');
        const isPending = idx > c.current;
        li.className = `tl-item ${isPending? 'pending':''}`;
        const roleClass = `role--${(s.role||'Decano').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
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
            <div class="role role-badge ${roleClass}"><span class="dot"></span>${s.role || 'Decano'}</div>
          </div>`;
        segTl.appendChild(li);
      });
    }
    if(segNext && segResol){
      const isLast = c.current >= c.steps.length-1;
      segNext.hidden = isLast;
      segResol.hidden = !isLast;
      segNext.onclick = () => avanzarCaso(c.id);
      segResol.onclick = () => resolverCaso(c.id);
    }
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
    const idx = c.current;
    if(c.steps[idx] && !c.steps[idx].done){ if(!c.steps[idx].started) c.steps[idx].started = now; c.steps[idx].done = now; }
    if(c.current < c.steps.length-1){ c.current += 1; if(!c.steps[c.current].started) c.steps[c.current].started = now; c.estado = c.current >= c.steps.length-1 ? 'En resolución' : 'En proceso'; }
    c.actualizado = now;
    renderSegList();
    selectCaso(id);
  }

  function resolverCaso(id){
    const c = casos.find(x => x.id === id);
    if(!c) return;
    const now = new Date().toISOString().slice(0,10);
    const last = c.steps.length-1;
    if(!c.steps[last].started) c.steps[last].started = now;
    c.steps[last].done = now;
    c.current = last;
    c.estado = 'Finalizado';
    c.actualizado = now;
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
  document.getElementById('seg-rechazar')?.addEventListener('click', ()=>{ const active = segDetId?.textContent?.trim(); if(active) openRejModal(active); });
  rejClose?.addEventListener('click', closeRejModal);
  rejCancel?.addEventListener('click', closeRejModal);
  rejModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeRejModal(); });
  rejConfirm?.addEventListener('click', ()=>{
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
  });

  // File preview/download
  const fileModal = document.getElementById('file-modal');
  const fileClose = document.getElementById('file-close');
  const fileMeta = document.getElementById('file-meta');
  const filePreview = document.getElementById('file-preview');
  const fileDl = document.getElementById('file-dl');
  let fileCtx = { id:null, file:null };
  function openFileModal(id, file){ fileCtx = { id, file }; fileMeta && (fileMeta.textContent = `${file.name} · ${file.size}`); filePreview && (filePreview.textContent = 'No hay vista previa disponible para este archivo.'); fileModal && (fileModal.hidden = false); }
  function closeFileModal(){ fileCtx = { id:null, file:null }; if(fileModal) fileModal.hidden = true; }
  function downloadFile(id, file){ const blob = new Blob([`Contenido simulado para ${file.name} del caso ${id}`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove(); }
  fileClose?.addEventListener('click', closeFileModal);
  fileModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeFileModal(); });
  fileDl?.addEventListener('click', ()=>{ if(fileCtx.file) downloadFile(fileCtx.id, fileCtx.file); });

  segQ?.addEventListener('input', renderSegList);
  renderSegList();

  // ==========================
  // Notificaciones (Decano)
  // ==========================
  const coNotifList = document.getElementById('co-notif-list');
  const statUnread = document.getElementById('co-stat-unread');
  const statWeek = document.getElementById('co-stat-week');
  const statImportant = document.getElementById('co-stat-important');
  const statTotal = document.getElementById('co-stat-total');
  const statSched = document.getElementById('co-stat-sched');

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
  ];

  function loadCoPrefs(){
    try{
      const raw = localStorage.getItem('deNotifPrefs');
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
      if(cfg.days){ Object.keys(cfg.days).forEach(k => { if(p.days && k in p.days) cfg.days[k].checked = !!p.days[k]; }); }
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
    localStorage.setItem('deNotifPrefs', JSON.stringify(p));
    updateCoStats();
  showStatus('Preferencias guardadas', 'success');
  }
  function resetCoPrefs(){ localStorage.removeItem('deNotifPrefs'); loadCoPrefs(); updateCoStats(); }

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
    notifIco && (notifIco.textContent = n.icon || '🔔');
    notifTitle && (notifTitle.textContent = n.title || 'Notificación');
    notifDesc && (notifDesc.textContent = n.desc || '');
    notifTime && (notifTime.textContent = n.time || '');
    notifModal && (notifModal.hidden = false);
  }
  function closeNotifModal(){ if(notifModal) notifModal.hidden = true; }
  notifClose?.addEventListener('click', closeNotifModal);
  notifModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeNotifModal(); });
  notifMark?.addEventListener('click', ()=>{ const n = coNotifs.find(x=>x.id===notifCtx.id); if(n){ n.read = true; renderCoNotifs(); try{ showStatus('Notificación marcada como leída','success'); }catch{} } closeNotifModal(); });
  notifGoto?.addEventListener('click', ()=>{
    const caseId = notifCtx.caseId;
    const itemSeguimiento = Array.from(document.querySelectorAll('.nav__item')).find(a=>a.getAttribute('data-key')==='seguimiento');
    itemSeguimiento?.click();
    if(caseId){ setTimeout(()=>{ selectCaso(caseId); }, 50); }
    closeNotifModal();
  });

  function updateCoStats(){
    const unread = coNotifs.filter(n => !n.read).length;
    const important = coNotifs.filter(n => n.important).length;
    const total = coNotifs.length;
    statUnread && (statUnread.textContent = String(unread));
    statImportant && (statImportant.textContent = String(important));
    statTotal && (statTotal.textContent = String(total));
    statWeek && (statWeek.textContent = String(Math.max(5, Math.ceil(total*0.6))));
    const pRaw = localStorage.getItem('deNotifPrefs');
    if(pRaw){ try{ const p = JSON.parse(pRaw); statSched && (statSched.textContent = p.available === false ? 'Pausado' : `${p.start||'08:00'}-${p.end||'18:00'}`); }catch{} }
  }
  cfg.saveBtn?.addEventListener('click', saveCoPrefs);
  cfg.resetBtn?.addEventListener('click', resetCoPrefs);
  loadCoPrefs();
  renderCoNotifs();

  // ==========================
  // Reportes (Decano)
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

  function toDate(s){ return s ? new Date(s+'T00:00:00') : null; }
  function dateInRange(d, from, to){ if(!d) return false; if(from && d < from) return false; if(to && d > to) return false; return true; }
  function durationDays(s,e){ if(!s||!e) return null; return Math.max(0, Math.round((toDate(e)-toDate(s))/(1000*60*60*24))); }

  function getHistory(){
    const hist = [];
    let sys = {};
    try{ sys = JSON.parse(localStorage.getItem('sysSettings')||'{}'); }catch{}
    const sla = {
      Certificados: sys?.sla?.cert ?? 3,
      'Certificados académicos': sys?.sla?.cert ?? 3,
      'Cambio de carrera': sys?.sla?.cambio ?? 7,
      Homologación: sys?.sla?.homol ?? 10,
      'Baja de matrícula': sys?.sla?.baja ?? 5,
      Otro: 5,
    };
    casos.forEach(c => {
      const lastStep = c.steps[c.steps.length-1];
      const resolved = c.estado === 'Finalizado' ? (lastStep?.done || c.actualizado) : null;
      const slaVal = sla[c.tipo] ?? 5;
      hist.push({ id: c.id, titulo: c.titulo, tipo: c.tipo, prioridad: c.prioridad, estado: c.estado, creado: c.creado, resuelto: resolved, dias: durationDays(c.creado, resolved), sla: slaVal });
    });
    rows.slice(0,4).forEach((r,i)=>{
      const creado = '2025-08-'+String(10+i).padStart(2,'0');
      const dias = (r.prioridad==='Urgente'? 2 : r.prioridad==='Alta'? 4 : 6);
      const resuelto = '2025-08-'+String(10+i+dias).padStart(2,'0');
      const slaVal = sla[r.tipo] ?? 5;
      hist.push({ id: 'H-'+r.id, titulo: r.titulo, tipo: r.tipo, prioridad: r.prioridad, estado:'Finalizado', creado, resuelto, dias, sla:slaVal });
    });
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
    const total = data.length;
    const finalizados = data.filter(d => d.estado==='Finalizado');
    const rechazados = data.filter(d => d.estado==='Rechazado');
    const enproc = data.filter(d => d.estado==='En proceso');
    const prom = Math.round((finalizados.map(d=>d.dias||0).reduce((a,b)=>a+b,0) / Math.max(finalizados.length,1)) || 0);
    const tasaRes = total? Math.round((finalizados.length/total)*100) : 0;
    const tasaRech = total? Math.round((rechazados.length/total)*100) : 0;
    const slaCumpl = finalizados.length? Math.round((finalizados.filter(d => (d.dias||0) <= d.sla).length / finalizados.length)*100) : 0;
    kpiProm && (kpiProm.textContent = `${prom} d`);
    kpiTotal && (kpiTotal.textContent = String(total));
    kpiRes && (kpiRes.textContent = `${tasaRes}%`);
    kpiRech && (kpiRech.textContent = `${tasaRech}%`);
    kpiSla && (kpiSla.textContent = `${slaCumpl}%`);
    const byType = {}; data.forEach(d => { byType[d.tipo] = (byType[d.tipo]||0)+1; }); repaintBars(byType);
    repaintDonut(finalizados.length, enproc.length, rechazados.length);
    if(repTable){ repTable.innerHTML = ''; data.forEach(d => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${d.id}</td><td>${d.titulo}</td><td>${d.tipo}</td><td>${d.prioridad}</td><td>${d.estado}</td><td>${d.creado||'—'}</td><td>${d.resuelto||'—'}</td><td>${d.dias??'—'}</td><td>${d.sla}d</td>`; repTable.appendChild(tr); }); }
  }

  function exportCSV(){
    const all = getHistory();
    const data = applyRepFilters(all);
    const rowsCsv = [['ID','Título','Tipo','Prioridad','Estado','Creado','Resuelto','Días','SLA']].concat(data.map(d => [d.id,d.titulo,d.tipo,d.prioridad,d.estado,d.creado||'',d.resuelto||'',String(d.dias??''),String(d.sla)]));
    const csv = rowsCsv.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reportes-decano.csv'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  }
  function printReports(){ window.print(); }
  repDesde?.addEventListener('change', renderReports);
  repHasta?.addEventListener('change', renderReports);
  repTipo?.addEventListener('change', renderReports);
  repPrio?.addEventListener('change', renderReports);
  repEstado?.addEventListener('change', renderReports);
  repQ?.addEventListener('input', renderReports);
  document.getElementById('rep-export')?.addEventListener('click', exportCSV);
  document.getElementById('rep-print')?.addEventListener('click', printReports);
  document.getElementById('rep-clear')?.addEventListener('click', ()=>{ if(repDesde) repDesde.value=''; if(repHasta) repHasta.value=''; if(repTipo) repTipo.value=''; if(repPrio) repPrio.value=''; if(repEstado) repEstado.value=''; if(repQ) repQ.value=''; renderReports(); });

  // ==========================
  // Administración (Decano)
  // ==========================
  const admMaint = document.getElementById('adm-maint');
  const admBanner = document.getElementById('adm-banner');
  const admTimeout = document.getElementById('adm-timeout');
  const admColor = document.getElementById('adm-color');
  const admLogo = document.getElementById('adm-logo');
  const adm2fa = document.getElementById('adm-2fa');
  const admRotate = document.getElementById('adm-rotate');
  const admDefWa = document.getElementById('adm-def-wa');
  const admDefMail = document.getElementById('adm-def-mail');
  const admDefApp = document.getElementById('adm-def-app');
  const admDefSms = document.getElementById('adm-def-sms');
  const admSlaCert = document.getElementById('adm-sla-cert');
  const admSlaCambio = document.getElementById('adm-sla-cambio');
  const admSlaHomol = document.getElementById('adm-sla-homol');
  const admSlaBaja = document.getElementById('adm-sla-baja');
  const admExport = document.getElementById('adm-export');
  const admImport = document.getElementById('adm-import');
  const admReset = document.getElementById('adm-reset');
  const admSave = document.getElementById('adm-save');

  const SYS_KEY = 'sysSettings';

  function applyBanner(p){
    const maint = !!p?.maintenance;
    const msg = p?.banner || '';
    if(sysBanner){
      if(maint || msg){
        sysBanner.hidden = false;
        if(sysBannerText) sysBannerText.textContent = msg || 'Modo de mantenimiento activo';
      } else {
        sysBanner.hidden = true;
      }
    }
  }

  function applyBranding(p){
    const color = p?.color || '';
    if(color){
      document.documentElement.style.setProperty('--accent', color);
      document.documentElement.style.setProperty('--border', color);
    }
    const logoUrl = p?.logo || '';
    if(logoUrl){
      const img = document.querySelector('.brand-bar img');
      if(img) img.src = logoUrl;
    }
  }

  function loadSysSettings(){
    let p = {};
    try{ p = JSON.parse(localStorage.getItem(SYS_KEY) || '{}'); }catch{}
    if(admMaint) admMaint.checked = !!p.maintenance;
    if(admBanner) admBanner.value = p.banner || '';
    if(admTimeout) admTimeout.value = p.timeoutMinutes || '';
    if(admColor) admColor.value = p.color || '';
    if(admLogo) admLogo.value = p.logo || '';
    if(adm2fa) adm2fa.checked = !!p.force2fa;
    if(admRotate) admRotate.value = p.rotateDays ?? '';
    if(admDefWa) admDefWa.checked = !!p.defaults?.wa;
    if(admDefMail) admDefMail.checked = p.defaults?.mail !== false;
    if(admDefApp) admDefApp.checked = p.defaults?.app !== false;
    if(admDefSms) admDefSms.checked = !!p.defaults?.sms;
    if(admSlaCert) admSlaCert.value = p.sla?.cert ?? '';
    if(admSlaCambio) admSlaCambio.value = p.sla?.cambio ?? '';
    if(admSlaHomol) admSlaHomol.value = p.sla?.homol ?? '';
    if(admSlaBaja) admSlaBaja.value = p.sla?.baja ?? '';
    // Apply live aspects
    applyBanner(p);
    applyBranding(p);
  }

  function getSysSettings(){
    return {
      maintenance: !!admMaint?.checked,
      banner: admBanner?.value?.trim() || '',
      timeoutMinutes: admTimeout?.value ? parseInt(admTimeout.value,10) : undefined,
      color: admColor?.value?.trim() || '',
      logo: admLogo?.value?.trim() || '',
      force2fa: !!adm2fa?.checked,
      rotateDays: admRotate?.value ? parseInt(admRotate.value,10) : undefined,
      defaults: {
        wa: !!admDefWa?.checked,
        mail: !!admDefMail?.checked,
        app: !!admDefApp?.checked,
        sms: !!admDefSms?.checked,
      },
      sla: {
        cert: admSlaCert?.value ? parseInt(admSlaCert.value,10) : undefined,
        cambio: admSlaCambio?.value ? parseInt(admSlaCambio.value,10) : undefined,
        homol: admSlaHomol?.value ? parseInt(admSlaHomol.value,10) : undefined,
        baja: admSlaBaja?.value ? parseInt(admSlaBaja.value,10) : undefined,
      }
    };
  }

  function saveSysSettings(){
    const p = getSysSettings();
    localStorage.setItem(SYS_KEY, JSON.stringify(p));
    applyBanner(p);
    applyBranding(p);
  showStatus('Configuración guardada', 'success');
  }
  function resetSysSettings(){
    localStorage.removeItem(SYS_KEY);
    loadSysSettings();
  showStatus('Configuración restablecida', 'success');
  }
  function exportSysSettings(){
    let p = {};
    try{ p = JSON.parse(localStorage.getItem(SYS_KEY) || '{}'); }catch{}
    const blob = new Blob([JSON.stringify(p,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sys-settings.json'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  }
  function importSysSettings(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
  try{ const p = JSON.parse(String(reader.result||'{}')); localStorage.setItem(SYS_KEY, JSON.stringify(p)); loadSysSettings(); showStatus('Configuración importada', 'success'); }
  catch{ showStatus('Archivo inválido', 'warn'); }
    };
    reader.readAsText(file);
  }

  admSave?.addEventListener('click', saveSysSettings);
  admReset?.addEventListener('click', resetSysSettings);
  admExport?.addEventListener('click', exportSysSettings);
  admImport?.addEventListener('change', (e)=> importSysSettings(e.target.files?.[0]));

  // --- Administración: Usuarios ---
  (function initAdminUsers(){
    const U_STORAGE = 'sysUsers';
    const uTableEl = document.getElementById('u-table');
    const uTbody = uTableEl?.querySelector('tbody');
    if(!uTableEl || !uTbody) return; // if markup not present, skip

    const uTotal = document.getElementById('u-total');
    const uAct = document.getElementById('u-activos');
    const uBloq = document.getElementById('u-bloq');
    const uLast = document.getElementById('u-last');
    const u2fa = document.getElementById('u-2fa');
    const uFilRol = document.getElementById('u-fil-rol');
    const uFilEstado = document.getElementById('u-fil-estado');
    const uQ = document.getElementById('u-q');
    const uClear = document.getElementById('u-clear');

    function seedUsers(){
      const ex = localStorage.getItem(U_STORAGE);
      if (ex) return;
      const now = Date.now();
      const day = 86400000;
      const sample = [
        // Coordinadores (con Carrera)
        { id: 'u1', nombre: 'Luis García', correo: 'luis.garcia@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 2*day, twofa: true },
        { id: 'u2', nombre: 'Paola Ramos', correo: 'paola.ramos@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 6*day, twofa: false },
        { id: 'u3', nombre: 'Diego Torres', correo: 'diego.torres@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'bloqueado', last: now - 1*day, twofa: false },
        // 5 adicionales - Coordinadores de Ciencias de la Computación
        { id: 'u8', nombre: 'Andrea Silva', correo: 'andrea.silva@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 4*day, twofa: true },
        { id: 'u9', nombre: 'Ricardo Pineda', correo: 'ricardo.pineda@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 9*day, twofa: false },
        { id: 'u10', nombre: 'Daniela Flores', correo: 'daniela.flores@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'bloqueado', last: now - 14*day, twofa: false },
        { id: 'u11', nombre: 'Héctor Vargas', correo: 'hector.vargas@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 7*day, twofa: true },
        { id: 'u12', nombre: 'Camila Ortega', correo: 'camila.ortega@uni.edu', rol: 'Coordinador', carrera: 'Ciencias de la Computación', estado: 'activo', last: now - 5*day, twofa: true },
        // Otros roles
        { id: 'u4', nombre: 'María López', correo: 'maria.lopez@uni.edu', rol: 'Decano', estado: 'activo', last: now - 30*day, twofa: true },
        { id: 'u5', nombre: 'Ana Pérez', correo: 'ana.perez@uni.edu', rol: 'Estudiante', estado: 'activo', last: now - 12*day, twofa: true },
        { id: 'u6', nombre: 'Jorge Medina', correo: 'jorge.medina@uni.edu', rol: 'Estudiante', estado: 'bloqueado', last: now - 3*day, twofa: false },
        { id: 'u7', nombre: 'Sofía Rivas', correo: 'sofia.rivas@uni.edu', rol: 'Estudiante', estado: 'activo', last: now - 10*day, twofa: true }
      ];
      localStorage.setItem(U_STORAGE, JSON.stringify(sample));
    }

    function getUsers(){ try { return JSON.parse(localStorage.getItem(U_STORAGE) || '[]'); } catch { return []; } }
    function setUsers(list){ localStorage.setItem(U_STORAGE, JSON.stringify(list)); }

    function formatDate(ts){ if(!ts) return '—'; const d = new Date(ts); return d.toLocaleDateString('es-PE', {year:'numeric', month:'2-digit', day:'2-digit'}); }

    function computeStats(list){
      const total = list.length;
      const activos = list.filter(u => u.estado === 'activo').length;
      const bloq = list.filter(u => u.estado === 'bloqueado').length;
      const last = list.reduce((max, u) => Math.max(max, u.last || 0), 0);
      const with2fa = list.filter(u => u.twofa).length;
      const pct2fa = total ? Math.round(with2fa*100/total) : 0;
      return { total, activos, bloq, last, pct2fa };
    }

    function renderStats(list){
      const s = computeStats(list);
      if(uTotal) uTotal.textContent = String(s.total);
      if(uAct) uAct.textContent = String(s.activos);
      if(uBloq) uBloq.textContent = String(s.bloq);
      if(uLast) uLast.textContent = s.last ? formatDate(s.last) : '—';
      if(u2fa) u2fa.textContent = `${s.pct2fa}%`;
    }

    function passFilters(u){
      const role = uFilRol?.value || '';
      const est = uFilEstado?.value || '';
      const q = (uQ?.value || '').trim().toLowerCase();
      if (role && u.rol !== role) return false;
      if (est && u.estado !== est) return false;
      if (q && !(u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q))) return false;
      return true;
    }

    function renderUsers(){
      const list = getUsers();
      // Decano solo ve Coordinadores
      const filtered = list.filter(u => u.rol === 'Coordinador').filter(passFilters);
      // Stats sobre conjunto visible
      renderStats(filtered);
      uTbody.innerHTML = '';
      for(const u of filtered){
        const tr = document.createElement('tr');
        const estadoBadge = u.estado === 'activo'
          ? '<span class="badge badge--ok">Activo</span>'
          : '<span class="badge badge--warn">Bloqueado</span>';
        tr.innerHTML = `
          <td data-th="Usuario">${u.nombre}</td>
          <td data-th="Correo">${u.correo}</td>
          <td data-th="Rol">${u.rol}</td>
          <td data-th="Carrera">${u.carrera || '—'}</td>
          <td data-th="Estado">${estadoBadge}</td>
          <td data-th="Último acceso">${formatDate(u.last)}</td>
          <td data-th="2FA">${u.twofa ? 'Sí' : 'No'}</td>
          <td data-th="Acciones">
            ${u.estado === 'activo'
              ? `<button class="btn-mini btn-ghost" data-action="block" data-id="${u.id}">Bloquear</button>`
              : `<button class="btn-mini btn-primary" data-action="unblock" data-id="${u.id}">Desbloquear</button>`}
          </td>`;
        uTbody.appendChild(tr);
      }
    }

    function onUserAction(e){
      const btn = e.target.closest('button[data-action]');
      if(!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const list = getUsers();
      const idx = list.findIndex(u => u.id === id);
      if(idx === -1) return;
      if(action === 'block') list[idx].estado = 'bloqueado';
      if(action === 'unblock') list[idx].estado = 'activo';
      setUsers(list);
      renderUsers();
    }

    function hookUserFilters(){
      uFilRol?.addEventListener('change', renderUsers);
      uFilEstado?.addEventListener('change', renderUsers);
      uQ?.addEventListener('input', renderUsers);
      uClear?.addEventListener('click', ()=>{ if(uFilRol) uFilRol.value=''; if(uFilEstado) uFilEstado.value=''; if(uQ) uQ.value=''; renderUsers(); });
      uTableEl.addEventListener('click', onUserAction);
    }

    seedUsers();
    hookUserFilters();
    renderUsers();
  })();

  // Live banner/branding preview
  admMaint?.addEventListener('change', ()=> applyBanner(getSysSettings()));
  admBanner?.addEventListener('input', ()=> applyBanner(getSysSettings()));
  admColor?.addEventListener('input', ()=> applyBranding(getSysSettings()));

  // Apply settings on startup
  loadSysSettings();
});
