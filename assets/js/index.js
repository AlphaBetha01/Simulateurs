LabCommon.initHeader({ bodySection: 'home', trackVisit: false });

const cards = Array.from(document.querySelectorAll('.card'));
const sections = Array.from(document.querySelectorAll('.sections .section'));
const searchInput = document.getElementById('searchInput');
const levelFilter = document.getElementById('levelFilter');
const themeFilter = document.getElementById('themeFilter');
const resultCount = document.getElementById('resultCount');
const noResults = document.getElementById('noResults');
const recentSection = document.getElementById('recentSection');
const recentCards = document.getElementById('recentCards');
const clearRecentBtn = document.getElementById('clearRecentBtn');

function buildCardIndex(card) {
  const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
  const description = card.querySelector('p') ? card.querySelector('p').textContent.trim() : '';
  const sectionTitle = card.closest('.section') && card.closest('.section').querySelector('.section-head h2')
    ? card.closest('.section').querySelector('.section-head h2').textContent.trim()
    : '';
  const tags = Array.from(card.querySelectorAll('.tag')).map(function (tag) {
    return tag.textContent.trim();
  });

  card.dataset.search = [title, description, sectionTitle].concat(tags).join(' ').toLowerCase();
}

function populateThemeFilter() {
  const themes = [];

  cards.forEach(function (card) {
    const theme = card.dataset.theme;
    const section = card.closest('.section');
    const label = section && section.querySelector('.section-head h2')
      ? section.querySelector('.section-head h2').textContent.trim()
      : theme;

    if (theme && !themes.some(function (item) { return item.value === theme; })) {
      themes.push({ value: theme, label: label });
    }
  });

  themes.forEach(function (theme) {
    const option = document.createElement('option');
    option.value = theme.value;
    option.textContent = theme.label;
    themeFilter.appendChild(option);
  });
}

function updateVisibleCount(count) {
  resultCount.textContent = count + ' simulateur' + (count > 1 ? 's visibles' : ' visible');
}

function filterCards() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const level = levelFilter.value;
  const theme = themeFilter.value;
  let visibleCards = 0;

  cards.forEach(function (card) {
    const matchesQuery = !query || card.dataset.search.indexOf(query) >= 0;
    const matchesLevel = level === 'all' || card.dataset.level === level;
    const matchesTheme = theme === 'all' || card.dataset.theme === theme;
    const isVisible = matchesQuery && matchesLevel && matchesTheme;

    card.classList.toggle('is-hidden', !isVisible);
    if (isVisible) {
      visibleCards += 1;
    }
  });

  sections.forEach(function (section) {
    const hasVisibleCard = Array.from(section.querySelectorAll('.card')).some(function (card) {
      return !card.classList.contains('is-hidden');
    });
    section.classList.toggle('is-hidden', !hasVisibleCard);
  });

  noResults.hidden = visibleCards !== 0;
  updateVisibleCount(visibleCards);
}

function createRecentCard(item) {
  const article = document.createElement('article');
  article.className = 'card';

  const title = document.createElement('h3');
  title.textContent = item.title;

  const meta = document.createElement('div');
  meta.className = 'recent-card__meta';
  meta.textContent = item.subtitle || item.section || 'Page du laboratoire';

  const text = document.createElement('p');
  text.textContent = 'Rouvre rapidement cette page au dernier point de visite.';

  const actions = document.createElement('div');
  actions.className = 'actions';

  const link = document.createElement('a');
  link.className = 'btn primary';
  link.href = item.href;
  link.textContent = 'Reprendre';

  actions.appendChild(link);
  article.appendChild(title);
  article.appendChild(meta);
  article.appendChild(text);
  article.appendChild(actions);

  return article;
}

function renderRecentPages() {
  const items = LabCommon.getRecentPages(6).filter(function (item) {
    return item && item.pageId !== 'home';
  });

  recentCards.innerHTML = '';

  if (!items.length) {
    recentSection.hidden = true;
    return;
  }

  recentSection.hidden = false;
  items.forEach(function (item) {
    recentCards.appendChild(createRecentCard(item));
  });
}

cards.forEach(buildCardIndex);
populateThemeFilter();
filterCards();
renderRecentPages();

searchInput.addEventListener('input', filterCards);
levelFilter.addEventListener('change', filterCards);
themeFilter.addEventListener('change', filterCards);

clearRecentBtn.addEventListener('click', function () {
  LabCommon.clearRecentPages();
  renderRecentPages();
});
