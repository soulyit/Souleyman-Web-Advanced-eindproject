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

async function laadCategorieën() {
  document.getElementById('inhoud').innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';
  const r = await fetch(API + 'categories.php');
  const d = await r.json();
  let html = '<div class="cat-grid">';
  d.categories.forEach(c => {
    html += '<div class="cat-card" onclick="kiesCategorie(\'' + c.strCategory + '\')">'
      + '<img src="' + c.strCategoryThumb + '" alt="' + c.strCategory + '" loading="lazy">'
      + '<div class="cat-card-body">'
      + '<div class="cat-name">' + c.strCategory + '</div>'
      + '<div class="cat-count">' + (c.strCategoryDescription || '').slice(0, 40) + '…</div>'
      + '</div></div>';
  });
  html += '</div>';
  document.getElementById('inhoud').innerHTML = html;
}

async function kiesCategorie(cat) {
  document.getElementById('inhoud').innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';
  const r = await fetch(API + 'filter.php?c=' + encodeURIComponent(cat));
  const d = await r.json();
  if (!d.meals) {
    document.getElementById('inhoud').innerHTML = '<p style="text-align:center;color:#5a7a5a;padding:28px">Geen recepten gevonden.</p>';
    return;
  }
  let html = '<div class="results">'
    + '<div class="results-header">'
    + '<div class="back-btn" onclick="laadCategorieën()"><i class="ti ti-arrow-left"></i> Terug</div>'
    + '<div class="results-title">' + cat + ' — ' + d.meals.length + ' recepten</div>'
    + '</div><div class="meal-grid">';

  d.meals.forEach(m => {
    // ✅ hartje toegevoegd
    html += '<div class="meal-card" onclick="laadDetail(\'' + m.idMeal + '\',\'' + cat + '\')">'
      + '<img src="' + m.strMealThumb + '/preview" alt="' + m.strMeal + '" loading="lazy">'
      + '<div class="meal-card-body">'
      + '<div class="meal-name">' + m.strMeal + '</div>'
      + '<button class="fav-btn" id="fav-' + m.idMeal + '" onclick="toggleFavoriet(\'' + m.idMeal + '\',\'' + m.strMeal.replace(/'/g, "\\'") + '\',\'' + m.strMealThumb + '\',event)">'
      + (isFavoriet(m.idMeal) ? '❤️' : '🤍')
      + '</button>'
      + '</div></div>';
  });

  html += '</div></div>';
  document.getElementById('inhoud').innerHTML = html;
}

async function laadDetail(id, cat) {
  document.getElementById('inhoud').innerHTML = '<div class="loader"><div class="spin"></div> Laden...</div>';
  const r = await fetch(API + 'lookup.php?i=' + id);
  const d = await r.json();
  const m = d.meals[0];
  const ingr = [];
  for (let i = 1; i <= 20; i++) {
    if (m['strIngredient' + i] && m['strIngredient' + i].trim())
      ingr.push({ naam: m['strIngredient' + i], hoeveelheid: m['strMeasure' + i] || '' });
  }
  document.getElementById('inhoud').innerHTML = '<div class="results"><div class="detail-card">'
    + '<div class="back-btn" onclick="kiesCategorie(\'' + (cat || m.strCategory) + '\')" style="margin-bottom:16px"><i class="ti ti-arrow-left"></i> Terug</div>'
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
    + '</div></div>';
}

window.kiesCategorie = kiesCategorie;
window.laadDetail = laadDetail;
window.laadCategorieën = laadCategorieën;
window.toggleFavoriet = toggleFavoriet;

laadCategorieën();
