---
title: Semantic Search
linkTitle: Semantic Search
copyright: (C) 2025 GoodData Corporation
id: embed_semantic_search
no_list: true
weight: 72
---

GoodData.UI provides a React component for embedding a semantic search interface that allows users to search for analytical objects using natural language.

## Features

-   Embed UI for semantic search functionality.
-   Search for analytical objects using natural language.
-   Filter search results by object types.
-   Enable deep search to find dashboards by their contents.
-   Theming is supported out of the box through [Theme Provider].

## Basic integration example

`SemanticSearch` component renders a search input field with a dropdown for displaying search results.

```tsx
import * as React from "react";
import { SemanticSearch, ISemanticSearchResultItem } from "@gooddata/sdk-ui-semantic-search";

// Import required styles
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

const App = () => {
    return (
        <div style={{ width: 300 }}>
            {/* Wrap the search UI in a container of desired size */}
            <SemanticSearch
                // Handle item selection
                onSelect={(item: ISemanticSearchResultItem) => {
                    console.log(`Selected item: ${item.title}`);
                    // Handle the selected item, e.g., navigate to the dashboard
                }}
                // Optional: Handle search errors
                onError={(errorMessage: string) => {
                    console.error(`Search error: ${errorMessage}`);
                }}
                // Optional: Filter by object types
                objectTypes={["dashboard", "metric"]}
                // Optional: Enable deep search
                deepSearch={true}
                // Optional: Set results limit
                limit={10}
                // Optional: Custom placeholder
                placeholder="Search for dashboards, metrics..."
            />
        </div>
    );
};
```

### Props

| Name        | Type                                      | Default | Description                                                                             |
| ----------- | ----------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| locale      | string                                    | -       | Specifies the locale for internationalization. Falls back to context if not specified   |
| backend     | IAnalyticalBackend                        | -       | Backend instance. Falls back to BackendProvider context if not specified                |
| workspace   | string                                    | -       | Workspace ID. Falls back to WorkspaceProvider context if not specified                  |
| onSelect    | (item: ISemanticSearchResultItem) => void | -       | Required callback function called when the user selects an item from the search results |
| onError     | (errorMessage: string) => void            | -       | Optional callback function called when an error occurs during the search                |
| className   | string                                    | -       | Additional CSS class for the component                                                  |
| objectTypes | GenAIObjectType[]                         | -       | A list of object types to search for (e.g., "dashboard", "metric", "insight")           |
| deepSearch  | boolean                                   | false   | Enable deep search to find dashboards by their contents                                 |
| limit       | number                                    | 10      | Target number of search results to return. See note below about actual result count     |
| placeholder | string                                    | -       | Placeholder text for the search input                                                   |

> **Note about result limits:** The `limit` parameter specifies a target number of results, but the actual number of returned items may vary:
>
> -   Fewer items may be returned if there aren't enough semantically relevant matches for the search term
> -   More items may be returned when using `deepSearch=true`, as both matching items (like visualizations) and their containers (like dashboards) will be included in the results
> -   The relationships between items are provided separately in the `relationships` array

## Using the semantic search hook

If you need more control over the search functionality, you can use the `useSemanticSearch` hook directly:

```tsx
import * as React from "react";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

const MyCustomSearchComponent = () => {
    const [searchTerm, setSearchTerm] = React.useState("");

    const { searchStatus, searchResults, searchError, relationships } = useSemanticSearch({
        searchTerm,
        objectTypes: ["dashboard", "metric"],
        deepSearch: true,
        limit: 10,
        // backend and workspace are optional if provided via context
    });

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
            />

            {searchStatus === "loading" && <div>Loading...</div>}
            {searchStatus === "error" && <div>Error: {searchError}</div>}

            {searchStatus === "success" && (
                <ul>
                    {searchResults.map((item) => (
                        <li key={item.id} onClick={() => handleItemClick(item)}>
                            {item.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
```

### Hook Parameters

| Name        | Type               | Default | Description                                                              |
| ----------- | ------------------ | ------- | ------------------------------------------------------------------------ |
| searchTerm  | string             | -       | The search term to use for semantic search                               |
| objectTypes | GenAIObjectType[]  | -       | A list of object types to search for                                     |
| deepSearch  | boolean            | false   | Enable deep search to find dashboards by their contents                  |
| limit       | number             | -       | Target number of search results to return. See note in Props section     |
| backend     | IAnalyticalBackend | -       | Backend instance. Falls back to BackendProvider context if not specified |
| workspace   | string             | -       | Workspace ID. Falls back to WorkspaceProvider context if not specified   |

### Hook Return Value

The hook returns an object with the following properties:

| Name          | Type                                        | Description                                                                                   |
| ------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| searchStatus  | "idle" \| "loading" \| "error" \| "success" | Current status of the search operation                                                        |
| searchError   | string                                      | Error message if the search failed                                                            |
| searchResults | ISemanticSearchResultItem[]                 | Array of search results                                                                       |
| relationships | ISemanticSearchRelationship[]               | Array of relationships between search results (e.g., dashboard containing a matching insight) |

## Search Result Item Interface

The `ISemanticSearchResultItem` interface represents an item in the search results:

```typescript
interface ISemanticSearchResultItem {
    /**
     * The ID of the item.
     */
    id: string;

    /**
     * The title of the item.
     */
    title: string;

    /**
     * The description of the item.
     */
    description?: string;

    /**
     * The type of the item (e.g., "dashboard", "metric", "insight").
     */
    type: string;

    /**
     * The URL to the item in the GoodData platform.
     */
    link?: string;

    /**
     * Additional metadata about the item.
     */
    meta?: Record<string, any>;
}
```

## Search Relationship Interface

The `ISemanticSearchRelationship` interface represents relationships between items in the search results, such as a dashboard containing a matching visualization:

```typescript
interface ISemanticSearchRelationship {
    /**
     * The ID of the source item.
     */
    sourceId: string;

    /**
     * The type of the source item.
     */
    sourceType: string;

    /**
     * The ID of the target item.
     */
    targetId: string;

    /**
     * The type of the target item.
     */
    targetType: string;

    /**
     * The type of relationship between the source and target.
     * For example, "contains" for a dashboard containing a visualization.
     */
    type: string;
}
```

[theme provider]: ../../learn/apply_theming/
