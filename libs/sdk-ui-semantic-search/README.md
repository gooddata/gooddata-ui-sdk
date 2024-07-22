# GoodData.UI SDK - Semantic Search

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-charts)](https://www.npmjs.com/@gooddata/sdk-ui-charts)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-charts)](https://npmcharts.com/compare/@gooddata/sdk-ui-charts?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides a set of React-based UI components and hooks for semantic search within your metadata.

Example usage:

```tsx
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";

const App = () => {
    return (
        <SemanticSearch
            workspaceId="your-workspace-id"
            backend={tigerBackend}
            onSelect={handleSearchItemSelection}
            onError={handleError}
        />
    );
};
```

You can also use providers for backend and workspace.

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-charts/LICENSE).
