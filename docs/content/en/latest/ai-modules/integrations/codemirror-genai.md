---
legacy_path: codemirror6_genai_integration
title: Deduplicate CodeMirror 6
category: AI & Modules / Integrations
diataxis_type: howto
description: Configure webpack or Vite to dedupe the CodeMirror 6 packages so the AI Assistant chat input works.
ai_generated_description: true
type: docs
weight: 61
section: AI & Modules
subsection: Integrations
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/integrations/web-components/ai-assistant-custom-element
  - /docs/integrations/platform/esm-only
aliases:
  - "../../codemirror6_genai_integration/"
---

Bundle a single copy of the CodeMirror 6 core packages, so the AI Assistant chat input works. The [AI Assistant](../../ai-assistant/) in `@gooddata/sdk-ui-gen-ai` builds its message input on [CodeMirror 6](https://codemirror.net/docs/) (for autocomplete and highlighting of catalog objects). `@gooddata/sdk-ui-kit` and `@gooddata/sdk-ui-ext` also depend on CodeMirror 6 for their code editors. CodeMirror requires a single instance of its core packages in the bundle.

## Configure webpack

When you bundle the AI Assistant with webpack, alias the CodeMirror core packages to a single copy so the bundle does not contain duplicate instances:

```js
// In webpack.config.js/cjs
const path = require("path");

resolve: {
    // Dedupe packages to avoid duplicate instances
    alias: {
        "@codemirror/state": path.resolve(__dirname, "node_modules/@codemirror/state"),
        "@codemirror/view": path.resolve(__dirname, "node_modules/@codemirror/view"),
    },
},
```

### Why this configuration is necessary

CodeMirror 6 is modular and consists of several packages that work together. The two most critical packages that require deduplication are:

1. **@codemirror/state**: Manages the editor state and transactions
2. **@codemirror/view**: Handles the DOM representation of the editor

Without proper deduplication, you may encounter the following issues:

-   Multiple instances of CodeMirror packages leading to broken functionality
-   Errors related to incompatible state objects
-   Rendering problems in the code editor within the chat interface

## Configure Vite

If your project uses Vite instead of webpack, you'll need a different configuration to achieve the same result. Add the following to your `vite.config.js` or `vite.config.ts`:

```ts
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

### Vite configuration explanation

1. **optimizeDeps.exclude**: Prevents Vite from optimizing these packages during development, which can cause issues with CodeMirror's internal mechanisms.
2. **resolve.dedupe**: Ensures that only one instance of each CodeMirror package is used throughout your application, preventing the same issues that the webpack alias configuration addresses.

The React app template that `@gooddata/app-toolkit` scaffolds ships with the same `resolve.dedupe` entry.

## Troubleshooting

If the CodeMirror editor in the AI Assistant chat input doesn't work:

1. Verify that the webpack aliases or the Vite `resolve.dedupe` entries are configured
2. Check for version mismatches between CodeMirror packages (`npm ls @codemirror/state @codemirror/view` should list one version of each)
3. Ensure all required styles are imported
4. Check the browser console for error messages related to CodeMirror
