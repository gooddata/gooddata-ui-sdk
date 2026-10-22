---
legacy_path: references/dashboard_component/improve_performance
title: Improve dashboard performance
category: Dashboard & plugins
diataxis_type: howto
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/data-layer/execution/data-sampling
  - /docs/integrations/backend-setup
  - /docs/integrations/platform/architecture-overview
type: docs
description: Configure backend response caching with withCaching, including execution result expiration, cache limits, and the recommended defaults.
weight: 38
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/improve_performance/"
---

Wrap the backend instance with the `withCaching` decorator so the [Dashboard component](../dashboard/) and other components reuse backend responses instead of requesting them again.

## Cache the backend responses

The decorator needs a settings object to be handed over as a parameter to configure where the cache should be applied and to what size the cache should grow.
For execution results, you can use either count-based eviction (`maxExecutions`) or time-based eviction (`maxExecutionsAge`). When `maxExecutions` is specified, it takes precedence and uses LRU policy to evict items when the limit is reached. When only `maxExecutionsAge` is specified, items expire after the configured duration (the cache still holds at most 500 results at a time). For other cache types, items are removed using LRU policy once the max size of the cache is reached.

You can find the recommended caching options in `RecommendedCachingConfiguration` within the `@gooddata/sdk-backend-base` package.

### Caching backend configuration options

| Caching option                         | Description                                                                                                                                                          | Recommended setting |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| maxExecutions                          | Maximum number of executions which will have their results cached (count-based eviction using LRU policy). When specified, takes precedence over `maxExecutionsAge`. | 10                  |
| maxExecutionsAge                       | Maximum age of cached execution results in milliseconds (time-based eviction). Only used when `maxExecutions` is not specified.                                      | Not set (`maxExecutions` is used instead) |
| maxResultWindows                       | Maximum number of execution result pages to cache per result.                                                                                                      | 5                   |
| maxGeoCollectionItemsPerResult         | Maximum number of cached geo collection items per execution result.                                                                                                  | 200                 |
| maxCatalogs                            | Maximum number of workspaces for which to cache the catalogs.                                                                                                        | 1                   |
| maxCatalogOptions                      | Catalog can be viewed in many different ways - determined by the options specified during load.                                                                      | 50                  |
| maxSecuritySettingsOrgs                | Maximum number of organizations that will have their security settings cached.                                                                                       | 3                   |
| maxSecuritySettingsOrgUrls             | Maximum number of URLs per organization that will have their validation result cached.                                                                               | 100                 |
| maxSecuritySettingsOrgUrlsAge          | Maximum age of cached organization's URL validation results. The value is in milliseconds.                                                                           | 300 000             |
| maxAttributeWorkspaces                 | Maximum number of workspaces for which to cache the selected workspace attribute service calls.                                                                      | 1                   |
| maxAttributeDisplayFormsPerWorkspace   | Maximum number of attribute display forms to cache per workspace.                                                                                                    | 500                 |
| maxAttributesPerWorkspace              | Maximum number of attributes to cache per workspace.                                                                                                                 | 500                 |
| maxCommonAttributesPerWorkspace        | Maximum number of common attribute results to cache per workspace.                                                                                                   | 500                 |
| maxConnectedAttributesPerWorkspace     | Maximum number of connected attribute results to cache per workspace.                                                                                                | 500                 |
| maxAttributeElementResultsPerWorkspace | Maximum number of attribute element results to cache per workspace. Not all queries are cached (for example, queries with a `filter` value).                    | 100                 |
| maxAttributeElementsForLocalFiltering  | Maximum number of elements in an element list that may be searched locally instead of by the backend. Requires `maxAttributeElementResultsPerWorkspace` to be set.   | 500                 |
| maxWorkspaceSettings                   | Maximum number of settings for a workspace and for a user to cache per workspace.                                                                                    | 1                   |
| maxInsightsPerWorkspace                | Maximum number of saved visualizations to cache per workspace. Only `getInsight` reads are cached.                                                                  | 50                  |
| maxAutomationsWorkspaces               | Maximum number of workspaces for which to cache the automations service calls.                                                                                       | 1                   |
| maxFactsWorkspaces                     | Maximum number of workspaces for which to cache the facts service calls.                                                                                             | 1                   |
| maxFactsPerWorkspace                   | Maximum number of facts to cache per workspace.                                                                                                                      | 500                 |
| maxMeasuresWorkspaces                  | Maximum number of workspaces for which to cache the measures service calls.                                                                                          | 1                   |
| maxMeasuresPerWorkspace                | Maximum number of measures to cache per workspace.                                                                                                                   | 100                 |
| maxDatasetWorkspaces                   | Maximum number of workspaces for which to cache the datasets service calls.                                                                                          | 1                   |
| maxDatasetsPerWorkspace                | Maximum number of datasets to cache per workspace.                                                                                                                   | 500                 |
| maxExportTemplatesOrgs                 | Maximum number of organizations for which to cache organization-level export templates.                                                                              | 1                   |
| maxExportTemplatesWorkspaces           | Maximum number of workspaces for which to cache workspace-level export templates.                                                                                    | 1                   |
| cacheGeoStyles                         | Whether to cache the geo styles and sprite icons returned by `backend.geo()`.                                                                                        | true                |

