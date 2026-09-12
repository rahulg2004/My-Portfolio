(() => {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    const search = document.getElementById('cert-search');
    const filterButtons = Array.from(document.querySelectorAll('.cert-filter-btn'));
    const cards = Array.from(document.querySelectorAll('#certificates-grid .cert-card'));
    const count = document.getElementById('visible-count');
    const catalogHeader = document.getElementById('catalog-header');
    const showcases = [
      document.getElementById('google-ai-showcase'),
      document.getElementById('google-prompting-showcase'),
      document.getElementById('google-genai-leader-showcase')
    ].filter(Boolean);

    if (!search || !filterButtons.length) return;

    let category = document.querySelector('.cert-filter-btn.active')?.dataset.filter || 'all';
    let query = '';

    const showcaseData = [
      {
        el: document.getElementById('google-ai-showcase'), category: 'google-ai', count: 6,
        text: 'google ai essentials specialization introduction productivity responsibility responsible 8s1u82qqwop 9bp351zcaicv qg1fx6npwzhh x3imynxomcx6 j716vwapnjkr q2gg9jic52ia amanda brophy'
      },
      {
        el: document.getElementById('google-prompting-showcase'), category: 'google-prompting', count: 5,
        text: 'google prompting essentials specialization start writing prompts everyday work tasks data analysis presentation creative expert partner 70elnoavx5js w0riwjh7skm3 l27n6yhspcaz tc49854l8ljh f0qsziq8dagd amanda brophy'
      },
      {
        el: document.getElementById('google-genai-leader-showcase'), category: 'google-genai-leader', count: 6,
        text: 'google cloud generative ai leader certification beyond chatbot foundational concepts landscape applications transform work agents organization vertex ai'
      }
    ].filter(x => x.el);

    function normalise(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function cardSearchText(card) {
      return normalise([
        card.dataset.title,
        card.dataset.org,
        card.dataset.id,
        card.textContent
      ].join(' '));
    }

    function categoryMatchesCard(card) {
      if (category === 'all') return true;
      return normalise(card.dataset.category).split(/\s+/).includes(category);
    }

    function queryMatchesCard(card) {
      return !query || cardSearchText(card).includes(query);
    }

    function apply() {
      let visibleGrid = 0;
      const googleOnly = ['google-ai', 'google-prompting', 'google-genai-leader'].includes(category);

      showcaseData.forEach(item => {
        const categoryMatch = category === 'all' || category === 'genai' || category === item.category;
        const queryMatch = !query || item.text.includes(query);
        item.el.classList.toggle('hidden', !(categoryMatch && queryMatch));
      });

      cards.forEach(card => {
        const visible = !googleOnly && categoryMatchesCard(card) && queryMatchesCard(card);
        card.classList.toggle('hidden', !visible);
        if (visible) visibleGrid += 1;
      });

      if (catalogHeader) catalogHeader.style.display = googleOnly ? 'none' : '';

      const showcaseVisible = showcaseData.reduce((total, item) => {
        const categoryMatch = category === 'all' || category === 'genai' || category === item.category;
        const queryMatch = !query || item.text.includes(query);
        return total + (categoryMatch && queryMatch ? item.count : 0);
      }, 0);

      if (count) count.textContent = String(showcaseVisible + visibleGrid);
    }

    function setCategory(next) {
      category = next || 'all';
      filterButtons.forEach(button => {
        button.classList.toggle('active', normalise(button.dataset.filter) === category);
      });
      apply();
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        setCategory(button.dataset.filter);
      }, false);
    });

    search.addEventListener('input', () => {
      query = normalise(search.value);
      apply();
    }, false);

    search.addEventListener('search', () => {
      query = normalise(search.value);
      apply();
    }, false);

    // Keep the animated placeholder independent from the real search value.
    const typing = document.getElementById('cert-search-typing');
    if (typing) {
      const phrases = [
        'Search certificates...',
        'Try Google, Prompting, Python...',
        'Try AI, Cisco, Tata...',
        'Search by credential or organisation...'
      ];
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;
      let timer = null;

      function type() {
        if (search.value || document.activeElement === search) {
          typing.style.opacity = '0';
          timer = setTimeout(type, 250);
          return;
        }

        typing.style.opacity = '1';
        const phrase = phrases[phraseIndex];
        typing.textContent = phrase.slice(0, charIndex);

        if (!deleting) {
          charIndex += 1;
          if (charIndex > phrase.length) {
            deleting = true;
            timer = setTimeout(type, 1300);
            return;
          }
          timer = setTimeout(type, 48);
        } else {
          charIndex -= 1;
          if (charIndex <= 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }
          timer = setTimeout(type, 25);
        }
      }

      search.addEventListener('focus', () => { typing.style.opacity = '0'; });
      search.addEventListener('blur', () => { if (!search.value) typing.style.opacity = '1'; });
      type();
    }

    // Make Ctrl/Cmd+K focus the actual search field as a reliable fallback.
    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        search.focus();
      }
    });

    apply();
  });
})();
