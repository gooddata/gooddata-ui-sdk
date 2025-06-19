# CodeMirror 6 Integration with Gen AI Chat Component

## Overview

This document explains the integration between CodeMirror 6 and the GoodData Gen AI chat component. The integration ensures proper functionality of code editing capabilities within the chat interface.

## Required Webpack Configuration

When integrating CodeMirror 6 with the Gen AI chat component, specific webpack configurations are necessary to avoid duplicate package instances and ensure proper functionality:

```javascript
// In webpack.config.js/cjs
resolve: {
    // Dedupe packages to avoid duplicate instances
    alias: {
        "@codemirror/state": path.resolve(__dirname, "node_modules/@codemirror/state"),
        "@codemirror/view": path.resolve(__dirname, "node_modules/@codemirror/view"),
    },
},
```

### Why This Configuration Is Necessary

CodeMirror 6 is modular and consists of several packages that work together. The two most critical packages that require deduplication are:

1. **@codemirror/state**: Manages the editor state and transactions
2. **@codemirror/view**: Handles the DOM representation of the editor

Without proper deduplication, you may encounter the following issues:

-   Multiple instances of CodeMirror packages leading to broken functionality
-   Errors related to incompatible state objects
-   Rendering problems in the code editor within the chat interface

## Vite Configuration

If your project uses Vite instead of Webpack, you'll need a different configuration to achieve the same result. Add the following to your `vite.config.js` or `vite.config.ts`:

```javascript
// In vite.config.js/ts
export default defineConfig({
    // Other Vite config options...
    optimizeDeps: {
        exclude: ["@codemirror/state", "@codemirror/view"],
    },
    resolve: {
        alias: [], // Your other aliases if needed
        dedupe: ["@codemirror/state", "@codemirror/view"],
    },
});
```

### Vite Configuration Explanation

1. **optimizeDeps.exclude**: Prevents Vite from optimizing these packages during development, which can cause issues with CodeMirror's internal mechanisms.
2. **resolve.dedupe**: Ensures that only one instance of each CodeMirror package is used throughout your application, preventing the same issues that the Webpack alias configuration addresses.

This configuration is crucial for ensuring that CodeMirror works correctly with the Gen AI chat component in Vite-based projects.

## Troubleshooting

If you encounter issues with the CodeMirror editor in the Gen AI chat component:

1. Verify that the webpack aliases are correctly configured
2. Check for any version mismatches between CodeMirror packages
3. Ensure all required styles are properly imported
4. Check the browser console for any specific error messages related to CodeMirror

## Related Documentation

-   [CodeMirror 6 Documentation](https://codemirror.net/docs/)
-   [GoodData UI SDK Documentation](https://sdk.gooddata.com/gooddata-ui/)
