/* eslint-disable */
// (C) 2023-2025 GoodData Corporation

import { JSDOM } from "jsdom";

// This script validates that the package (especially its imports) can be used in a Node.js environment with a simulated DOM,
// such as when running tests with JEST or Vitest using jsdom.
// Note: This package is not fully valid as a Node.js ESM module because it imports Highcharts,
// which relies on browser-specific APIs in its modules.

// Get the package name from command line arguments or use default
const packageName = process.argv[2] || "@gooddata/sdk-ui-charts";

// Set up a DOM environment for Node.js
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
    runScripts: "dangerously",
});

// Set up global DOM objects that might be used by the library
global.window = dom.window;
global.document = dom.window.document;
//global.navigator = dom.window.navigator;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.SVGElement = dom.window.SVGElement;
global.getComputedStyle = dom.window.getComputedStyle;

// Also set up other browser-like objects that might be needed
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Add additional browser APIs that charts might need
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

global.MutationObserver = class MutationObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
};

// Mock localStorage and sessionStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

console.log(`DOM environment set up, attempting to import ${packageName}...`);

// Now attempt to import the package
try {
    const importedPackage = await import(packageName);
    console.log(`Successfully imported ${packageName}`);
    process.exit(0);
} catch (error) {
    console.error(`Failed to import ${packageName}:`, error);
    process.exit(1);
}
