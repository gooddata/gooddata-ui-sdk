# @gooddata/eslint-config

Unified, modular ESLint configuration for the GoodData.UI monorepo.

## Purpose

This package consolidates ESLint configurations that were previously scattered across:

- SDK root directory configurations
- Separate library in gdc-ui

The new approach provides:

- **ESLint v8, v9 and v10 support** - Legacy config for v8, flat config built separately for v9 and v10
- **Modular structure** - Rules organized by plugin/concern in separate files
- **Easy to edit** - Find and modify rules in logical locations
- **Unified configs** - Single source of truth for linting standards
- **Type-safe** - TypeScript-based configuration with validation
- **Variant support** - Different preset combinations for various project types

## How It Works

### Architecture

1. **Configuration Modules** (`src/configurations/`)
    - Each file represents a plugin or concern (typescript, react, header, etc.)
    - Defines: required packages, plugins, rules, overrides
    - Type-safe with the `IConfiguration<RulePrefixLegacy, RulePrefixFlat>` interface
    - Each module carries a `legacy` config (ESLint v8) and a `flat` group with one config per flat target: `v9`, `v9ox`, `v10`, `v10ox` (`*ox` = the OxLint partial migration variant)

2. **Index File** (`src/index.ts`)
    - `commonConfigurations` array: Base rules applied to all configs
    - `commonVariants` object: Different combinations for specific use cases (exposed as `legacyVariants` and `flatVariants`)

3. **Build Process** (`npm run build`, see `scripts/build/legacy.ts` and `scripts/build/flat.ts`)
    - Legacy (v8) JSON configs go to `dist/v8/`: `base.json` and one file per variant
    - Flat (v9/v10) JS configs go to `dist/v9/` and `dist/v10/`: `base.js` and one file per variant, with the OxLint counterparts in an `oxlint/` subfolder
    - Package exports: `require` → `./v8/<variant>` (legacy JSON), `import` → `./v9/<variant>`, `./v9/oxlint/<variant>` or the `./v10/...` equivalents (flat JS); the base configuration is exported as the `base` variant, e.g. `./v8/base`, `./v9/base`, `./v9/oxlint/base`

4. **Package Sync** (`npm run update-package`)
    - Auto-updates `package.json` dependencies, peer dependencies and exports
    - Reads package requirements from each configuration module and flat target
    - Pins `devDependencies` to one flat target (`devEslintMajor` in `scripts/updatePackage.ts`), the ESLint major this repository lints with

## Available Variants

For a complete list of available variants and their required packages, see:

- [PACKAGES_V8.md](./PACKAGES_V8.md) - Package requirements for ESLint v8 configurations
- [PACKAGES_V9.md](./PACKAGES_V9.md) - Package requirements for ESLint v9 configurations
- [PACKAGES_V9_OXLINT.md](./PACKAGES_V9_OXLINT.md) - Package requirements for ESLint v9 + oxlint configurations
- [PACKAGES_V10.md](./PACKAGES_V10.md) - Package requirements for ESLint v10 configurations
- [PACKAGES_V10_OXLINT.md](./PACKAGES_V10_OXLINT.md) - Package requirements for ESLint v10 + oxlint configurations

## OxLint Migration Variants

This package also provides `oxlint/*` variants designed to be used alongside `@gooddata/oxlint-config`. These variants have certain ESLint plugins disabled because those rules are handled by oxlint instead, providing faster linting performance.

**How it works:**

- **eslint-config `oxlint/*` variants** contain ESLint rules that oxlint does not support
- **oxlint-config** contains the equivalent rules handled by oxlint
- Together, they provide the same coverage as the standard ESLint variants, but with oxlint handling the bulk of the work for better performance

**Example usage:**

```typescript
// eslint.config.ts
import config from "@gooddata/eslint-config/v9/oxlint/esm-react-vitest";

export default config;
```

See `@gooddata/oxlint-config` for the corresponding oxlint configuration and detailed setup instructions.

## ESLint v8, v9 and v10 Support

This package supports ESLint v8 (legacy config) and ESLint v9 and v10 (flat config):

