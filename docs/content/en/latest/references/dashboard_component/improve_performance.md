---
id: improve_performance
title: Improve Dashboard component's performance
sidebar_label: Improve Dashboard component's performance
copyright: (C) 2022 GoodData Corporation
---

## Caching the backend responses
While using the SDK.UI ([Dashboard component](../), etc.), it's recommended to wrap the backend instance with the `withCaching` decorator for better performance.
The decorator needs settings object to be handed over as a parameter to configure where the cache should be applied and to what size should the cache grow.
Once the max size of the cache is reached, the items are removed using LRU policy.

You can find the recommended caching options in `RecommendedCachingConfiguration` within the `@gooddata/sdk-backend-base` package.


### Caching backend configuration options

| Caching option | Description | Recommended setting |
| :--- | :--- | :--- |
| maxExecutions | Maximum number of executions which will have their results cached. | 10 |
| maxResultWindows | Maximum number of execution result's pages to cache PER result. | 5 |
| maxCatalogs | Maximum number of workspaces for which to cache the catalogs. | 1 |
| maxCatalogOptions | Catalog can be viewed in many different ways - determined by the options specified during load. | 50 |
| maxSecuritySettingsOrgs | Maximum number of organizations that will have their security settings cached. | 3 |
| maxSecuritySettingsOrgUrls | Maximum number of URLs per organization that will have their validation result cached. | 100 |
| maxSecuritySettingsOrgUrlsAge | Maximum age of cached organization's URL validation results. The value is in milliseconds. | 300 000 |
| maxAttributeWorkspaces | Maximum number of workspaces for which to cache the selected workspace attribute service calls. | 1 |
| maxAttributeDisplayFormsPerWorkspace | Maximum number of attribute display forms to cache per workspace. | 100 |
| maxAttributesPerWorkspace | Maximum number of attributes to cache per workspace. | 100 |
| maxAttributeElementResultsPerWorkspace | Maximum number of attributes element results to cache per workspace. Note that not all the queries are cached (e.g. queries with `filter` value). | 100 |
| maxWorkspaceSettings | Maximum number of settings for a workspace and for a user to cache per workspace. | 1 |

### Example on how to use the caching backend

```typescript
import {IAnalyticalBackend} from "@gooddata/sdk-backend-spi";
import {withCaching, RecommendedCachingConfiguration} from "@gooddata/sdk-backend-base";

const realBackendImplementation = ...;
const enhancedBackend: IAnalyticalBackend = withCaching(realBackendImplementation, RecommendedCachingConfiguration);
```