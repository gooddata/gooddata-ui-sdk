# Analytical Backend foundations

This package contains foundational, reusable code useful for building new or decorating existing
Analytical Backend implementations. This is lower-level, infrastructural code which may be useful
when building larger, more complex applications.

The notable contents of this package are documented below.

## Backend Decorators

Low level infrastructure to build your own Analytical Backend decorators. The decorators are used
to seamlessly enrich existing backend implementation with additional functionality - without
the need to touch the backend implementation itself.

See code comments in [base classes](src/decoratedBackend/index.ts) for further documentation on how
to create your own decorators. Or additionally look at existing decorator implementations for
inspiration.

## Eventing Backend

This decorator allows you to enhance any backend implementation with support for eventing. The eventing
is at the moment limited to the execution part of the Analytical Backend SPI.

Backend decorated with eventing can be created as follows:

```typescript
import {IAnalyticalBackend} from "@gooddata/sdk-backend-spi";
import {IExecutionDefinition, IDataView} from "@gooddata/sdk-model";
import {withEventing} from "@gooddata/sdk-backend-base";

const realBackendImplementation = ...;
const enhancedBackend: IAnalyticalBackend = withEventing(realBackendImplementation, {
    beforeExecute: (def: IExecutionDefinition) => {
        console.log("about to trigger execution with definition:", def);
    },
    successfulResultReadAll: (dataView: IDataView) => {
        console.log("retrieved all data for backend execution");
    }
});
```

You can then pass the `enhancedBackend` to the various React components offered by the SDK and be
notified.
