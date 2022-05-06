# Analytical Backend SPI - infrastructure and foundations

This package contains foundational, reusable code useful for building new or decorating existing
[Analytical Backend](https://www.npmjs.com/package/@gooddata/sdk-backend-spi) implementations. This is lower-level, infrastructural code which may be useful
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

## Normalizing Backend

This decorator addresses the fact that two execution definitions may lead semantically same results but differ just
in view-only details or technicalities. Before the execution is sent to the underlying backend this decorator will:

-   Strip alias, measure format and title from measures
-   Strip alias from attributes
-   Remove any noop filters
-   Normalize local identifiers

The normalized execution is sent to the backend and before the results and data are passed back to the caller code,
the decorator performs denormalization and restores the original values all in the right places in the result and
data structures. To the caller, all of this optimization remains transparent and everything looks like the original
execution actually executed.

```typescript
import {IAnalyticalBackend} from "@gooddata/sdk-backend-spi";
import {withNormalization} from "@gooddata/sdk-backend-base";

const realBackendImplementation = ...;
const enhancedBackend: IAnalyticalBackend = withNormalization(realBackendImplementation);
```

## Caching Backend

This decorator implements a naive client-side execution result caching with bounded cache size.
The execution results will be evicted only if cache limits are reached using LRU policy. Browser ‘Refresh’ cleans the cache.

If your app must deliver a snappy experience without too many loading indicators AND the data freshness is not a
critical requirement, then this decorator can speed your application immensely.

```typescript
import {IAnalyticalBackend} from "@gooddata/sdk-backend-spi";
import {withCaching} from "@gooddata/sdk-backend-base";

const realBackendImplementation = ...;
const enhancedBackend: IAnalyticalBackend = withCaching(realBackendImplementation);
```

The withCaching optionally accepts configuration which you can use to tweak the size of the different caches.

The caching plays well with normalization:

```typescript
import {IAnalyticalBackend} from "@gooddata/sdk-backend-spi";
import {withCaching, withNormalization} from "@gooddata/sdk-backend-base";

const realBackendImplementation = ...;
const enhancedBackend: IAnalyticalBackend = withNormalization(withCaching(realBackendImplementation));
```

This way the normalization first wipes any differences that are unimportant for the backend, effectively dispatching
just the really unique executions to the underlying backend - the caching decorator. This greatly increases client-side
cache hits for applications that dynamically change view-only properties of LDM objects.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-backend-base/LICENSE).
