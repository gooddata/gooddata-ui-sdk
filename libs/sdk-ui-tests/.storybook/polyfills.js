// (C) 2024-2025 GoodData Corporation

// RichText component uses react-markdown, which was failing in backstop tests in headless browser due to missing polyfill.
// "Object.hasOwn" polyfill needed for react-markdown
if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}

// Polyfill for Array.prototype.at
if (!Array.prototype.at) {
    Array.prototype.at = function (n) {
        // Convert n to integer
        n = Math.trunc(n) || 0;
        // Handle negative indices
        if (n < 0) n += this.length;
        // Return undefined if out of bounds
        return this[n];
    };
}

// Polyfill for String.prototype.at
if (!String.prototype.at) {
    String.prototype.at = function (n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        return this.charAt(n);
    };
}
