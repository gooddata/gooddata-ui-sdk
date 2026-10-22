// (C) 2026 GoodData Corporation

// The dark-mode toggle. Applying and remembering the theme is head.html's window.gdTheme (it also
// sets the theme before first paint), so the two never disagree.
export function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    // Only rendered below lg, where the button sits in the stacked menu as a
    // labelled row; the label names the mode the click switches to.
    const label = document.getElementById("theme-toggle-label");
    const isDark = () => document.documentElement.classList.contains("dark");

    function syncLabel() {
        if (label) label.textContent = isDark() ? "Light mode" : "Dark mode";
    }

    syncLabel();

    themeToggle?.addEventListener("click", () => {
        const dark = !isDark();
        window.gdTheme?.apply(dark);
        window.gdTheme?.remember(dark);
        syncLabel();
    });
}
