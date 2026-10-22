// (C) 2026 GoodData Corporation

export function initCodeEnhance() {
    document.querySelectorAll("main table").forEach((table) => {
        if (table.parentElement.classList.contains("overflow-x-auto")) return;
        const wrap = document.createElement("div");
        wrap.className = "overflow-x-auto rounded";
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
    });

    // The copy button goes in a wrapper AROUND the pre, never inside it. Inside,
    // it sat in the pre's own scroll/clip box: a one-line fence is 41px tall while
    // the button needs 44px (12px inset + 32px), so its bottom was clipped, and on
    // a wide fence it scrolled out of view with the code. The wrapper is only
    // position:relative — no padding, border or overflow — so the pre's vertical
    // margins still collapse through it and prose rhythm is unchanged.
    document.querySelectorAll("pre").forEach((pre) => {
        if (pre.parentElement?.dataset.codeBlock) return;

        const wrap = document.createElement("div");
        wrap.dataset.codeBlock = "true";
        wrap.className = "code-block relative";
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);

        const copyIcon =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        const checkIcon =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

        const button = document.createElement("button");
        button.type = "button";
        button.dataset.copyButton = "true";
        button.innerHTML = copyIcon;
        button.setAttribute("aria-label", "Copy code to clipboard");
        // Footprint must fit the SHORTEST possible fence, which is one line:
        // 22.4px line + 2x9.33px padding = 41px. Inset 8px + (16px icon + 2x6px
        // padding) = 36px, so it clears by 5px. At the old top-3/p-2 it needed 44px
        // and hung over the bottom edge of a one-line fence.
        button.className =
            "copy-btn absolute right-2 top-2 rounded-full bg-gd-on-code/20 p-1.5 text-gd-on-code/90 transition hover:bg-gd-on-code/30 focus-visible:ring-2 focus-visible:ring-gd-on-code focus-visible:outline-none opacity-0 pointer-events-none";

        button.addEventListener("click", async () => {
            const code = pre.querySelector("code")?.textContent ?? "";
            try {
                await navigator.clipboard.writeText(code);
                button.innerHTML = checkIcon;
            } catch {
                button.innerHTML = copyIcon;
            }
            window.setTimeout(() => {
                button.innerHTML = copyIcon;
            }, 1600);
        });

        wrap.appendChild(button);
    });
}
