const API = 'https://www.themealdb.com/api/json/v1/1/';

// laad alle gebieden als knoppen
async function laadGebieden() {
  const r = await fetch(API + 'list.php?a=list');
  const d = await r.json();
  const container = document.getElementById('area-buttons');

  d.meals.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'area-btn';
    btn.textContent = a.strArea;
    btn.onclick = () => kiesGebied(a.strArea, btn);
    container.appendChild(btn);
  });
}

// laad recepten van gekozen gebied
async function kiesGebied(area, btn) {
  // actieve knop bijhouden
  document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // loader tonen
  const results = document.getElementById('results');
  results.innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';

  const r = await fetch(API + 'filter.php?a=' + encodeURIComponent(area));
  const d = await r.json();

  if (!d.meals) {
    results.innerHTML = '<p class="placeholder">Geen recepten gevonden.</p>';
    return;
  }

  let html = '<div class="results-title">' + area + ' — ' + d.meals.length + ' recepten</div>';
  html += '<div class="meal-grid">';
  d.meals.forEach(m => {
    html += '<div class="meal-card" onclick="laadDetail(\'' + m.idMeal + '\')">'
      + '<img src="' + m.strMealThumb + '/preview" alt="' + m.strMeal + '" loading="lazy">'
      + '<div class="meal-card-body"><div class="meal-name">' + m.strMeal + '</div></div>'
      + '</div>';
  });
  html += '</div>';
  results.innerHTML = html;
}

// laad detail van een recept
async function laadDetail(id) {
  const results = document.getElementById('results');
  results.innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';

  const r = await fetch(API + 'lookup.php?i=' + id);
  const d = await r.json();
  const m = d.meals[0];

  const ingr = [];
  for (let i = 1; i <= 20; i++) {
    if (m['strIngredient' + i] && m['strIngredient' + i].trim()) {
      ingr.push({ naam: m['strIngredient' + i], hoeveelheid: m['strMeasure' + i] || '' });
    }
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

laadGebieden();