### Wrap the backend

```ts
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";

export function createCachedBackend(realBackend: IAnalyticalBackend): IAnalyticalBackend {
    return withCaching(realBackend, RecommendedCachingConfiguration);
}
```

### Size the execution cache for your dashboards

`maxExecutions` is the number of execution results kept at once; the recommended value is 10. On a dashboard with
more widgets than that, the least-recently-used (LRU) policy evicts the first results before the last widgets finish, and re-renders hit
the analytics engine again. Set `maxExecutions` to at least the widget count of your largest dashboard, or use
`maxExecutionsAge` to expire results by time instead.

```ts
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withCaching, RecommendedCachingConfiguration } from "@gooddata/sdk-backend-base";

export function createCachedBackend(realBackend: IAnalyticalBackend): IAnalyticalBackend {
    return withCaching(realBackend, {
        ...RecommendedCachingConfiguration,
        maxExecutions: 40,
    });
}
```

## Invalidate the cache after a write

The caching decorator doesn't know when your application changes data. After you save a visualization, edit the
model, or change a dashboard filter configuration through the backend services, the decorated backend keeps
serving the cached version until it's evicted. Pass `onCacheReady` to receive a `CacheControl` and call the matching
`reset*` method after each write.

```ts
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type CacheControl, RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { type IInsight } from "@gooddata/sdk-model";

let cacheControl: CacheControl | undefined;

export function createBackend(realBackend: IAnalyticalBackend): IAnalyticalBackend {
    return withCaching(realBackend, {
        ...RecommendedCachingConfiguration,
        onCacheReady: (control) => {
            cacheControl = control;
        },
    });
}

export async function saveVisualization(backend: IAnalyticalBackend, workspace: string, insight: IInsight) {
    const saved = await backend.workspace(workspace).insights().updateInsight(insight);

    cacheControl?.resetInsights();
    cacheControl?.resetExecutions();

    return saved;
}
```

| Method | Clears |
|--------|--------|
| `resetExecutions()` | Execution results and result windows |
| `resetCatalogs()` | Loaded workspace catalogs |
| `resetInsights()` | Saved visualizations |
| `resetAttributes()` | Attributes, display forms, and attribute element results |
| `resetMeasures()` | Measures |

`CacheControl` has a `reset*` method for every other cache too, such as facts, datasets, settings, and automations;
see its [source on GitHub](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-backend-base/src/cachingBackend/index.ts). `@gooddata/sdk-backend-base` is not part of the API reference.

Clear the narrowest cache that covers the write. After you change a visualization, clear both visualizations and
executions, because its cached results are stale too. After you rename a measure, call `resetMeasures()` and
`resetCatalogs()`, because the catalog holds a copy of the title.
