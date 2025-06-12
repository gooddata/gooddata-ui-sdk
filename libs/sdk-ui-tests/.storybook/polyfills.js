// (C) 2024 GoodData Corporation

// RichText component uses react-markdown, which was failing in backstop tests in headless browser due to missing polyfill.
// "Object.hasOwn" polyfill needed for react-markdown
if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}
