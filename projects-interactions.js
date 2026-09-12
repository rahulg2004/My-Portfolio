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
    const search = document.getElementById('project-search-input');
    const buttons = Array.from(document.querySelectorAll('.project-filter-btn'));
    const sections = Array.from(document.querySelectorAll('.project-carousel-section'));
    const count = document.getElementById('visible-projects-count');
    if (!search || !buttons.length || !sections.length) return;

    let category = document.querySelector('.project-filter-btn.active')?.dataset.filter || 'all';
    let query = '';

    function normalise(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      let total = 0;

      sections.forEach(section => {
        const sectionCategory = normalise(section.dataset.category);
        const company = normalise(section.dataset.companyName);
        let sectionVisible = 0;

        section.querySelectorAll('.project-card-detailed').forEach(card => {
          const cardCategory = normalise(card.dataset.category);
          const text = normalise([
            card.dataset.search,
            card.textContent,
            section.dataset.companyName
          ].join(' '));

          const categoryMatch = category === 'all' || sectionCategory === category || cardCategory === category;
          const queryMatch = !query || text.includes(query) || company.includes(query);
          const visible = categoryMatch && queryMatch;

          card.classList.toggle('hidden', !visible);
          if (visible) {
            sectionVisible += 1;
            total += 1;
          }
        });

        section.classList.toggle('hidden', sectionVisible === 0);
      });

      if (count) count.textContent = String(total);
    }

    buttons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        category = button.dataset.filter || 'all';
        buttons.forEach(item => item.classList.toggle('active', item === button));
        apply();
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

    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        search.focus();
      }
    });

    apply();
  });
})();
