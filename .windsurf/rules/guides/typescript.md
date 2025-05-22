---
trigger: model_decision
description: 
globs: *.ts,*.tsx
---

# TypeScript Rules

## Configuration and Setup

1. **TypeScript Configuration**
    - Each package has four TS config files:
        - `tsconfig.build.json`, `tsconfig.build.esm.json` - for production builds
        - `tsconfig.dev.json` - for development builds
        - `tsconfig.json` - base file used for IDEs
2. **Target and Module Settings**

    - Use `ES2022` as target
    - Use `NodeNext` for module and moduleResolution
    - Include source maps and declaration maps

3. **Strict TypeScript**
    - Use strict mode with all strict checks
    - Use `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns`

## Coding Conventions

1. **API Design**

    - All exported APIs must have API Maturity annotations:
        - `@alpha`: initial API; likely to change outside of SemVer
        - `@beta`: mostly stable API; details may change outside of SemVer
        - `@public`: stable API; follows SemVer specification
        - `@internal`: internal API; may change or disappear at any time

2. **Interface Naming**

    - Interfaces should start with "I" prefix (e.g., `IAttributeFilter`, `IExportResult`)
    - Enum and Union type values should use PascalCase

3. **Type Definitions**

    - Create union types for related interfaces (e.g., `type IAttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter`)
    - Use TypeScript's utility types like `Omit<>` when extending interfaces
    - For string literal union types, create both enum-like const objects and types

4. **TypeScript Utility Types**

    - Use TypeScript's built-in utility types appropriately to manipulate and transform types

5. **Import/Export Rules**

    - No duplicate imports
    - No wildcard re-exports in public API
    - Strictly defined and controlled package API through index.ts(x)
    - API surface is enumerated exactly (no wildcard exports)

6. **Modern TypeScript Features**
    - Prefer optional chaining and nullish coalescing (`?.` and `??`)
    - No usage of `lodash/get` (use optional chaining instead)

## Documentation

1. **TSDoc Structure**

    - Follow TSDoc recommendation for comments:
        1. Summary - short and descriptive text about the feature
        2. Remarks blocks - use `@remarks` and `@privateRemarks` for detailed descriptions
        3. Additional blocks - `@example`, `@param`, `@returns` in this order
        4. Modifiers block - `@internal`, `@public`, `@alpha`, `@beta`

2. **Documentation Guidelines**
    - Keep summaries short and descriptive in a single paragraph
    - Keep notes and detailed explanations inside `@remarks` tag
    - All public APIs must have 100% TSDoc coverage
    - Use `@public`, `@alpha`, `@beta` or `@internal` annotation for API visibility

## Package Development

1. **Intra-Package Dependencies**

    - Code within the same package MUST NOT have cyclic dependencies
    - Code within the same package MUST be imported directly
    - Never import through package's index within the same package

2. **Inter-Package Dependencies**
    - Packages must adhere to architectural layering constraints
    - Packages must depend only on each other's public APIs
