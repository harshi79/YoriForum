/* YoriForum landing — update these 3 URLs after launch, everything rewires. */
const CONFIG = {
  forum: "https://yoriforum.infinityfreeapp.com",
  telegram: "#",
  discord: "#",
};

document.querySelectorAll("[data-link]").forEach((a) => {
  const key = a.getAttribute("data-link");
  if (CONFIG[key] && CONFIG[key] !== "#") a.href = CONFIG[key];
});

document.getElementById("yr").textContent = new Date().getFullYear();

// Animated counters
const counters = document.querySelectorAll("[data-count]");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((el) => io.observe(el));

// FAQ accordion
document.querySelectorAll(".acc button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.nextElementSibling;
    const open = panel.classList.toggle("open");
    btn.querySelector("span").textContent = open ? "−" : "+";
  });
});
