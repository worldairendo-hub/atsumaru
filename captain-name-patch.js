(() => {
  const name = document.querySelector("#captain .ats-card h3");
  if (name) name.textContent = "あっちゃん船長";
  const photo = document.querySelector("#captain .ats-captain-photo");
  if (photo) photo.alt = "あっちゃん船長";
})();
