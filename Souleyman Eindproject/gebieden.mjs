const API = 'https://www.themealdb.com/api/json/v1/1/';
let favorieten = JSON.parse(localStorage.getItem('foodmax_favorieten') || '[]');

function isFavoriet(id) {
  return favorieten.some(f => f.id === id);
}

function toggleFavoriet(id, naam, thumb, event) {
  event.stopPropagation();
  if (isFavoriet(id)) {
    favorieten = favorieten.filter(f => f.id !== id);
  } else {
    favorieten.push({ id, naam, thumb });
  }
  localStorage.setItem('foodmax_favorieten', JSON.stringify(favorieten));
  const btn = document.getElementById('fav-' + id);
  if (btn) btn.textContent = isFavoriet(id) ? '❤️' : '🤍';
}

async function laadGebieden() {
  document.getElementById('inhoud-gebieden').innerHTML = '<div class="loader"><div class="spin"></div> Gebieden laden...</div>';
  const r = await fetch(API + 'list.php?a=list');
  const d = await r.json();
  document.getElementById('inhoud-gebieden').innerHTML = '<div class="area-buttons" id="area-buttons"></div><div class="results" id="results"><p class="placeholder">Kies een gebied hierboven.</p></div>';
  const container = document.getElementById('area-buttons');
  const checks = d.meals.map(a =>
    fetch(API + 'filter.php?a=' + encodeURIComponent(a.strArea))
      .then(r => r.json())
      .then(data => ({ area: a.strArea, heeft: data.meals && data.meals.length > 0 }))
      .catch(() => ({ area: a.strArea, heeft: false }))
  );
  const resultaten = await Promise.all(checks);
  resultaten.filter(r => r.heeft).forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'area-btn';
    btn.textContent = r.area;
    btn.onclick = () => kiesGebied(r.area, btn);
    container.appendChild(btn);
  });
}

async function kiesGebied(area, btn) {
  document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const results = document.getElementById('results');
  results.innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';
  const r = await fetch(API + 'filter.php?a=' + encodeURIComponent(area));
  const d = await r.json();
  if (!d.meals) { results.innerHTML = '<p class="placeholder">Geen recepten gevonden.</p>'; return; }
  let html = '<div class="results-title">' + area + ' — ' + d.meals.length + ' recepten</div>';
  html += '<div class="meal-grid">';
  d.meals.forEach(m => {
    // ✅ hartje toegevoegd
    html += '<div class="meal-card" onclick="laadDetail(\'' + m.idMeal + '\')">'
      + '<img src="' + m.strMealThumb + '/preview" alt="' + m.strMeal + '" loading="lazy">'
      + '<div class="meal-card-body">'
      + '<div class="meal-name">' + m.strMeal + '</div>'
      + '<button class="fav-btn" id="fav-' + m.idMeal + '" onclick="toggleFavoriet(\'' + m.idMeal + '\',\'' + m.strMeal.replace(/'/g, "\\'") + '\',\'' + m.strMealThumb + '\',event)">'
      + (isFavoriet(m.idMeal) ? '❤️' : '🤍')
      + '</button>'
      + '</div></div>';
  });
  html += '</div>';
  results.innerHTML = html;
}

async function laadDetail(id) {
  const results = document.getElementById('results');
  results.innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';
  const r = await fetch(API + 'lookup.php?i=' + id);
  const d = await r.json();
  const m = d.meals[0];
  const ingr = [];
  for (let i = 1; i <= 20; i++) {
    if (m['strIngredient' + i] && m['strIngredient' + i].trim())
      ingr.push({ naam: m['strIngredient' + i], hoeveelheid: m['strMeasure' + i] || '' });
  }
  const actieveKnop = document.querySelector('.area-btn.active');
  const actieveArea = actieveKnop ? actieveKnop.textContent : '';
  results.innerHTML = '<div class="detail-card">'
    + '<div class="back" onclick="kiesGebied(\'' + actieveArea + '\', document.querySelector(\'.area-btn.active\'))"><i class="ti ti-arrow-left"></i> Terug</div>'
    + '<img src="' + m.strMealThumb + '" alt="' + m.strMeal + '">'
    + '<h2>' + m.strMeal + '</h2>'
    + (m.strCategory ? '<span class="badge">' + m.strCategory + '</span>' : '')
    + (m.strArea ? '<span class="badge">' + m.strArea + '</span>' : '')
    + '<p class="detail-desc">' + (m.strInstructions || '').slice(0, 300) + '…</p>'
    + '<div class="ingr-title">Ingrediënten</div>'
    + '<div class="ingr-grid">'
    + ingr.map(i => '<div class="ingr-row"><span>' + i.naam + '</span><span>' + i.hoeveelheid + '</span></div>').join('')
    + '</div>'
    + (m.strYoutube ? '<a class="yt-link" href="' + m.strYoutube + '" target="_blank"><i class="ti ti-brand-youtube"></i> Bekijk op YouTube</a>' : '')
    + '</div>';
}

window.kiesGebied = kiesGebied;
window.laadDetail = laadDetail;
window.laadGebieden = laadGebieden;
window.toggleFavoriet = toggleFavoriet;

laadGebieden();