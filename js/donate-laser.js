(function () {
  const donate = document.querySelector(".donate-button");
  const watcher = document.getElementById("watcher");
  const beam = document.getElementById("donate-beam");
  const burst = document.getElementById("donate-burst");
  if (!donate || !watcher || !beam || !burst) return;

  const storageKey = "loremans-donate-revealed";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function alreadyRevealed() {
    try {
      return sessionStorage.getItem(storageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function markRevealed() {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (error) {
      /* private mode */
    }
  }

  function showDonate(animated) {
    donate.classList.add("is-revealed");
    if (animated) {
      donate.classList.remove("is-materializing");
      void donate.offsetWidth;
      donate.classList.add("is-materializing");
    }
  }

  function fireLaser() {
    markRevealed();

    if (reduceMotion) {
      showDonate(false);
      return;
    }

    const eyeBox = watcher.getBoundingClientRect();
    const donateBox = donate.getBoundingClientRect();
    const x1 = eyeBox.left + eyeBox.width / 2;
    const y1 = eyeBox.top + eyeBox.height / 2;
    const x2 = donateBox.left + donateBox.width / 2;
    const y2 = donateBox.top + donateBox.height / 2;
    const dist = Math.max(Math.hypot(x2 - x1, y2 - y1), 1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    beam.style.left = `${x1}px`;
    beam.style.top = `${y1}px`;
    beam.style.width = `${dist}px`;
    beam.style.setProperty("--beam-angle", `${angle}rad`);

    watcher.classList.remove("is-blinking");
    void watcher.offsetWidth;
    watcher.classList.add("is-blinking", "is-firing");
    beam.classList.remove("is-firing");
    void beam.offsetWidth;
    beam.classList.add("is-firing");

    window.setTimeout(() => {
      burst.style.left = `${x2}px`;
      burst.style.top = `${y2}px`;
      burst.classList.remove("is-popping");
      void burst.offsetWidth;
      burst.classList.add("is-popping");
      showDonate(true);
    }, 400);

    window.setTimeout(() => {
      watcher.classList.remove("is-firing");
      beam.classList.remove("is-firing");
      burst.classList.remove("is-popping");
    }, 900);
  }

  if (alreadyRevealed()) {
    showDonate(false);
    return;
  }

  window.setTimeout(fireLaser, 10_000);
})();
