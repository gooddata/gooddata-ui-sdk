# API Endpoints Directory

This directory contains individual API endpoint modules that provide tree-shakeable exports for specific GoodData Cloud and GoodData.CN API functionality.

## Structure

The `api-endpoints` directory is organized into 18 separate endpoint modules, each corresponding to a specific API domain:

- **aac** - Analytics as Code format APIs (alternatives to layout APIs)
- **actions** - Workspace and organization management actions
- **authActions** - Authentication and authorization actions
- **automation** - Automation and workflow management
- **entitiesObjects** - Metadata entities (dashboards, visualizations, filters, etc.)
- **execution** - AFM execution and analysis APIs
- **explain** - AFM explain functionality
- **export** - Data export functionality
- **genAI** - Generative AI features
- **labelElements** - Label elements computation
- **layout** - Declarative layout management
- **profile** - User profile and feature flags
- **result** - Execution result management
- **scanModel** - Model scanning and analysis
- **smartFunctions** - Smart functions and calculations
- **userManagement** - User and group management
- **validDescendants** - Valid descendants computation
- **validObjects** - Valid objects computation

Each module contains an `index.ts` file that re-exports specific API functions and types from the generated API client code.

## Why Export via Individual Endpoints?

The API endpoints are exported as separate entry points in `package.json` to enable **tree-shaking** and reduce bundle size:

```json
{
    "exports": {
        "./execution": "./esm/api-endpoints/execution/index.js",
        "./entitiesObjects": "./esm/api-endpoints/entitiesObjects/index.js"
        // ... other endpoints
    }
}
```

### Benefits

1. **Tree-shaking**: Bundlers can eliminate unused code when importing only specific endpoints
2. **Smaller bundles**: Applications only include the API functionality they actually use
3. **Better performance**: Reduced JavaScript payload size improves load times
4. **Modular imports**: Developers can import only what they need:

    ```typescript
    // ✅ Good: Only imports execution API
    import { ExecutionAPI_ComputeReport } from "@gooddata/api-client-tiger/execution";

    // ❌ Bad: Imports entire client (not tree-shakeable)
    import { tigerClientFactory, ITigerClient } from "@gooddata/api-client-tiger";
    ```

## Obsolete APIs

### `tigerClientBaseFactory` and `ITigerClient`

The `tigerClientBaseFactory` and `ITigerClient` interfaces exported from the main package are **obsolete** and should not be used in new code. These APIs are not tree-shakeable because they:

1. Import all endpoint factories regardless of usage
2. Create a monolithic client object that bundles all API functionality
3. Prevent bundlers from eliminating unused code

**Instead**, use direct imports from individual endpoint modules:

```typescript
// ❌ Obsolete - not tree-shakeable
import { tigerClientFactory, ITigerClient } from "@gooddata/api-client-tiger";
const client = tigerClientFactory(axios);

// ✅ Preferred - tree-shakeable
import { tigerExecutionClientFactory } from "@gooddata/api-client-tiger/execution";
import { tigerProfileClientFactory } from "@gooddata/api-client-tiger/profile";
const executionClient = tigerExecutionClientFactory(axios);
const profileClient = tigerProfileClientFactory(axios);
```

The individual endpoint factories (`tiger*ClientFactory`) are exported from their respective endpoint modules and provide the same functionality while enabling proper tree-shaking.