| ESLint Version | Config Format | File Extension     | Import Type | Export path                             |
| -------------- | ------------- | ------------------ | ----------- | --------------------------------------- |
| v8             | Legacy JSON   | `.eslintrc.js`     | `require()` | `@gooddata/eslint-config/v8/<variant>`  |
| v9             | Flat Config   | `eslint.config.js` | `import`    | `@gooddata/eslint-config/v9/<variant>`  |
| v10            | Flat Config   | `eslint.config.js` | `import`    | `@gooddata/eslint-config/v10/<variant>` |

The ESLint major is part of every export path. There is no unprefixed export, so a consumer always states which major it is on. The base configuration is available as the `base` variant, e.g. `@gooddata/eslint-config/v9/base` or `@gooddata/eslint-config/v9/oxlint/base`.

Some packages differ between majors (e.g., `eslint-plugin-header` vs `eslint-plugin-headers` between v8 and v9, or plugins that only support ESLint v10 from a certain version). See the `PACKAGES_*.md` files for the complete list of required packages for each target.

## Usage

### ESLint v9 / v10 (Flat Config) - Recommended

For flat config, create an `eslint.config.js` or `eslint.config.ts` file and import the variant for your ESLint major:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/v9/esm-react-vitest";

export default config;
```

On ESLint v10, import from `@gooddata/eslint-config/v10/esm-react-vitest` instead.

To add custom rules or overrides:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/v9/esm-react-vitest";

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

import config from "@gooddata/eslint-config/v9/esm-react-vitest";

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
    extends: ["@gooddata/eslint-config/v8/react"],
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
    extends: ["@gooddata/eslint-config/v8/react"],
};
```

**Important Notes:**

- **Peer Dependencies**: Only packages that every build target (legacy, v9, v9ox, v10, v10ox) of the `commonConfigurations` needs are listed in `peerDependencies`. Variant-specific packages (e.g., `eslint-plugin-react` for the `react` variant) are **not** included as peer dependencies since they're not required by all consumers.

- **Verify Dependencies**: After adopting a configuration, run `npm run lint` (or your lint command) to ensure all necessary dependencies are present in your project. If you get plugin errors, install the missing packages.

## Development Guide

### Adding a New Configuration Module

1. Create a new file in `src/configurations/` (e.g., `my-plugin.ts`). Share objects between targets wherever the config is the same, and give a target its own object only where it differs (typically a plugin version that only supports one ESLint major):

```typescript
// (C) 2025 GoodData Corporation

import { type IPackage } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const myPlugin: IPackage = {
    name: "eslint-plugin-my-plugin",
    version: "1.0.0",
};

const rules = {
    "my-plugin/some-rule": "error",
};

const flat = {
    packages: [myPlugin],
    plugins: { "my-plugin": myPlugin },
    rules,
};

export const myPlugin: IConfiguration<"my-plugin"> = {
    legacy: {
        packages: [myPlugin],
        plugins: ["my-plugin"],
        rules,
    },
    // v9ox / v10ox are empty when oxlint covers this plugin's rules
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
```

2. Import it in `src/index.ts` and add it to `commonConfigurations` or a variant:

```typescript
import { myPlugin } from "./configurations/my-plugin.js";

export const commonConfigurations: IConfiguration[] = [
    // ... existing configs
    myPlugin,
];
```

3. **Run `npm run update-package`** to sync dependencies to `package.json`

4. Run `npm run build` to generate updated configs

### Adding a New Variant

1. Add the variant to `commonVariants` in `src/index.ts`:

```typescript
export const commonVariants: Record<string, IConfiguration[]> = {
    // ... existing variants
    "my-variant": [browserEnv, myPlugin],
};
```

2. **Run `npm run update-package`** to update `package.json` exports

3. Run `npm run build` to generate the new variant files

### Upgrading a Package Version

1. Update the version in the configuration file (e.g., `src/configurations/typescript.ts`). When the new version only supports one ESLint major, give that major its own package object:

