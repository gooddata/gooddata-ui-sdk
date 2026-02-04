# @gooddata/eslint-config

Unified, modular ESLint configuration for the GoodData.UI monorepo.

## Purpose

This package consolidates ESLint configurations that were previously scattered across:

- SDK root directory configurations
- Separate library in gdc-ui

The new approach provides:

- **ESLint v8 and v9 support** - Dual configuration format for both legacy and flat config
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
    - Generates both ESLint v8 (JSON) and v9 (JS flat config) formats
    - Creates `base.json` + `base.js` (all common configs)
    - Creates variant files: `browser.json`/`.js`, `react.json`/`.js`, etc.
    - Package exports use conditional exports: `require` → JSON (v8), `import` → JS (v9)

4. **Package Sync** (`npm run update-package`)
    - Auto-updates `package.json` dependencies and peer dependencies
    - Reads package requirements from each configuration module
    - Syncs versions to ensure consistency

## Available Variants

For a complete list of available variants and their required packages, see:

- [PACKAGES_V8.md](./PACKAGES_V8.md) - Package requirements for ESLint v8 configurations
- [PACKAGES_V9.md](./PACKAGES_V9.md) - Package requirements for ESLint v9 configurations

## ESLint v8 vs v9 Support

This package supports both ESLint v8 (legacy config) and ESLint v9 (flat config):

| ESLint Version | Config Format | File Extension     | Import Type |
| -------------- | ------------- | ------------------ | ----------- |
| v8             | Legacy JSON   | `.eslintrc.js`     | `require()` |
| v9             | Flat Config   | `eslint.config.js` | `import`    |

The package uses conditional exports to automatically serve the correct format:

- **CommonJS/require** → Returns JSON config for ESLint v8
- **ESM/import** → Returns JS flat config for ESLint v9

Some packages differ between v8 and v9 (e.g., `eslint-plugin-header` vs `eslint-plugin-headers`). See [PACKAGES_V8.md](./PACKAGES_V8.md) and [PACKAGES_V9.md](./PACKAGES_V9.md) for the complete list of required packages for each version.

## Usage

### ESLint v9 (Flat Config) - Recommended

For ESLint v9 with flat config, create an `eslint.config.js` or `eslint.config.ts` file:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";

export default config;
```

To add custom rules or overrides:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";

export default [
    ...config,
    {
        rules: {
            // Custom rule overrides (applies to all files)
            "no-console": "warn",
        },
    },
];
```

To add TypeScript-specific rule overrides, specify a `files` pattern:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";

export default [
    ...config,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            // TypeScript rule overrides (applies only to TS files)
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
```

### ESLint v8 (Legacy Config)

For ESLint v8, use the legacy JSON-based configuration:

```javascript
// .eslintrc.js
// (C) 2020 GoodData Corporation

module.exports = {
    extends: ["@gooddata/eslint-config/react"],
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
            rules: {
                // Custom TypeScript rule overrides
                "@typescript-eslint/no-namespace": "off",
            },
        },
    ],
};
```

### Non-TypeScript Projects (v8)

For non-TypeScript projects using ESLint v8, simply extend the configuration:

```javascript
module.exports = {
    extends: ["@gooddata/eslint-config/react"],
};
```

**Important Notes:**

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
    - Generates `PACKAGES_V8.md` and `PACKAGES_V9.md` documentation files
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

## Formatting

This package is **decoupled from formatters**. The `formatter` configuration (included in all variants by default) disables ESLint rules that conflict with code formatters, allowing you to use any formatter of your choice (Prettier, oxfmt, Biome, etc.) as a separate tool.

**How it works:**

- ESLint focuses solely on code quality and best practices
- Formatting rules (indentation, spacing, quotes, etc.) are disabled
- Run your formatter separately (e.g., `prettier --write` or `oxfmt`)

**Recommended setup:**

1. Install your preferred formatter (e.g., `prettier` or `oxfmt`)
2. Configure it separately (e.g., `.prettierrc` or `oxfmt.json`)
3. Run formatting as a separate step in your workflow or editor

This approach provides:

- **Flexibility** - Choose any formatter without changing ESLint config
- **Performance** - Formatters run faster when not piped through ESLint
- **Clarity** - Clear separation between linting (code quality) and formatting (code style)
