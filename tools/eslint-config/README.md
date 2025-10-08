# @gooddata/eslint-config

Unified, modular ESLint configuration for the GoodData.UI monorepo.

## Purpose

This package consolidates ESLint configurations that were previously scattered across:

- SDK root directory configurations
- Separate library in gdc-ui

The new approach provides:

- **Modular structure** - Rules organized by plugin/concern in separate files
- **Easy to edit** - Find and modify rules in logical locations
- **Unified configs** - Single source of truth for linting standards
- **Type-safe** - TypeScript-based configuration with validation
- **Variant support** - Different preset combinations for various project types

## How It Works

### Architecture

1. **Configuration Modules** (`src/configurations/`)
    - Each file represents a plugin or concern (typescript, react, header, etc.)
    - Defines: required packages, plugin name, rules, extends, overrides
    - Type-safe with `IConfiguration<RulePrefix>` interface

2. **Index File** (`src/index.ts`)
    - `common` array: Base rules applied to all configs
    - `variants` object: Different combinations for specific use cases

3. **Build Process** (`npm run build`)
    - Merges configuration modules into JSON files in `dist/`
    - Creates `base.json` (all common configs)
    - Creates variant files: `browser.json`, `react.json`, `esm-react.json`, etc.
    - Consumers import via: `@gooddata/eslint-config/react` � `dist/react.json`

4. **Package Sync** (`npm run update-package`)
    - Auto-updates `package.json` dependencies and peer dependencies
    - Reads package requirements from each configuration module
    - Syncs versions to ensure consistency

## Available Variants

- **base** (`.`) - Core rules for all packages
- **browser** (`/browser`) - For packages using browser APIs (document, window)
- **browser-esm** (`/browser-esm`) - Browser + ESM import rules
- **esm** (`/esm`) - ESM-specific import rules
- **esm-vitest** (`/esm-vitest`) - ESM + Vitest rules
- **react** (`/react`) - Browser + React + React Hooks rules
- **react-cypress** (`/react-cypress`) - Browser + React + React Hooks + Cypress rules
- **esm-react** (`/esm-react`) - Browser + React + React Hooks + ESM rules (most React libraries)
- **esm-react-cypress** (`/esm-react-cypress`) - Browser + React + React Hooks + ESM + Cypress rules
- **esm-react-vitest** (`/esm-react-vitest`) - Browser + React + React Hooks + ESM + Vitest rules

## Usage

### TypeScript Projects (Recommended)

For TypeScript projects, use the `tsOverride` helper which automatically configures the TypeScript parser, import resolver, and other required settings:

```javascript
// (C) 2020 GoodData Corporation

const { tsOverride } = require("@gooddata/eslint-config/tsOverride");

module.exports = {
    extends: ["@gooddata/eslint-config/react"],
    overrides: [
        tsOverride(__dirname, {
            // Optional: Add custom TypeScript rule overrides here
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        }),
    ],
};
```

**What `tsOverride` does:**
- Sets up the TypeScript parser (`@typescript-eslint/parser`)
- Configures `tsconfigRootDir` to point to your project directory
- Configures the import resolver to handle TypeScript imports correctly
- Applies to `**/*.ts` and `**/*.tsx` files
- Allows you to pass custom rule overrides as the second parameter

### Non-TypeScript Projects

For non-TypeScript projects, simply extend the configuration:

```javascript
module.exports = {
    extends: ["@gooddata/eslint-config/react"],
};
```

**Important Notes:**

- **TypeScript Projects**: Using `tsOverride(__dirname, rules)` is **mandatory** for TypeScript projects. Without it, `@typescript-eslint/parser` won't know where to find your `tsconfig.json`, and import resolution will not work correctly.

- **Peer Dependencies**: Only packages from the `common` configuration are listed in `peerDependencies`. Variant-specific packages (e.g., `eslint-plugin-react` for the `react` variant) are **not** included as peer dependencies since they're not required by all consumers.

- **Verify Dependencies**: After adopting a configuration, run `npm run eslint` (or your lint command) to ensure all necessary dependencies are present in your project. If you get plugin errors, install the missing packages.

