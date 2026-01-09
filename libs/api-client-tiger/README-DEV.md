# GoodData Cloud and GoodData.CN REST API Client

Client is generated with [openapi-generator](https://github.com/OpenAPITools/openapi-generator) using [typescript-axios](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-axios) module, according to GoodData Cloud and GoodData.CN [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification).

It means the client is generated based on code on running backend api and stored and versioned in this repository.

## Package Structure and Exports

### API Endpoints Structure

The package uses a modular structure with individual API endpoint modules located in `/src/api-endpoints/`. Each endpoint module provides tree-shakeable exports for specific API functionality:

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

### Export Methods

The package exports API endpoints via individual entry points in `package.json` to enable tree-shaking:

```json
{
    "exports": {
        "./execution": "./esm/api-endpoints/execution/index.js",
        "./entitiesObjects": "./esm/api-endpoints/entitiesObjects/index.js"
        // ... other endpoints
    }
}
```

**Preferred usage** - Import from specific endpoint modules:

```typescript
// ✅ Tree-shakeable - only imports execution API
import { ExecutionAPI_ComputeReport } from "@gooddata/api-client-tiger/execution";
import { tigerExecutionClientFactory } from "@gooddata/api-client-tiger/execution";
```

**Obsolete usage** - Main package exports are kept for backward compatibility only:

```typescript
// ❌ Not tree-shakeable - imports entire client
import { tigerClientFactory, ITigerClient } from "@gooddata/api-client-tiger";
```

See [`src/api-endpoints/readme.md`](src/api-endpoints/readme.md) for more details about the endpoint structure and tree-shaking benefits.

## How to generate client

1. You need to install Java runtime environment (because openapi-generator is a java based tool).

2. The script expects env variable `BASE_URL`
   Usually you want to use staging: `BASE_URL=https://staging.dev-latest.stg11.panther.intgdc.com`
   Create a file named `.env` in this directory based on `.env.template` file.
   The script then loads variables from this file automatically.

3. run `npm run generate-client`.

4. run `rush build`

5. **Note**: Adding missing exports to `/src/index.ts` is obsolete and kept only for backward compatibility. For new code, add exports to the appropriate endpoint module in `/src/api-endpoints/{endpoint}/index.ts` instead. The main `/src/index.ts` exports are maintained for legacy support but should not be extended.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/api-client-tiger/LICENSE).
