# @gooddata/sdk-code-convertors

GoodData Analytics as Code (AAC) declarative converters.

Converts between YAML-based AAC format and GoodData backend declarative API objects.

## Overview

This package provides bidirectional conversion for GoodData analytics objects:

- **YAML to Declarative** (AAC → API): `yamlVisualisationToDeclarative`, `yamlDashboardToDeclarative`, `yamlMetricToDeclarative`, `yamlDatasetToDeclarative`, etc.
- **Declarative to YAML** (API → AAC): `declarativeVisualisationToYaml`, `declarativeDashboardToYaml`, `declarativeMetricToYaml`, `declarativeDatasetToYaml`, etc.
- **Execution**: `buildAfmExecution` for building AFM execution requests from AAC format.
- **Schema types**: `v1` namespace with TypeScript types for the AAC YAML schema.

## Usage

```typescript
import { yamlMetricToDeclarative, declarativeMetricToYaml, v1 } from "@gooddata/sdk-code-convertors";

// AAC YAML object → Declarative API object
const metric: v1.Metric = {
    type: "metric",
    id: "revenue",
    title: "Revenue",
    maql: "SELECT {metric/order_amount}",
    format: "#,##0",
};
const declarative = yamlMetricToDeclarative(metric);

// Declarative API object → AAC YAML
const { content, json } = declarativeMetricToYaml(declarative);
```

## WASM

This package includes an isolated WASM build for use outside of Node.js (e.g., Python via wasmtime).
WASM is not part of the standard SDK build pipeline — it is built and tested separately via a dedicated CI workflow.

## License

MIT