```typescript
const v9 = {
    packages: [{ name: "@eslint/js", version: "9.39.5" }],
    ...common,
};

const v10 = {
    packages: [{ name: "@eslint/js", version: "10.0.1" }],
    ...common,
};

export const eslint: IConfiguration = {
    legacy: common,
    flat: { v9, v9ox: ox, v10, v10ox: ox },
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

3. Run `npm run build` to regenerate configs

## Scripts

- **`npm run build`** - Generates configuration files in `dist/`
    - Merges all configuration modules
    - Creates legacy `base.json` and all variant JSON files in `dist/v8/`
    - Creates flat `base.js` and all variant JS files in `dist/v9/` and `dist/v10/`, with their OxLint counterparts in `dist/v9/oxlint/` and `dist/v10/oxlint/`
    - Required before publishing or testing changes

- **`npm run update-package`** - Syncs dependencies and exports
    - Updates `devDependencies` (pinned to `devEslintMajor`) and `peerDependencies` in `package.json`
    - Updates `exports` field based on available variants (plus `base`) and ESLint majors
    - Generates `PACKAGES_V8.md`, `PACKAGES_V9.md`, `PACKAGES_V9_OXLINT.md`, `PACKAGES_V10.md` and `PACKAGES_V10_OXLINT.md`
    - **Must run after**: adding variants, adding configs, changing package versions

- **`npm run validate`** - Type-checks TypeScript files

- **`npm run lint`** - Lints the configuration source code

## Configuration Structure

Each configuration module follows this structure:

```typescript
interface IConfiguration<
    RulePrefixLegacy extends string = "",
    RulePrefixFlat extends string = RulePrefixLegacy,
> {
    // ESLint v8 (eslintrc)
    legacy: IConfigurationLegacy<RulePrefixLegacy>;

    // ESLint v9 / v10 (flat config), one config per build target
    flat: {
        v9: IConfigurationFlat<RulePrefixFlat>;
        v9ox: IConfigurationFlat<RulePrefixFlat>; // v9 with rules covered by oxlint left out
        v10: IConfigurationFlat<RulePrefixFlat>;
        v10ox: IConfigurationFlat<RulePrefixFlat>; // v10 with rules covered by oxlint left out
    };
}

interface IConfigurationLegacy<RulePrefix extends string = ""> {
    // Packages required for this configuration
    packages?: Array<{ name: string; version: string }>;
    // Parser to use (e.g., "@typescript-eslint/parser")
    parser?: string;
    // Plugins to register (e.g., ["react"])
    plugins?: string[];
    parserOptions?: Record<string, unknown>;
    rules?: Rules<RulePrefix>;
    settings?: Record<string, object>;
    env?: Record<string, boolean>;
    ignorePatterns?: string[];
    overrides?: Array<{ files: string[]; excludedFiles?: string[] } & IConfigurationLegacy<RulePrefix>>;
}

interface IConfigurationFlat<RulePrefix extends string = ""> {
    // Packages required for this configuration
    packages?: Array<{ name: string; version: string }>;
    // Parser to use (e.g., "@typescript-eslint/parser")
    parser?: string;
    // Plugins to register, keyed by the name used in rules (e.g., { react: reactPlugin })
    plugins?: Record<string, { name: string; version: string }>;
    // Replaces env and parserOptions of the legacy config
    languageOptions?: {
        globalsPresets?: GlobalsPreset[]; // spread from the `globals` package at build time
        globals?: Record<string, GlobalValue>;
        ecmaVersion?: number | "latest";
        sourceType?: "module" | "script" | "commonjs";
        parserOptions?: Record<string, unknown>;
    };
    rules?: Rules<RulePrefix>;
    settings?: Record<string, object>;
    ignorePatterns?: string[];
    overrides?: Array<{ files: string[]; excludedFiles?: string[] } & IConfigurationFlat<RulePrefix>>;
}
```

The two rule prefixes let the legacy and flat config register the same plugin under different names (e.g., `eslint-plugin-header` as `header` on v8 and `eslint-plugin-headers` as `headers` on v9/v10). See `src/types.ts` for the exact definitions.

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
