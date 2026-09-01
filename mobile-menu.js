(() => {
  const button = document.querySelector("button.menu");
  if (!button) return;

  const items = [
    ["🏠", "ホーム", "home"],
    ["🌊", "海況", "sea"],
    ["🗓️", "出船予定", "schedule"],
    ["🐟", "釣果", "logs"],
    ["👨‍✈️", "船長紹介", "captain"],
    ["🚤", "船紹介", "boatinfo"],
    ["📸", "Memories", "memories"],
  ];

  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
      .ats-menu-backdrop{position:fixed;inset:0;background:rgba(1,9,14,.64);backdrop-filter:blur(4px);z-index:998;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease}
      .ats-mobile-menu{position:fixed;z-index:999;top:82px;right:16px;width:min(330px,calc(100vw - 32px));padding:10px;background:linear-gradient(180deg,#0d2637,#071924);border:1px solid #28546b;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-10px) scale(.98);transform-origin:top right;transition:opacity .2s ease,transform .2s ease,visibility .2s ease}
      .ats-mobile-menu a{display:flex;align-items:center;gap:13px;min-height:52px;padding:0 15px;border-radius:13px;color:#f4f8fb;text-decoration:none;font-size:16px;font-weight:800}
      .ats-mobile-menu a+ a{border-top:1px solid rgba(91,151,181,.18)}
      .ats-mobile-menu a:active{background:#12374c}
      .ats-mobile-menu .ats-menu-icon{width:25px;text-align:center}
      body.ats-menu-open{overflow:hidden}
      body.ats-menu-open .ats-menu-backdrop,body.ats-menu-open .ats-mobile-menu{opacity:1;visibility:visible}
      body.ats-menu-open .ats-mobile-menu{transform:translateY(0) scale(1)}
      @media(min-width:801px){.ats-menu-backdrop,.ats-mobile-menu{display:none!important}}
    </style>`,
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="ats-menu-backdrop" aria-hidden="true"></div><nav class="ats-mobile-menu" aria-label="ページメニュー">${items
      .map(
        ([icon, label, id]) =>
          `<a href="#${id}"><span class="ats-menu-icon">${icon}</span><span>${label}</span></a>`,
      )
      .join("")}</nav>`,
  );

  const menu = document.querySelector(".ats-mobile-menu");
  const backdrop = document.querySelector(".ats-menu-backdrop");
  const setOpen = (open) => {
    document.body.classList.toggle("ats-menu-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "✕" : "☰";
  };

  button.removeAttribute("onclick");
  button.setAttribute("aria-label", "メニューを開く");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () =>
    setOpen(!document.body.classList.contains("ats-menu-open")),
  );
  backdrop.addEventListener("click", () => setOpen(false));
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      setOpen(false);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();
