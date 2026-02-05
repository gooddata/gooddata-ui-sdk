# @gooddata/oxlint-config

OxLint configuration for the GoodData.UI monorepo, designed to work alongside `@gooddata/eslint-config`.

## Purpose

This package provides oxlint configuration that complements the `oxlint-*` variants from `@gooddata/eslint-config`. Together, they provide complete linting coverage with improved performance by offloading rules to the faster Rust-based oxlint.

## How It Works

The GoodData linting setup is split between two tools:

| Tool   | Package                            | Handles                                      |
| ------ | ---------------------------------- | -------------------------------------------- |
| ESLint | `@gooddata/eslint-config/oxlint-*` | Rules not supported by oxlint                |
| OxLint | `@gooddata/oxlint-config`          | Rules supported by oxlint (faster execution) |

**Why split?**

- **Performance**: OxLint is significantly faster than ESLint for the rules it supports
- **Coverage**: ESLint still handles plugins and rules that oxlint doesn't support yet
- **Consistency**: The combined output matches the standard `@gooddata/eslint-config` variants

## Usage

### 1. Configure ESLint

Use an `oxlint-*` variant from `@gooddata/eslint-config`:

```typescript
// eslint.config.ts
// (C) 2025 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";

export default config;
```

### 2. Configure OxLint

Create an `.oxlintrc.json` that extends this package:

```json
{
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "extends": ["./node_modules/@gooddata/oxlint-config/dist/base.json"]
}
```

### 3. Run Both Linters

Run both linters in your CI/development workflow:

```bash
# Run oxlint first (faster, catches bulk of issues)
oxlint .

# Run eslint for remaining rules
eslint .
```

## Compatibility

This package is designed to work with all `oxlint-*` variants from `@gooddata/eslint-config`. See `@gooddata/eslint-config` for the full list of available variants.

## Migration from Standard ESLint

To migrate from standard `@gooddata/eslint-config` to the oxlint-enhanced setup:

1. Install both packages:

    ```bash
    rush add -p @gooddata/oxlint-config --dev
    ```

2. Update your `eslint.config.ts` to use an `oxlint-*` variant:

    ```typescript
    // Before
    import config from "@gooddata/eslint-config/esm-react-vitest";

    // After
    import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";
    ```

3. Add `.oxlintrc.json` extending this package:

    ```json
    {
        "$schema": "./node_modules/oxlint/configuration_schema.json",
        "extends": ["./node_modules/@gooddata/oxlint-config/dist/base.json"]
    }
    ```

4. Update your lint scripts to run both linters
