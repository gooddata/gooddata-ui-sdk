// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    activateAppStylesheets,
    deactivateAppStylesheets,
    registerAppStylesheetScope,
    reserveHostStylesheetScope,
    resetStylesheetRegistry,
} from "./stylesheetRegistry.js";

// Everything this file puts into <head> is torn down after each test: `isolate` is off, so the
// document is shared with every other test file running in the same worker, and a leftover
// stylesheet node of ours is a booby trap for theirs — happy-dom's getComputedStyle (reached by
// any Testing Library `*ByRole` query) walks `style,link[rel="stylesheet"]` document-wide and
// reads `sheet.cssRules` off each one.
const appendedHeadNodes: Element[] = [];

function appendToHead<T extends Element>(node: T): T {
    appendedHeadNodes.push(node);
    document.head.appendChild(node);
    return node;
}

function appendLink(href: string, rel = "stylesheet", loaded = true): HTMLLinkElement {
    const link = document.createElement("link");
    link.rel = rel;
    // Stubbed, not set as an attribute: happy-dom fetches a real href once the link is in the
    // document. The registry only prefix-matches this string, and a browser reports it resolved
    // against the document base.
    Object.defineProperty(link, "href", {
        value: new URL(href, document.baseURI).href,
        configurable: true,
    });
    if (loaded) {
        // Nothing loads these links, so they never get a sheet on their own; a production link
        // already in <head> when its app deactivates has one. The registry only checks the sheet
        // for truthiness, but the stub still carries `cssRules`: anything that reads a document's
        // stylesheets expects a rule list there, and an object without one crashes it.
        Object.defineProperty(link, "sheet", { value: { cssRules: [] }, configurable: true });
    }
    return appendToHead(link);
}

function appendStyle(id?: string): HTMLStyleElement {
    const style = document.createElement("style");
    if (id) {
        style.id = id;
    }
    style.textContent = "body { color: red; }";
    return appendToHead(style);
}

