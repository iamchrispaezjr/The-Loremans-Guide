(function () {
  const watcher = document.getElementById("watcher");
  const iris = document.getElementById("watcher-iris");
  const cluster = document.getElementById("watcher-cluster");
  const toggle = document.getElementById("watcher-toggle");
  if (!watcher || !iris || !cluster || !toggle) return;

  const stickyKey = "loremans-eye-sticky";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxX = 11;
  const maxY = 5;
  let mouseX = window.innerWidth / 2;
  let mouseY = 120;
  let frame = 0;

  function look() {
    frame = 0;
    const rect = watcher.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const nx = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.45)));
    const ny = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.45)));
    if (!reduceMotion) {
      iris.style.transform = `translate(${nx * maxX}px, ${ny * maxY}px)`;
    }
    revealToggleIfNear();
  }

  function distanceToBox(el) {
    const box = el.getBoundingClientRect();
    const x = Math.max(box.left, Math.min(mouseX, box.right));
    const y = Math.max(box.top, Math.min(mouseY, box.bottom));
    return Math.hypot(mouseX - x, mouseY - y);
  }

  function revealToggleIfNear() {
    const near = Math.min(distanceToBox(watcher), distanceToBox(toggle)) < 88;
    toggle.classList.toggle("is-near", near);
  }

  function scheduleLook() {
    if (!frame) frame = requestAnimationFrame(look);
  }

  function setSticky(sticky) {
    cluster.classList.toggle("is-sticky", sticky);
    document.body.classList.toggle("eye-sticky", sticky);
    toggle.setAttribute("aria-pressed", sticky ? "true" : "false");
    toggle.textContent = sticky ? "Unpin eye" : "Pin eye";
    try {
      localStorage.setItem(stickyKey, sticky ? "1" : "0");
    } catch (error) {
      /* private mode */
    }
    look();
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      scheduleLook();
    },
    { passive: true }
  );

  window.addEventListener("scroll", scheduleLook, { passive: true });
  window.addEventListener("resize", scheduleLook);

  function updateScrolled() {
    document.body.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", updateScrolled, { passive: true });
  updateScrolled();

  function blink() {
    watcher.classList.remove("is-blinking");
    void watcher.offsetWidth;
    watcher.classList.add("is-blinking");
  }

  watcher.addEventListener("click", blink);
  watcher.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      blink();
    }
  });

  toggle.addEventListener("click", () => {
    setSticky(!cluster.classList.contains("is-sticky"));
  });

  let saved = "1";
  try {
    saved = localStorage.getItem(stickyKey);
  } catch (error) {
    saved = "1";
  }
  setSticky(saved !== "0");

  setTimeout(blink, 1600);
  setInterval(blink, 60_000);
  look();
})();
