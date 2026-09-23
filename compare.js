<!-- Compare Hospitals JavaScript -->

const ids=compareList();const count=document.getElementById('compareCount'),table=document.getElementById('compareTable');
async function renderCompare(){
  count.textContent=`${ids.length} hospital${ids.length===1?'':'s'} selected`;
  if(!ids.length){table.innerHTML=`<div class="empty-state"><div class="empty-icon">＋</div><h2>Nothing to compare yet.</h2><p>Choose up to three hospitals from the search results and they will appear here side by side.</p><a class="primary-btn" href="hospitals.html">Find hospitals <span>→</span></a></div>`;return;}
  table.innerHTML='<div class="loading-state"><strong>Preparing comparison...</strong><p>Loading hospital information.</p></div>';
  try{
    const selected=(await Promise.all(ids.map(id=>apiHospital(id)))).map(x=>x.data);
    table.innerHTML=`<div class="compare-grid"><div class="compare-labels"><div>Hospital</div><div>Type</div><div>Rating</div><div>Distance</div><div>Estimated cost</div><div>Emergency</div><div>ICU</div><div>Diagnostics</div><div>Cashless</div><div>Departments</div><div></div></div>${selected.map(h=>`<div class="compare-col"><div class="compare-hospital"><div class="hospital-symbol">✚</div><strong>${h.name}</strong>${h.verified?'<span class="verified-pill">✓ Verified</span>':''}<button class="remove-compare" data-remove="${h.id}">×</button></div><div>${h.type}</div><div><span class="rating">★ ${h.rating}</span> <small>(${h.reviews})</small></div><div>${h.distance} km</div><div><strong>${h.cost}</strong></div><div>${h.emergency?'✓ Available':'—'}</div><div>${h.icu?'✓ Available':'—'}</div><div>${h.diagnostics?'✓ Available':'—'}</div><div>${h.cashless?'✓ Listed':'—'}</div><div>${h.departments.join(', ')}</div><div><a class="secondary-btn small-btn" href="hospital.html?id=${h.id}">View details <span>→</span></a></div></div>`).join('')}</div>`;
    document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{setCompare(compareList().filter(x=>x!==String(b.dataset.remove)));location.reload()}));
  }catch(e){table.innerHTML=`<div class="empty-state"><h2>Could not load comparison.</h2><p>${e.message}</p></div>`;}
}
document.getElementById('clearCompare').addEventListener('click',()=>{setCompare([]);location.reload()});renderCompare();
