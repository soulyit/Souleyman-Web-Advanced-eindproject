let gebiedenGeladen = false;
let categoriesGeladen = false;

function toonPagina(pagina) {
  ['home', 'categories', 'gebieden', 'favorites', 'search'].forEach(p => {
    document.getElementById('page-' + p).style.display = 'none';
  });
  document.getElementById('page-' + pagina).style.display = 'block';

  if (pagina === 'categories' && !categoriesGeladen) {
    laadCategorieën();
    categoriesGeladen = true;
  }
  if (pagina === 'gebieden' && !gebiedenGeladen) {
    laadGebieden();
    gebiedenGeladen = true;
  }
  if (pagina === 'favorites') {
    laadFavorieten();
  }
}

function zoekVanNavbar(event) {
  event.preventDefault();
  const q = event.target.querySelector('input').value.trim();
  if (!q) return;
  toonPagina('search');
  document.getElementById('search-input').value = q;
  voerZoekopdrachtUit(q);
}

function zoekVanPagina(event) {
  event.preventDefault();
  const q = document.getElementById('search-input').value.trim();
  if (q) voerZoekopdrachtUit(q);
}

window.toonPagina = toonPagina;
window.zoekVanNavbar = zoekVanNavbar;
window.zoekVanPagina = zoekVanPagina;