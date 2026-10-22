export function initVersionMenu() {
  const roots = document.querySelectorAll("[data-version-menu]");
  if (!roots.length) return;
  roots.forEach((root) => {
    const btn = root.querySelector("[data-version-toggle]");
    const list = root.querySelector("[data-version-list]");
    if (!btn || !list) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = list.classList.contains("hidden");
      list.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll("[data-version-list]:not(.hidden)").forEach((l) => l.classList.add("hidden"));
  });
}
