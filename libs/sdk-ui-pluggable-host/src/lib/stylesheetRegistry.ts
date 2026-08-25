// (C) 2026 GoodData Corporation

//
// Per-app stylesheet lifecycle. Remote apps inject their CSS as <link rel="stylesheet"> into
// document.head and nothing ever removes it, so a previously visited app's global rules
// (html/body resets, :root custom properties) keep applying to the active app.
//
// Links are attributed to apps by href prefix: a remote's CSS all sits under the directory of
// its remote entry URL, and one remote serves one app. <style> tags are deliberately not
// tracked — they have no href to match on, and treating them as owned by whatever app is
// active gets it wrong both ways: host chrome re-appends its own tags while an app is active,
// and an outgoing app's lazy chunks can arrive after the next app is already up. This leaves
// the webpack style-loader tags of customer dashboard plugins untracked.
//
// Links are disabled when an app unmounts and re-enabled when it comes back, never removed.
// Vite's preload helper, the MF runtime and the host loader all cache by href, so a removed
// <link> would never be injected again when the user navigates back.
//

type LinkLoadState = "awaiting-load" | "loaded";

const scopePrefixes = new Map<string, Set<string>>();
const reservedHostPrefixes = new Set<string>();
const deactivatedApps = new Set<string>();
let linkLoadStates = new WeakMap<HTMLLinkElement, LinkLoadState>();
let retiredLinks = new WeakSet<HTMLLinkElement>();
let observer: MutationObserver | undefined;

function deriveScopePrefix(remoteEntryUrl: string): string | undefined {
    try {
        const url = new URL(remoteEntryUrl, document.baseURI);
        return url.origin + url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1);
    } catch {
        console.error(
            `[host-runtime/stylesheet-registry] Cannot derive stylesheet scope from remote URL "${remoteEntryUrl}".`,
        );
        return undefined;
    }
}

// The longest match wins, so nested directories cannot make ownership depend on registration order.
function findOwnerOfHref(href: string): string | undefined {
    let owner: string | undefined;
    let longestPrefixLength = -1;
    for (const [appId, prefixes] of scopePrefixes) {
        for (const prefix of prefixes) {
            if (href.startsWith(prefix) && prefix.length > longestPrefixLength) {
                owner = appId;
                longestPrefixLength = prefix.length;
            }
        }
    }
    return owner;
}

// An app prefix above a reserved host prefix would claim the host's own links.
function coversReservedHostScope(prefix: string): boolean {
    for (const reserved of reservedHostPrefixes) {
        if (reserved.startsWith(prefix)) {
            return true;
        }
    }
    return false;
}

function isAppStylesheetLink(node: Node): node is HTMLLinkElement {
    return node instanceof HTMLLinkElement && node.relList.contains("stylesheet");
}

// `link.sheet` says whether a sheet is attached right now, not whether one ever loaded:
// disabling a link detaches it and re-enabling reattaches it asynchronously. So once this
// registry has disabled a link, only a remembered flag can still be trusted.
function hasLoaded(link: HTMLLinkElement): boolean {
    if (link.sheet) {
        linkLoadStates.set(link, "loaded");
    }
    return linkLoadStates.get(link) === "loaded";
}

function setLinkDisabled(link: HTMLLinkElement, disabled: boolean): void {
    if (!disabled) {
        link.disabled = false;
        return;
    }
    if (hasLoaded(link)) {
        link.disabled = true;
        return;
    }
    if (linkLoadStates.get(link) === "awaiting-load") {
        return;
    }
    linkLoadStates.set(link, "awaiting-load");
    // Disabling a link that has never finished loading can suppress its load event, which
    // Vite's preload helper awaits — the pending chunk import would hang forever.
    link.addEventListener(
        "load",
        () => {
            linkLoadStates.set(link, "loaded");
            // A retired link outlives the scope that owned it, so its owner can no longer be found.
            if (retiredLinks.has(link)) {
                link.disabled = true;
                return;
            }
            const owner = findOwnerOfHref(link.href);
            if (owner && deactivatedApps.has(owner)) {
                link.disabled = true;
            }
        },
        { once: true },
    );
}

function forEachOwnedLink(appId: string, callback: (link: HTMLLinkElement) => void): void {
    const prefixes = scopePrefixes.get(appId);
    if (!prefixes?.size) {
        return;
    }
    document.head.querySelectorAll("link").forEach((link) => {
        if (isAppStylesheetLink(link) && findOwnerOfHref(link.href) === appId) {
            callback(link);
        }
    });
}

function handleHeadMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
            if (!isAppStylesheetLink(node)) {
                return;
            }
            const owner = findOwnerOfHref(node.href);
            if (owner && deactivatedApps.has(owner)) {
                setLinkDisabled(node, true);
            }
        });
    }
}

function ensureObserver(): void {
    if (observer) {
        return;
    }
    observer = new MutationObserver(handleHeadMutations);
    observer.observe(document.head, { childList: true });
}

/**
 * Registers the URL scope of a remote app's stylesheets: every stylesheet link whose
 * href starts with the directory of `remoteEntryUrl` belongs to `appId`.
 *
 * Idempotent. Registering a different URL for a known app replaces its scope and retires the
 * previous build's links, so the old CSS never comes back with the new build. Must be called
 * before the app's module is loaded so late-injected CSS of deactivated apps is caught by the
 * observer.
 *
 * Refused with a warning when the prefix would swallow host stylesheets: a remote entry at the
 * host page's own origin root, or a prefix covering a scope reserved by
 * `reserveHostStylesheetScope`. A refused app is simply not tracked, so its CSS stays applied
 * across navigation. A root on another origin cannot match a host link and is kept.
 *
 * If one remote ever served two pluggable apps from the same base URL, attribution would
 * over-match; the fix would be the per-expose CSS lists in mf-manifest.json
 * (`exposes[].assets.css`).
 */
export function registerAppStylesheetScope(appId: string, remoteEntryUrl: string): void {
    if (typeof document === "undefined") {
        return;
    }
    const prefix = deriveScopePrefix(remoteEntryUrl);
    if (!prefix) {
        return;
    }
    if (prefix === `${new URL(document.baseURI).origin}/`) {
        console.warn(
            `[host-runtime/stylesheet-registry] Not tracking stylesheets of app "${appId}": its remote URL "${remoteEntryUrl}" resolves to the host page origin root, where its CSS cannot be told apart from the host's own.`,
        );
        return;
    }
    if (coversReservedHostScope(prefix)) {
        console.warn(
            `[host-runtime/stylesheet-registry] Not tracking stylesheets of app "${appId}": its remote URL "${remoteEntryUrl}" covers the host UI module's directory, whose CSS must stay applied.`,
        );
        return;
    }
    const prefixes = scopePrefixes.get(appId);
    if (!prefixes?.has(prefix)) {
        if (prefixes?.size) {
            // A new remote URL for a known app means its previous build is gone. Those links stay
            // in the document, so they must be disabled before the scope stops covering them.
            forEachOwnedLink(appId, (link) => {
                retiredLinks.add(link);
                setLinkDisabled(link, true);
            });
        }
        scopePrefixes.set(appId, new Set([prefix]));
    }
    ensureObserver();
}

/**
 * Reserves the URL scope of the host's own remote UI module so no app can claim stylesheets
 * served from the same directory. Must be called before any app registers a scope; the host UI
 * is resolved before an app renders inside it.
 */
export function reserveHostStylesheetScope(remoteEntryUrl: string): void {
    if (typeof document === "undefined") {
        return;
    }
    const prefix = deriveScopePrefix(remoteEntryUrl);
    if (prefix) {
        reservedHostPrefixes.add(prefix);
    }
}

/**
 * Re-enables all stylesheets attributed to the app. Safe to call before any of the
 * app's CSS exists and repeatedly.
 */
export function activateAppStylesheets(appId: string): void {
    if (typeof document === "undefined") {
        return;
    }
    deactivatedApps.delete(appId);
    forEachOwnedLink(appId, (link) => setLinkDisabled(link, false));
}

/**
 * Disables all stylesheets attributed to the app. Idempotent; a no-op scan for an
 * unknown appId.
 */
export function deactivateAppStylesheets(appId: string): void {
    if (typeof document === "undefined") {
        return;
    }
    deactivatedApps.add(appId);
    forEachOwnedLink(appId, (link) => setLinkDisabled(link, true));
}

/**
 * Test-only: clears all registry state and disconnects the head observer.
 */
export function resetStylesheetRegistry(): void {
    scopePrefixes.clear();
    reservedHostPrefixes.clear();
    deactivatedApps.clear();
    linkLoadStates = new WeakMap();
    retiredLinks = new WeakSet();
    observer?.disconnect();
    observer = undefined;
}