function flushObserver(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("stylesheetRegistry", () => {
    beforeEach(() => {
        resetStylesheetRegistry();
    });

    afterEach(() => {
        // Only our own nodes, never the whole of <head>: wiping it would take out whatever the
        // other test files sharing this document put there.
        appendedHeadNodes.splice(0).forEach((node) => node.remove());
        // Also drops the MutationObserver this registry keeps on document.head.
        resetStylesheetRegistry();
        vi.restoreAllMocks();
    });

    it("disables and re-enables links under a prod-style relative scope, leaving host links alone", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const appLink = appendLink("/organization/remotes/gdc-home-ui/static/abc.css");
        const hostLink = appendLink("/static/host.css");

        deactivateAppStylesheets("home-ui");
        expect(appLink.disabled).toBe(true);
        expect(hostLink.disabled).toBeFalsy();

        activateAppStylesheets("home-ui");
        expect(appLink.disabled).toBe(false);
        expect(hostLink.disabled).toBeFalsy();
    });

    it("matches dev-style absolute remote URLs", () => {
        registerAppStylesheetScope("home-ui", "https://localhost:8450/mf-manifest.json");
        const appLink = appendLink("https://localhost:8450/static/abc.css");

        deactivateAppStylesheets("home-ui");
        expect(appLink.disabled).toBe(true);
    });

    it("refuses a remote entry at the host page origin root, leaving host stylesheets alone", () => {
        const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        registerAppStylesheetScope("root-app", "/mf-manifest.json");
        const hostLink = appendLink("/static/host.css");

        deactivateAppStylesheets("root-app");

        expect(hostLink.disabled).toBeFalsy();
        expect(consoleWarn).toHaveBeenCalledOnce();
    });

    it("keeps a remote entry at a root of another origin, which no host link can match", () => {
        registerAppStylesheetScope("dev-app", "https://localhost:8450/mf-manifest.json");
        const appLink = appendLink("https://localhost:8450/static/abc.css");
        const hostLink = appendLink("/static/host.css");

        deactivateAppStylesheets("dev-app");

        expect(appLink.disabled).toBe(true);
        expect(hostLink.disabled).toBeFalsy();
    });

    it("refuses an app that shares a directory with the host UI module", () => {
        const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        reserveHostStylesheetScope("/organization/remotes/shared/mf-manifest.json");
        registerAppStylesheetScope("home-ui", "/organization/remotes/shared/mf-manifest.json");
        const sharedLink = appendLink("/organization/remotes/shared/static/abc.css");

        deactivateAppStylesheets("home-ui");

        expect(sharedLink.disabled).toBeFalsy();
        expect(consoleWarn).toHaveBeenCalledOnce();
    });

    it("keeps tracking an app served from a directory the host UI module does not use", () => {
        reserveHostStylesheetScope("/organization/remotes/host-ui/mf-manifest.json");
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const appLink = appendLink("/organization/remotes/gdc-home-ui/static/abc.css");
        const hostLink = appendLink("/organization/remotes/host-ui/static/host.css");

        deactivateAppStylesheets("home-ui");

        expect(appLink.disabled).toBe(true);
        expect(hostLink.disabled).toBeFalsy();
    });

    it("attributes a link to the most specific scope, whatever the registration order", () => {
        registerAppStylesheetScope("outer", "/organization/remotes/outer/mf-manifest.json");
        registerAppStylesheetScope("inner", "/organization/remotes/outer/nested/mf-manifest.json");
        const outerLink = appendLink("/organization/remotes/outer/static/a.css");
        const innerLink = appendLink("/organization/remotes/outer/nested/static/b.css");

        deactivateAppStylesheets("outer");
        expect(outerLink.disabled).toBe(true);
        expect(innerLink.disabled).toBeFalsy();

        deactivateAppStylesheets("inner");
        expect(innerLink.disabled).toBe(true);
    });

    it("refuses an app whose scope contains the host UI module directory", () => {
        const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        reserveHostStylesheetScope("/organization/remotes/host-ui/mf-manifest.json");
        registerAppStylesheetScope("home-ui", "/organization/remotes/mf-manifest.json");
        const hostLink = appendLink("/organization/remotes/host-ui/static/host.css");

        deactivateAppStylesheets("home-ui");

        expect(hostLink.disabled).toBeFalsy();
        expect(consoleWarn).toHaveBeenCalledOnce();
    });

    it("keeps tracking an app nested inside the host UI module directory", () => {
        reserveHostStylesheetScope("/organization/remotes/mf-manifest.json");
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const appLink = appendLink("/organization/remotes/gdc-home-ui/static/abc.css");
        const hostLink = appendLink("/organization/remotes/static/host.css");

        deactivateAppStylesheets("home-ui");

        expect(appLink.disabled).toBe(true);
        expect(hostLink.disabled).toBeFalsy();
    });

    it("disables a retired in-flight link once it finishes loading", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/v1/mf-manifest.json");
        const pendingLink = appendLink(
            "/organization/remotes/gdc-home-ui/v1/static/abc.css",
            "stylesheet",
            false,
        );

        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/v2/mf-manifest.json");
        expect(pendingLink.disabled).toBeFalsy();

        pendingLink.dispatchEvent(new Event("load"));

        expect(pendingLink.disabled).toBe(true);
    });

    it("never touches rel=preload warm-up links even with a matching href", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const preloadLink = appendLink("/organization/remotes/gdc-home-ui/static/abc.css", "preload");

        deactivateAppStylesheets("home-ui");
        expect(preloadLink.disabled).toBeFalsy();
    });

    it("disables a late-arriving loaded link of a deactivated app", async () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        deactivateAppStylesheets("home-ui");

        const lateLink = appendLink("/organization/remotes/gdc-home-ui/static/lazy.css");
        await flushObserver();

        expect(lateLink.disabled).toBe(true);
    });

    it("disables a late-arriving still-loading link only after its load event", async () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        deactivateAppStylesheets("home-ui");

        const pendingLink = appendLink(
            "/organization/remotes/gdc-home-ui/static/lazy.css",
            "stylesheet",
            false,
        );
        await flushObserver();
        expect(pendingLink.disabled).toBeFalsy();

        pendingLink.dispatchEvent(new Event("load"));
        expect(pendingLink.disabled).toBe(true);
    });

    it("does not disable an in-flight link if its app was re-activated before it loaded", async () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        deactivateAppStylesheets("home-ui");

        const pendingLink = appendLink(
            "/organization/remotes/gdc-home-ui/static/lazy.css",
            "stylesheet",
            false,
        );
        await flushObserver();
        activateAppStylesheets("home-ui");

        pendingLink.dispatchEvent(new Event("load"));
        expect(pendingLink.disabled).toBeFalsy();
    });

    it("never touches <style> tags, including ones appearing while an app is active", async () => {
        registerAppStylesheetScope("dashboards", "/organization/remotes/gdc-dashboards/mf-manifest.json");
        activateAppStylesheets("dashboards");

        const themeStyle = appendStyle("gdc-theme-properties");
        const chromeStyle = appendStyle("header-css-abc");
        await flushObserver();

        deactivateAppStylesheets("dashboards");
        expect(themeStyle.disabled).toBeFalsy();
        expect(chromeStyle.disabled).toBeFalsy();
    });

    it("switching apps and revisiting restores each app's own links", () => {
        registerAppStylesheetScope("app-a", "/organization/remotes/app-a/mf-manifest.json");
        registerAppStylesheetScope("app-b", "/organization/remotes/app-b/mf-manifest.json");
        const linkA = appendLink("/organization/remotes/app-a/static/a.css");
        const linkB = appendLink("/organization/remotes/app-b/static/b.css");

        deactivateAppStylesheets("app-a");
        activateAppStylesheets("app-b");
        expect(linkA.disabled).toBe(true);
        expect(linkB.disabled).toBe(false);

        deactivateAppStylesheets("app-b");
        activateAppStylesheets("app-a");
        expect(linkA.disabled).toBe(false);
        expect(linkB.disabled).toBe(true);
    });

    it("disables a link on every deactivation, even after the browser dropped its sheet", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const link = appendLink("/organization/remotes/gdc-home-ui/static/abc.css");

        deactivateAppStylesheets("home-ui");
        expect(link.disabled).toBe(true);

        // A disabled link has no sheet, and re-enabling restores it asynchronously.
        Object.defineProperty(link, "sheet", { value: null, configurable: true });
        activateAppStylesheets("home-ui");
        expect(link.disabled).toBe(false);

        deactivateAppStylesheets("home-ui");
        expect(link.disabled).toBe(true);
    });

    it("arms one load listener however often a still-loading link is deactivated", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const link = appendLink("/organization/remotes/gdc-home-ui/static/lazy.css", "stylesheet", false);
        const addEventListener = vi.spyOn(link, "addEventListener");

        deactivateAppStylesheets("home-ui");
        activateAppStylesheets("home-ui");
        deactivateAppStylesheets("home-ui");
        deactivateAppStylesheets("home-ui");

        expect(addEventListener).toHaveBeenCalledOnce();

        link.dispatchEvent(new Event("load"));
        expect(link.disabled).toBe(true);
    });

    it("retires the previous build's links when an app resolves to a new remote URL", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/v1/mf-manifest.json");
        const oldLink = appendLink("/organization/remotes/gdc-home-ui/v1/static/abc.css");

        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/v2/mf-manifest.json");
        const newLink = appendLink("/organization/remotes/gdc-home-ui/v2/static/abc.css");
        expect(oldLink.disabled).toBe(true);

        activateAppStylesheets("home-ui");
        expect(oldLink.disabled).toBe(true);
        expect(newLink.disabled).toBe(false);

        deactivateAppStylesheets("home-ui");
        expect(newLink.disabled).toBe(true);
    });

    it("leaves links alone when the same remote URL is registered again", () => {
        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");
        const link = appendLink("/organization/remotes/gdc-home-ui/static/abc.css");

        registerAppStylesheetScope("home-ui", "/organization/remotes/gdc-home-ui/mf-manifest.json");

        expect(link.disabled).toBeFalsy();
    });

    it("is idempotent and safe for unknown app ids", () => {
        registerAppStylesheetScope("app-a", "/organization/remotes/app-a/mf-manifest.json");
        const linkA = appendLink("/organization/remotes/app-a/static/a.css");

        deactivateAppStylesheets("unknown");
        expect(linkA.disabled).toBeFalsy();

        deactivateAppStylesheets("app-a");
        deactivateAppStylesheets("app-a");
        expect(linkA.disabled).toBe(true);

        activateAppStylesheets("app-a");
        activateAppStylesheets("app-a");
        expect(linkA.disabled).toBe(false);
    });
});
