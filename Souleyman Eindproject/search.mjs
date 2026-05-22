const API = 'https://www.themealdb.com/api/json/v1/1/';
let favorieten = JSON.parse(localStorage.getItem('foodmax_favorieten') || '[]');
let huidigeResultaten = [];
let actieveZoekopdracht = '';

// Check of gerecht in favorieten zit
function isFavoriet(id) {
  return favorieten.some(f => f.id === id);
}

// Favoriet toevoegen of verwijderen
function toggleFavoriet(id, naam, thumb, event) {
  event.stopPropagation();
  
  if (isFavoriet(id)) {
    favorieten = favorieten.filter(f => f.id !== id);
    slaOp();
    toonToast('Verwijderd uit favorieten 🗑️');
    
    const btn = document.getElementById('fav-' + id);
    if (btn) btn.textContent = '🤍';
  } else {
    favorieten.push({ id, naam, thumb });
    slaOp();
    toonToast('Toegevoegd aan favorieten ❤️');
    
    const btn = document.getElementById('fav-' + id);
    if (btn) btn.textContent = '❤️';
  }
}

// Sla favorieten op in localStorage
function slaOp() {
  localStorage.setItem('foodmax_favorieten', JSON.stringify(favorieten));
}

// Toon een toast-notificatie
function toonToast(tekst) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = tekst;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }
}

// Haal query-parameter op uit URL en voer zoekopdracht uit
async function initialisatie() {
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q') || '';
  
  // Vul zoekinvoervelden in
  const pageSearchInput = document.getElementById('search-input');
  if (pageSearchInput) {
    pageSearchInput.value = q;
  }
  
  const navSearchInputs = document.querySelectorAll('.search-wrap input');
  navSearchInputs.forEach(input => {
    input.value = q;
  });

  if (q.trim()) {
    actieveZoekopdracht = q.trim();
    document.getElementById('search-subtitle').textContent = `Zoekresultaten voor "${q}"`;
    await voerZoekopdrachtUit(q);
  } else {
    document.getElementById('search-subtitle').textContent = 'Zoek naar jouw favoriete recepten.';
    document.getElementById('inhoud').innerHTML = `
      <div class="placeholder-text">
        <p>Voer hierboven of in de navigatiebalk een zoekterm in om recepten te zoeken.</p>
      </div>
    `;
  }
}

// Voer de API zoekopdracht uit
async function voerZoekopdrachtUit(query) {
  const inhoud = document.getElementById('inhoud');
  inhoud.innerHTML = '<div class="loader"><div class="spin"></div> Zoeken naar recepten...</div>';
  
  try {
    const r = await fetch(API + 'search.php?s=' + encodeURIComponent(query));
    const d = await r.json();
    
    if (!d.meals) {
      huidigeResultaten = [];
      inhoud.innerHTML = `
        <div class="placeholder-text">
          <p>Geen recepten gevonden voor <strong>"${query}"</strong>. Probeer een andere zoekterm.</p>
        </div>
      `;
      return;
    }
    
    huidigeResultaten = d.meals;
    toonResultatenGrid();
  } catch (error) {
    console.error('Fout bij zoeken:', error);
    inhoud.innerHTML = `
      <div class="placeholder-text">
        <p>Er is een fout opgetreden bij het laden van de recepten. Probeer het later opnieuw.</p>
      </div>
    `;
  }
}

// Toon resultaten in grid layout
function toonResultatenGrid() {
  const inhoud = document.getElementById('inhoud');
  
  let html = '<div class="results">'
    + '<div class="results-header">'
    + '<div class="results-title">' + huidigeResultaten.length + ' recepten gevonden voor "' + actieveZoekopdracht + '"</div>'
    + '</div><div class="meal-grid">';

  huidigeResultaten.forEach(m => {
    html += '<div class="meal-card" onclick="laadDetail(\'' + m.idMeal + '\')">'
      + '<img src="' + m.strMealThumb + '/preview" alt="' + m.strMeal + '" loading="lazy">'
      + '<div class="meal-card-body">'
      + '<div class="meal-name">' + m.strMeal + '</div>'
      + '<button class="fav-btn" id="fav-' + m.idMeal + '" onclick="toggleFavoriet(\'' + m.idMeal + '\',\'' + m.strMeal.replace(/'/g, "\\'") + '\',\'' + m.strMealThumb + '\',event)">'
      + (isFavoriet(m.idMeal) ? '❤️' : '🤍')
      + '</button>'
      + '</div></div>';
  });

  html += '</div></div>';
  inhoud.innerHTML = html;
}

// Laad recept detail
async function laadDetail(id) {
  const inhoud = document.getElementById('inhoud');
  inhoud.innerHTML = '<div class="loader"><div class="spin"></div> Recept details laden...</div>';
  
  try {
    const r = await fetch(API + 'lookup.php?i=' + id);
    const d = await r.json();
    
    if (!d.meals || d.meals.length === 0) {
      inhoud.innerHTML = `
        <div class="results">
          <div class="back-btn" onclick="toonResultatenGrid()"><i class="ti ti-arrow-left"></i> Terug</div>
          <div class="placeholder-text"><p>Receptgegevens niet gevonden.</p></div>
        </div>
      `;
      return;
    }
    
    const m = d.meals[0];
    const ingr = [];
    for (let i = 1; i <= 20; i++) {
      if (m['strIngredient' + i] && m['strIngredient' + i].trim()) {
        ingr.push({ 
          naam: m['strIngredient' + i], 
          hoeveelheid: m['strMeasure' + i] || '' 
        });
      }
    }
    
    inhoud.innerHTML = `
      <div class="results">
        <div class="detail-card">
          <div class="back-btn" onclick="terugNaarResultaten()" style="margin-bottom: 20px;">
            <i class="ti ti-arrow-left"></i> Terug
          </div>
          <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy">
          <h2>${m.strMeal}</h2>
          
          <div class="badge-container">
            ${m.strCategory ? `<span class="badge">${m.strCategory}</span>` : ''}
            ${m.strArea ? `<span class="badge">${m.strArea}</span>` : ''}
          </div>
          
          <p class="detail-desc">${m.strInstructions || ''}</p>
          
          <div class="ingr-title">Ingrediënten</div>
          <div class="ingr-grid">
            ${ingr.map(i => `
              <div class="ingr-row">
                <span>${i.naam}</span>
                <span>${i.hoeveelheid}</span>
              </div>
            `).join('')}
          </div>
          
          ${m.strYoutube ? `
            <a class="yt-link" href="${m.strYoutube}" target="_blank">
              <i class="ti ti-brand-youtube"></i> Bekijk instructievideo op YouTube
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Fout bij ophalen details:', error);
    inhoud.innerHTML = `
      <div class="results">
        <div class="back-btn" onclick="terugNaarResultaten()"><i class="ti ti-arrow-left"></i> Terug</div>
        <div class="placeholder-text"><p>Er is een fout opgetreden bij het laden van de recept details.</p></div>
      </div>
    `;
  }
}

// Terug naar het resultaten overzicht
function terugNaarResultaten() {
  if (huidigeResultaten.length > 0) {
    toonResultatenGrid();
  } else {
    initialisatie();
  }
}

// Koppel functies aan window object zodat ze vanuit HTML/onclick aangeroepen kunnen worden
window.toggleFavoriet = toggleFavoriet;
window.laadDetail = laadDetail;
window.terugNaarResultaten = terugNaarResultaten;

// Start de pagina initialisatie
initialisatie();
