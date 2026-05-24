
function slaOp() {
  localStorage.setItem('foodmax_favorieten', JSON.stringify(favorieten));
}

function isFavoriet(id) {
  return favorieten.some(f => f.id === id);
}

function toggleFavoriet(id, naam, thumb, event) {
  event.stopPropagation();

  if (isFavoriet(id)) {
    favorieten = favorieten.filter(f => f.id !== id);
    slaOp();
    toonToast('Verwijderd uit favorieten 🗑️');

    // Knop terug naar wit hartje
    const btn = document.getElementById('fav-' + id);
    if (btn) btn.textContent = '🤍';

    // Herlaad favorietenpagina
    laadFavorieten();

  } else {
    favorieten.push({ id, naam, thumb });
    slaOp();
    toonToast('Toegevoegd aan favorieten ❤️');

    // Knop naar rood hartje
    const btn = document.getElementById('fav-' + id);
    if (btn) btn.textContent = '❤️';
  }
}

function toonToast(tekst) {
  const t = document.getElementById('toast');
  t.textContent = tekst;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function laadFavorieten() {
  const inhoud = document.getElementById('inhoud-favorites');

  if (!favorieten.length) {
    inhoud.innerHTML = '<div class="leeg">Je hebt nog geen favorieten.<br>Like een gerecht via Categorieën of Gebieden.</div>';
    return;
  }

  let html = '<div class="fav-header">'
    + '<div class="fav-title">Mijn favorieten</div>'
    + '<div class="fav-count">' + favorieten.length + ' gerechten</div>'
    + '</div><div class="meal-grid">';

  favorieten.forEach(f => {
    html += '<div class="meal-card">'
      + '<img src="' + f.thumb + '/preview" alt="' + f.naam + '" loading="lazy">'
      + '<div class="meal-card-body">'
      + '<div class="meal-name">' + f.naam + '</div>'
      + '<button class="fav-btn active" id="fav-' + f.id + '" onclick="toggleFavoriet(\'' + f.id + '\',\'' + f.naam.replace(/'/g, "\\'") + '\',\'' + f.thumb + '\',event)">❤️</button>'
      + '</div></div>';
  });

  html += '</div>';
  inhoud.innerHTML = html;
}

window.toggleFavoriet = toggleFavoriet;
window.laadFavorieten = laadFavorieten;
