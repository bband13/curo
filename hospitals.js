const params = new URLSearchParams(location.search);
const initialTerm = params.get('q') || 'heart care';
const initialLocation = params.get('location') || '';
const resultTerm = document.getElementById('resultTerm'), resultSearch = document.getElementById('resultSearch'), resultLocation = document.getElementById('resultLocation'), listEl = document.getElementById('hospitalList'), countEl = document.getElementById('resultCount');
resultSearch.value = initialTerm; if (resultLocation) resultLocation.value = initialLocation;

function currentFilters(){
  const selected = [...document.querySelectorAll('.filter-panel input[type=checkbox]:checked')].map(x=>x.value);
  return {
    type: selected.includes('multi') ? 'Multi-specialty' : selected.includes('specialty') ? 'Specialty' : '',
    emergency: selected.includes('emergency') ? 1 : 0,
    icu: selected.includes('icu') ? 1 : 0,
    diagnostics: selected.includes('diagnostics') ? 1 : 0,
    cashless: selected.includes('cashless') ? 1 : 0,
    distance: document.querySelector('.filter-panel input[name=distance]:checked')?.value || 'any'
  };
}

async function renderResults(){
  listEl.innerHTML = '<div class="loading-state"><div class="loading-dot"></div><strong>Finding hospitals...</strong><p>Searching the Curo database.</p></div>';
  try {
    const f = currentFilters();
    const payload = await apiHospitals({ q: resultSearch.value.trim() || 'care', location: resultLocation?.value.trim() || '', sort: document.getElementById('sortSelect').value, distance: f.distance !== 'any' ? f.distance : '', type:f.type, emergency:f.emergency, icu:f.icu, diagnostics:f.diagnostics, cashless:f.cashless });
    const arr = payload.data || [];
    countEl.textContent = payload.count ?? arr.length;
    resultTerm.textContent = resultSearch.value || 'care';
    listEl.innerHTML = arr.length ? arr.map(card).join('') : '<div class="empty-state"><div class="empty-icon">⌕</div><h2>No hospitals matched those filters.</h2><p>Try a broader care need, another location or clear some filters.</p></div>';
    bindCards();
  } catch (error) {
    // Keep the project usable as a frontend demo if Apache/MySQL is not running.
    const fallback = typeof CURO_HOSPITALS !== 'undefined' ? CURO_HOSPITALS : [];
    if (fallback.length) {
      const term = resultSearch.value.trim().toLowerCase();
      const arr = fallback.filter(h => !term || term === 'heart care' || `${h.name} ${h.about} ${h.departments.join(' ')}`.toLowerCase().includes(term));
      countEl.textContent = arr.length; resultTerm.textContent = resultSearch.value || 'care'; listEl.innerHTML = arr.map(card).join(''); bindCards();
      showToast('Backend not connected — showing demo data.');
    } else listEl.innerHTML = `<div class="empty-state"><h2>Could not connect to Curo.</h2><p>${error.message}</p></div>`;
  }
}
function card(h){
  const compare=compareList().includes(String(h.id));
  return `<article class="hospital-card"><div class="hospital-card-main"><div class="hospital-symbol">✚</div><div class="hospital-card-copy"><div class="hospital-title-row"><h2>${h.name}</h2>${h.verified?'<span class="verified-pill">✓ Verified</span>':''}</div><p class="muted">${h.type} · ${h.area}, ${h.city} · ${h.distance} km</p><div class="rating-line"><span class="rating">★ ${h.rating}</span><span>${h.reviews} reviews</span><span>•</span><span>${h.hours}</span></div><div class="tag-row">${h.emergency?'<span>Emergency</span>':''}${h.icu?'<span>ICU</span>':''}${h.diagnostics?'<span>Diagnostics</span>':''}${h.cashless?'<span>Cashless</span>':''}</div></div></div><div class="hospital-card-side"><div><small>Estimated treatment range</small><strong>${h.cost}</strong></div><div class="card-actions"><a class="secondary-btn small-btn" href="hospital.html?id=${h.id}">View details <span>→</span></a><button class="compare-btn ${compare?'active':''}" data-compare="${h.id}">${compare?'✓ Added':'＋ Compare'}</button></div></div></article>`;
}
function bindCards(){document.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',()=>{const list=toggleCompare(String(b.dataset.compare));renderResults();showToast(list.includes(String(b.dataset.compare))?'Hospital added to comparison':'Hospital removed from comparison')}))}
document.getElementById('resultSearchBtn').addEventListener('click',()=>{history.replaceState({},'',`hospitals.html?q=${encodeURIComponent(resultSearch.value.trim()||'care')}&location=${encodeURIComponent(resultLocation?.value.trim()||'')}`);renderResults()});
resultSearch.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('resultSearchBtn').click()});
resultLocation?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('resultSearchBtn').click()});
document.getElementById('sortSelect').addEventListener('change',renderResults); document.querySelectorAll('.filter-panel input[type=checkbox]').forEach(x=>x.addEventListener('change',renderResults));
document.getElementById('filterMobileBtn')?.addEventListener('click',()=>document.getElementById('filterPanel').classList.add('open'));document.getElementById('closeFilters')?.addEventListener('click',()=>document.getElementById('filterPanel').classList.remove('open'));document.getElementById('clearFilters')?.addEventListener('click',()=>{document.querySelectorAll('.filter-panel input[type=checkbox]').forEach(x=>x.checked=false);document.querySelector('.filter-panel input[value=any]').checked=true;renderResults();showToast('Filters cleared')});
renderResults();
