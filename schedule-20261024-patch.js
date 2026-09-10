(() => {
  const update = () => {
    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text.includes('10/24') || !text.includes('サワラ便')) continue;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes('サワラ便')) {
          node.nodeValue = node.nodeValue.replace(/サワラ便/g, 'サワラ夕マヅメ便');
        }
      }
      break;
    }
  };

  update();
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
})();
