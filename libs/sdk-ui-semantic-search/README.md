# GoodData.UI SDK - Semantic Search

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-charts)](https://www.npmjs.com/@gooddata/sdk-ui-charts)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-charts)](https://npmcharts.com/compare/@gooddata/sdk-ui-charts?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides a set of React-based UI components and hooks for semantic search within your metadata.

## Components

### SemanticSearch

The `SemanticSearch` component provides a search input with semantic search capabilities.

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

## Hooks

### useHybridSearch

The `useHybridSearch` hook is a powerful tool that combines traditional keyword-based search with AI-powered semantic search. It handles debouncing of the search query and manages the state of both search types.

#### Basic Usage

```tsx
import { useHybridSearch, SearchItem, SearchItemGroup } from "@gooddata/sdk-ui-semantic-search";

const MySearchComponent = ({ items }: { items: SearchItem[] }) => {
    const { searchState, semanticSearchState, search, onSearchQueryChange } = useHybridSearch({
        itemBuilder: (item, { ref, type }) => {
            // Transform semantic search result to your SearchItem format
            return items.find((i) => areObjRefsEqual(i.ref, ref));
        },
        debounceMs: 200,
    });

    // Perform the combined search
    const results = search({ items });

    return (
        <div>
            <input
                type="text"
                value={searchState.query}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search..."
            />

            {searchState.state === "searching" && <div>Searching...</div>}

            <h3>Results</h3>
            <ul>
                {results.searchItems.map((item) => (
                    <li key={objRefToString(item.ref)}>{item.title}</li>
                ))}
            </ul>

            {semanticSearchState.state === "loading" && <div>Loading semantic results...</div>}

            {results.searchRelatedItems.length > 0 && (
                <>
                    <h3>Related (Semantic) Results</h3>
                    <ul>
                        {results.searchRelatedItems.map((item) => (
                            <li key={objRefToString(item.ref)}>{item.title}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};
```

#### Configuration Options

The `useHybridSearch` hook accepts an options object (`IUseHybridSearchOptions`):

| Property             | Type                      | Description                                                                                     |
| :------------------- | :------------------------ | :---------------------------------------------------------------------------------------------- |
| `itemBuilder`        | `HybridSearchItemBuilder` | **Required.** A function to transform semantic search results into your local item format.      |
| `backend`            | `IAnalyticalBackend`      | Optional. Backend to use. If not provided, it's retrieved from `BackendContext`.                |
| `workspace`          | `string`                  | Optional. Workspace ID to use. If not provided, it's retrieved from `WorkspaceContext`.         |
| `debounceMs`         | `number`                  | Optional. Debounce time for the search query in milliseconds (default: 150ms).                  |
| `allowSematicSearch` | `boolean`                 | Optional. Enable or disable AI-powered semantic search (default: true).                         |
| `limit`              | `number`                  | Optional. Maximum number of semantic search results to return.                                  |
| `deepSearch`         | `boolean`                 | Optional. Whether to perform a deep semantic search.                                            |
| `objectTypes`        | `ObjectType[]`            | Optional. Restrict semantic search to specific object types (e.g., `'insight'`, `'dashboard'`). |
| `includeTags`        | `string[]`                | Optional. Tags that must be present on the searched objects.                                    |
| `excludeTags`        | `string[]`                | Optional. Tags that must not be present on the searched objects.                                |
| `matcher`            | `HybridSearchMatcher`     | Optional. A custom matching function for local keyword search.                                  |

#### Hook Return Value

The hook returns an object (`IHybridSearchResult`) with the following properties:

| Property              | Type                   | Description                                                                 |
| :-------------------- | :--------------------- | :-------------------------------------------------------------------------- |
| `searchState`         | `ISearchState`         | Current state of the keyword search (`query`, `debouncedQuery`, `state`).   |
| `semanticSearchState` | `ISemanticSearchState` | Current state of the semantic search (`state`, `message`, `error`).         |
| `search`              | `Function`             | A function that takes your local items and returns combined search results. |
| `onSearchQueryChange` | `Function`             | Callback to update the search query.                                        |

The `search` function returns `ICombinedSearchResults`, which extends the standard `SearchResults` with `searchRelatedItems` (items found via semantic search but transformed by your `itemBuilder`).

#### Search Function Parameters

The `search` function accepts the following properties:

| Property     | Type               | Description                                                                                                                                               |
| :----------- | :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`      | `ReadonlyArray<I>` | **Required.** The current list of items to search through (e.g., currently filtered or paged items).                                                      |
| `allItems`   | `ReadonlyArray<I>` | Optional. The full list of all available items. If provided, it's used to calculate `searchAllItems` in the results. Defaults to `items` if not provided. |
| `itemGroups` | `ReadonlyArray<G>` | Optional. Groups of items to search through. Used to calculate `searchItemGroups` in the results.                                                         |
| `keywords`   | `string[]`         | Optional. A list of keywords to match against the search query. Used to calculate `searchKeywords` in the results.                                        |

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-charts/LICENSE).
