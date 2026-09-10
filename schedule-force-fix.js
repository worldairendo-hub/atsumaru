(() => {
  const fix = () => {
    const sections = [...document.querySelectorAll('#schedule')];
    if (!sections.length) return;

    sections.forEach((section) => {
      const cards = [...section.querySelectorAll('.ats-card')];
      let found = false;

      cards.forEach((card) => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const text = (h3.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.includes('10月24日') || text.includes('10/24')) {
          h3.textContent = '10月24日 サワラ夕マヅメ便';
          found = true;
        }
      });

      if (!found) {
        const grid = section.querySelector('.ats-schedule');
        if (grid) {
          grid.insertAdjacentHTML('beforeend', '<div class="card ats-card"><span class="ats-status">募集中</span><h3>10月24日 サワラ夕マヅメ便</h3></div>');
        }
      }
    });
  };

  fix();
  const observer = new MutationObserver(fix);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  setTimeout(() => observer.disconnect(), 15000);
})();