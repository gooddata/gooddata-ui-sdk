---
title: Migration from Version 8.x
linkTitle: Migration Guide
copyright: (C) 2007-2019 GoodData Corporation
id: migration_guide_9
weight: 30
---

{{% alert color="warning" title="Version 9 vs Versions 10+" %}}
GoodData Platform users must stay on GoodData.UI version 9, do not update to version 10 or higher!
From version 10 onwards, the GoodData.UI SDK solely supports only GoodData Cloud and GoodData.CN.
{{% /alert %}}

## Before You Begin:
If you have a CommonJS codebase, it must be migrated to [ESM](https://nodejs.org/api/esm.html) before proceeding, as GoodData.UI now consists of [pure ESM packages](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

For applications based on `@gooddata/create-gooddata-react-app`, you should first replace `create-react-app` with a build tool of your choice. Although it's possible to make it work with GoodData.UI v9, TypeScript 5, and React 18 through workarounds, we advise [against it](https://github.com/facebook/create-react-app/issues/13072). After replacement, you can follow the steps outlined below.

## Migration Steps:

1. Upgrade TypeScript to v5.
2. Bump GoodData.UI dependencies to v9.
3. If you're using `@gooddata/catalog-export` tool, [migrate the configuration](#catalog-export).
4. If you wish to use React 18, [add few lines of the code](#react-18) to your app root.
5. Any dashboard plugins should be [upgraded and have CORS setup](#dashboard-plugins-upgrade).
6. If you're using namespaces exported from `@gooddata/api-model-bear` or `@gooddata/sdk-embedding`, migrate the corresponding typings and type guards. For most, this just involves removing the namespace. For renamed types, use your IDE's import intellisense to find the prefix that replaces the removed namespace.

### Catalog Export
Remove the `.gdcatalogrc` file; configuration is now possible via `package.json` or parameters (use `npx @gooddata/catalog-export --help` to find the parameters).

Here's an example of the configuration via package.json:
```json
    {
        ...
        "scripts": {
            "refresh-md": "gdc-catalog-export"
        },
        "gooddata": {
            "hostname": "https://your.gooddata.hostname.com",
            "workspaceId": "your_gooddata_workspaceid",
            "catalogOutput": "desired_file_name.ts|js",
            "backend": "tiger|bear"
        },
        ...
    }
```

Add secrets to the `.env` file according to your GoodData usage:

```ini
# For GoodData.Cloud or GoodData.CN:
TIGER_API_TOKEN=<your_token_for_the_tiger_server>

# For GoodData Enterprise:
GDC_USERNAME=<your_username>
GDC_PASSWORD=<your_password>
```

> **NOTE:** Never commit `.env` file to your version control system.

You can read more details in the [catalog export documentation](../../learn/visualize_data/export_catalog/).

### React 18
To use GoodData.UI v9 with React 18, add the following lines to the root of your application (where you import the React `createRoot` method), before `createRoot` is called.

```js
import { createRoot } from "react-dom/client";
import { provideCreateRoot } from '@gooddata/sdk-ui-ext';

provideCreateRoot(createRoot);
```

This ensures GoodData.UI uses the React 18 render method instead of the legacy method in its internal code.

### Dashboard Plugins
Refer to the standard [upgrade guide](../../references/dashboard_component/dashboard_plugins_upgrade/). You will also need to update the [import paths](https://www.typescriptlang.org/docs/handbook/esm-node.html#type-in-packagejson-and-new-extensions) in your plugin code to include `.js` extensions.

Note that plugins are now built with a .mjs extension and loaded as ESM modules, so you cannot redeploy the plugin to the same URL. Deploy the v9 plugin to a new location, create a new metadata object for it, unlink the previous one, and link the upgraded plugin with the desired dashboards.

Plugins built with v9 **must have CORS configured on their respective hosting platforms** in order to be accessible from the GoodData domain.

> **NOTE:** Please ensure not to combine v8 and v9 plugins on the same dashboard, as they are not compatible with each other.

### Struggling With Migration? 
If you have any questions or something is not clear to you, do not hesitate to write to us on [Slack](https://www.gooddata.com/slack/), [StackOverflow](https://stackoverflow.com/questions/tagged/gooddata) or [GitHub](https://github.com/gooddata/gooddata-ui-sdk).