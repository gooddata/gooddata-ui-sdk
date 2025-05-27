---
trigger: model_decision
description: Folder structure and naming conventions
globs:
---

# GoodData.UI SDK - Folder Structure and Naming Conventions

This rule outlines the recommended folder structure and naming conventions for the GoodData.UI SDK repository.

## Repository Structure

The GoodData.UI SDK follows a structured monorepo pattern organized by package categories:

1. **libs/** - Main production packages divided by architectural layers

    - Layer 1: API clients (`api-*` prefix)
    - Layer 2: Domain model and backend SPI (`sdk-model`, `sdk-backend-*`)
    - Layer 3: UI components (`sdk-ui-*`)

2. **tools/** - Development tools and utilities that support the SDK

3. **examples/** - Example projects demonstrating SDK usage

    - `playground` - Interactive development playground
    - `sdk-examples` - Usage examples
    - `sdk-interactive-examples` - Interactive examples

4. **skel/** - Project skeletons/templates for new packages

    - `sdk-skel-ts` - TypeScript skeleton
    - `sdk-skel-tsx` - TypeScript with React skeleton

5. **common/** - Shared configurations and cross-package utilities

    - `config` - Common configurations
    - `scripts` - Shared build and development scripts

6. **docs/** - Documentation resources

## Package Structure

Each package should maintain the following internal structure:

1. **src/** - Source code files

    - `index.ts(x)` - Public API definitions
    - Feature-specific folders in appropriate naming style
    - Module-specific types in dedicated files
    - Components in PascalCase files (`ComponentName.tsx`)
    - Utilities in camelCase files (`utilityName.ts`)

2. **styles/** - For UI packages, SCSS/CSS files

    - Should follow the same structure as the src/ folder

3. **api/** - Generated API documentation

4. **esm/** - Compiled ES modules output

5. **config/** - Package-specific configurations

    - Build, test, and lint configurations

6. **temp/** - Temporary build artifacts (not committed)

7. **tests/** or `__tests__/` - Test files (when not colocated with source)

    - Unit tests
    - Integration tests

8. **rush-logs/** - Rush build logs (not committed)

## Component Folder Structure

React components should follow this organization:

1. **Component Name/** - PascalCase folder matching component name
    - `ComponentName.tsx` - Main component file
    - `ComponentName.styles.ts` or `ComponentName.scss` - Component styles
    - `types.ts` - Component type definitions
    - `helpers.ts` - Helper functions specific to the component
    - `constants.ts` - Constants specific to the component
    - `tests/ComponentName.test.tsx` - Component tests (or colocated in same folder)
    - `index.ts` - Export file

## Naming Conventions

1. **Files:**

    - React Components: PascalCase (`Button.tsx`)
    - Non-Component TypeScript: camelCase (`utils.ts`)
    - Test files: Match source file name with `.test` suffix (`Button.test.tsx`)
    - Style files: Match component name with `.styles` suffix (`Button.styles.scss`)
    - Constants: camelCase or CONSTANT_CASE (`constants.ts` or `CONSTANTS.ts`)

2. **Folders:**

    - Component folders: PascalCase matching component name
    - Utility/feature folders: camelCase (`utils/`, `models/`)
    - Test directories: `tests/` or `__tests__/`

3. **Special Files:**
    - Each package must have an `index.ts(x)` at its root that defines public API
    - Use `internal.ts` for internal-only exports (not part of public API)
    - Use `README.md` to document package purpose and usage

## Temporary/Staging Code

If temporary or experimental code needs to be included:

-   Use `_staging/` folder within a package
-   Document with a note.md file explaining purpose and expected lifespan
-   Plan to relocate or refactor before final release
