---
trigger: model_decision
description: Architecture rules
globs:
---

# GoodData.UI SDK - Architecture Rules

## Layered Architecture

The GoodData.UI SDK follows a strict layered architecture pattern with the following layers:

1. **Layer 1: API Clients and Platform Specific Models**

    - Packages prefixed with `api-` (e.g., `@gooddata/api-client-tiger`)
    - Responsible for REST API clients and platform-specific data models

2. **Layer 2: Platform-Agnostic Domain Model and Backend SPIs**

    - Packages prefixed with `sdk-` (e.g., `@gooddata/sdk-model`, `@gooddata/sdk-backend-spi`)
    - SPI implementations prefixed with `sdk-backend-` (e.g., `@gooddata/sdk-backend-tiger`)
    - Defines the core analytical domain model and backend interfaces

3. **Layer 3: UI SDK React Components**
    - Packages prefixed with `sdk-ui-` (e.g., `@gooddata/sdk-ui`, `@gooddata/sdk-ui-charts`)
    - React components that can work with any platform

## Architectural Constraints

1. Packages on lower layers MUST NOT depend on packages on higher layers
2. Packages on one layer MUST depend only on packages either on the same layer, one layer down, or on the utility layer
3. Packages on one layer MUST NOT have cyclic dependencies

## Package API Rules

1. Each package MUST have an index.ts(x) file that precisely defines its public API
2. Wildcard re-exports are NOT allowed
3. All production packages MUST include api-extractor in their build pipeline
4. Public APIs MUST be 100% documented with TSDoc and annotated as @public, @alpha, @beta, or @internal

## Inter-Package Dependencies

1. Packages MUST adhere to the architectural layering constraints
2. Packages MUST depend only on each other's public APIs
3. Code within packages MUST NOT have cyclic dependencies
4. Code within packages MUST be imported directly, NEVER through the package's index

## Backend Agnosticism

1. Layer 3 packages (sdk-ui-\*) MUST NOT depend on any particular backend implementation
2. All interfacing with backend from Layer 3 is done via the platform-agnostic `sdk-model` and `sdk-backend-spi`
3. When checking for backend capabilities, use `IBackendCapabilities` instead of checking the backend implementation type

## React Component Rules

1. React components MUST use the platform-agnostic domain model (sdk-model)
2. React components MUST support theme customization where applicable
3. React components MUST provide adequate error handling
4. React components SHOULD be designed for composition and reusability