## Development Guide

### Adding a New Configuration Module

1. Create a new file in `src/configurations/` (e.g., `my-plugin.ts`):

```typescript
// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"my-plugin"> = {
    packages: [
        {
            name: "eslint-plugin-my-plugin",
            version: "1.0.0",
        },
    ],
    plugin: "my-plugin",
    extends: ["plugin:my-plugin/recommended"],
    rules: {
        "my-plugin/some-rule": "error",
    },
};

export default configuration;
```

2. Export it from `src/configurations/index.ts`:

```typescript
export { default as myPlugin } from "./my-plugin.js";
```

3. Add it to `common` or a variant in `src/index.ts`:

```typescript
export const common = [
    // ... existing configs
    myPlugin,
];
```

4. **Run `npm run update-package`** to sync dependencies to `package.json`

5. Run `npm run build` to generate updated JSON configs

### Adding a New Variant

1. Add the variant to `src/index.ts`:

```typescript
export const variants = {
    // ... existing variants
    "my-variant": [browserEnv, myPlugin],
};
```

2. **Run `npm run update-package`** to update `package.json` exports

3. Run `npm run build` to generate the new variant JSON file

### Upgrading a Package Version

1. Update the version in the configuration file (e.g., `src/configurations/typescript.ts`):

```typescript
const configuration: IConfiguration = {
    packages: [
        {
            name: "@typescript-eslint/parser",
            version: "8.50.0", // � Update here
        },
    ],
    // ...
};
```

2. **Run `npm run update-package`** to sync to `package.json`

3. Run `npm run build` to regenerate configs

### Modifying Rules

1. Find the relevant configuration file in `src/configurations/`
2. Update the rules object:

```typescript
rules: {
    "my-plugin/some-rule": "off", // Disable
    "my-plugin/another-rule": ["error", { option: true }], // Configure
}
```

3. Run `npm run build` to regenerate JSON configs

## Scripts

- **`npm run build`** - Generates JSON configuration files in `dist/`
    - Merges all configuration modules
    - Creates base.json and all variant files
    - Required before publishing or testing changes

- **`npm run update-package`** - Syncs dependencies and exports
    - Updates `devDependencies` and `peerDependencies` in `package.json`
    - Updates `exports` field based on available variants
    - **Must run after**: adding variants, adding configs, changing package versions

- **`npm run validate`** - Type-checks TypeScript files

- **`npm run eslint`** - Lints the configuration source code

## Configuration Structure

Each configuration module follows this structure:

```typescript
interface IConfiguration<RulePrefix extends string = ""> {
    // Packages required for this configuration
    packages?: Array<{
        name: string;
        version: string;
    }>;

    // Parser to use (e.g., "@typescript-eslint/parser")
    parser?: string;

    // Plugin to register (e.g., "react")
    plugin?: string;

    // Shareable configs to extend
    extends?: string[];

    // Parser options
    parserOptions?: Record<string, number | string>;

    // ESLint rules
    rules?: Rules<RulePrefix>;

    override?: {
        files: string[];
        parser?: string;
        plugin?: string;
        extends?: string[];
        parserOptions?: Record<string, number | string>;
        rules?: Rules<RulePrefix>;
        settings?: Record<string, object>;
        env?: Record<string, boolean>;
        ignorePatterns?: string[];
    };

    // Plugin settings
    settings?: Record<string, object>;

    // Environment settings
    env?: Record<string, boolean>;

    // Ignore patterns (e.g., "**/dist/**/*.*")
    ignorePatterns?: string[];
}
```

**Notes**:

- The base configuration automatically ignores `**/dist/**/*.*` and `**/esm/**/*.*` files.
- **ESM vs ImportESM**: The `esm` configuration sets `parserOptions.sourceType: "module"` to tell the parser to treat files as ES modules. The `importEsm` configuration adds the `eslint-plugin-import-esm` plugin which enforces ESM-specific import rules (e.g., requiring `.js` extensions in imports). Most ESM projects need both.
