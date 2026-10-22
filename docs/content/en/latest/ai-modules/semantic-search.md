---
legacy_path: references/embed_semantic_search
title: Semantic Search
category: AI & Modules
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-semantic-search:SemanticSearch"
  - "@gooddata/sdk-ui-semantic-search:useSemanticSearch"
  - "@gooddata/sdk-ui-semantic-search:FooterButtonAiAssistant"
source_files:
  - src/SemanticSearch.tsx
  - src/hooks/useSemanticSearch.ts
related_pages:
  - /docs/ai-modules/ai-assistant
  - /docs/ai-modules/ai-assistant-layout
  - /docs/ai-modules/analytics-catalog
  - /docs/data-layer/data-model/workspace-catalog
type: docs
description: Embed natural-language search for analytical objects with the SemanticSearch component or the useSemanticSearch hook, and filter results by object type or tag.
weight: 55
section: AI & Modules
aliases:
  - "../references/embed_semantic_search/"
---

GoodData.UI provides a React component for a search box that finds analytical objects by the meaning of a natural-language query. GoodData Cloud calls the same feature Smart Search; see [Use Smart Search](https://www.gooddata.ai/docs/cloud/ai/smart-search/). The `SemanticSearch` component and the `useSemanticSearch` hook are `@beta`; see [API maturity](../../integrations/platform/api-maturity/).

With Semantic Search, you can:

- search for analytical objects in natural language,
- filter the results by object type or by tag,
- turn on deep search to find dashboards by their contents,
- style the search with the [Theme Provider](../../integrations/embedding/apply-theming/).

To hand a search query over to the AI Assistant, see [Hand a Semantic Search query to the assistant](../ai-assistant-layout/#hand-a-semantic-search-query-to-the-assistant).

## Basic usage

The `SemanticSearch` component renders a search input with a dropdown of results.

```tsx
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import { isSemanticSearchResultItem } from "@gooddata/sdk-model";

// Import required styles
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

const App = () => {
    return (
        <div style={{ width: 300 }}>
            {/* Wrap the search UI in a container of desired size */}
            <SemanticSearch
                // Handle item selection. With deep search enabled, the user can also
                // select a nested relationship (for example, a visualization inside a dashboard).
                onSelect={(item) => {
                    const title = isSemanticSearchResultItem(item) ? item.title : item.targetObjectTitle;
                    console.log(`Selected item: ${title}`);
                    // Handle the selected item, for example navigate to the dashboard
                }}
                // Optional: Handle search errors
                onError={(errorMessage, detail) => {
                    console.error(`Search error: ${errorMessage}`, detail?.reason);
                }}
                // Optional: Filter by object types
                objectTypes={["dashboard", "metric"]}
                // Optional: Enable deep search
                deepSearch={true}
                // Optional: Set results limit
                limit={10}
                // Optional: Custom placeholder
                placeholder="Search for dashboards, metrics..."
                // Optional: Exclude objects with specific tags
                excludeTags={["hidden"]}
                // Optional: Custom footer in search results
                renderFooter={(props, { closeSearch }) => {
                    return null;
                }}
            />
        </div>
    );
};
```

{{% alert color="info" title="Note about result limits" %}}
The `limit` parameter specifies a target number of results, but the actual number of returned items may vary:

- Fewer items may be returned if there aren't enough semantically relevant matches for the search term
- More items may be returned when using `deepSearch=true`, as both matching items (like visualizations) and their containers (like dashboards) will be included in the results
- The relationships between items are provided separately in the `relationships` array
{{% /alert %}}

## Use the hook

For your own search UI, use the `useSemanticSearch` hook:

```tsx
import { useState } from "react";
import { useSemanticSearch } from "@gooddata/sdk-ui-semantic-search";

const MyCustomSearchComponent = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const { searchStatus, searchResults, searchError, relationships } = useSemanticSearch({
        searchTerm,
        objectTypes: ["dashboard", "metric"],
        deepSearch: true,
        limit: 10,
        excludeTags: ["hidden"],
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
            {searchStatus === "error" && <div>Error: {searchError?.message}</div>}

            {searchStatus === "success" && (
                <ul>
                    {searchResults.map((item) => (
                        <li key={item.id} onClick={() => console.log(`Selected item: ${item.title}`)}>
                            {item.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
```

The hook sends a request whenever `searchTerm` changes and cancels the previous request if it is still running. An empty `searchTerm` resets the result to the idle state.

{{% alert color="info" title="Different deepSearch defaults" %}}
`deepSearch` defaults to `true` in the `useSemanticSearch` hook but to `false` in the `SemanticSearch` component. Set it explicitly if you switch between the two.
{{% /alert %}}

### Hook parameters

| Name                     | Type                       | Default | Description                                                                                                 |
| ------------------------ | -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| searchTerm               | string                     | -       | The search term to use for semantic search                                                                  |
| objectTypes              | GenAIObjectType[]          | -       | A list of object types to search for                                                                        |
| deepSearch               | boolean                    | true    | Enable deep search to find dashboards by their contents. |
| limit                    | number                     | -       | Target number of search results to return. See the note about result limits                                        |
| backend                  | IAnalyticalBackend         | -       | Backend instance. Falls back to `BackendProvider` context if not specified                                  |
| workspace                | string                     | -       | Workspace ID. Falls back to `WorkspaceProvider` context if not specified                                    |
| allowedRelationshipTypes | IAllowedRelationshipType[] | -       | Restricts relationships (and the results they link) to the listed source/target type pairs                  |
| includeTags              | string[]                   | -       | A list of tags the returned objects must have                                                               |
| excludeTags              | string[]                   | -       | A list of tags the returned objects must not have                                                           |

### Hook return value

The hook returns a `SemanticSearchInputResult` object with the following properties:

| Name          | Type                                                | Description                                                                                          |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| searchStatus  | "idle" \| "loading" \| "error" \| "success"         | Current status of the search operation                                                               |
| searchError   | { message: string; detail?: ISemanticSearchError }  | Error details if the search failed. Also set on success when the backend returns reasoning or an error |
| searchResults | ISemanticSearchResultItem[]                         | Array of search results                                                                              |
| relationships | ISemanticSearchRelationship[]                       | Array of relationships between search results (for example, a dashboard containing a matching visualization)  |

## Search result types

### ISemanticSearchResultItem

The `ISemanticSearchResultItem` interface from `@gooddata/sdk-model` represents an item in the search results:

```ts
interface ISemanticSearchResultItem {
    /** The type of the found object (for example "dashboard", "metric", or "visualization"). */
    type: GenAIObjectType;
    /** The identifier of the found object. */
    id: string;
    /** The identifier of the workspace where the object is located. */
    workspaceId: string;
    /** The title of the found object. */
    title: string;
    /** The description of the found object. */
    description?: string;
    /** The tags of the found object. */
    tags?: string[];
    /** The creation date of the found object. */
    createdAt?: string;
    /** The last modification date of the found object. */
    modifiedAt?: string;
    /** The chart type of visualization objects. */
    visualizationUrl?: string;
    /** Overall similarity score; larger is more similar. */
    score?: number;
    /** Title score of the found item. */
    scoreTitle?: number;
    /** Description score of the found item. */
    scoreDescriptor?: number;
    /** 1000 if the found item is an exact match, 0 otherwise. */
    scoreExactMatch?: number;
    /** Certification status and optional message for the found object. */
    certification?: ISemanticSearchCertification;
}
```

### ISemanticSearchRelationship

The `ISemanticSearchRelationship` interface from `@gooddata/sdk-model` represents relationships between items in the search results, such as a dashboard containing a matching visualization:

```ts
interface ISemanticSearchRelationship {
    /** Workspace id of the source object. */
    sourceWorkspaceId: string;
    /** Object id of the source. */
    sourceObjectId: string;
    /** Type of the source object. */
    sourceObjectType: GenAIObjectType;
    /** Title of the source object. */
    sourceObjectTitle: string;
    /** Workspace id of the target object. */
    targetWorkspaceId: string;
    /** Object id of the target. */
    targetObjectId: string;
    /** Type of the target object. */
    targetObjectType: GenAIObjectType;
    /** Title of the target object. */
    targetObjectTitle: string;
}
```

Use the `isSemanticSearchResultItem` and `isSemanticSearchRelationship` type guards from `@gooddata/sdk-model` to tell the two apart in an `onSelect` handler.

## Props

`SemanticSearchProps` is a type alias, which the generated Props tables don't support yet, so its props are listed by hand.

| Name         | Type                                                                                                                 | Default | Description                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| locale       | string                                                                                                               | -       | Specifies the locale for internationalization. Falls back to context if not specified                                                |
| backend      | IAnalyticalBackend                                                                                                   | -       | Backend instance. Falls back to `BackendProvider` context if not specified                                                           |
| workspace    | string                                                                                                               | -       | Workspace ID. Falls back to `WorkspaceProvider` context if not specified                                                             |
| onSelect     | (item: ISemanticSearchResultItem \| ISemanticSearchRelationship) => void                                             | -       | Required callback called when the user selects an item. Nested deep-search results arrive as an `ISemanticSearchRelationship`        |
| onError      | (errorMessage: string, detail?: ISemanticSearchError) => void                                                        | -       | Optional callback called when an error occurs during the search                                                                      |
| className    | string                                                                                                               | -       | Additional CSS class for the component                                                                                               |
| objectTypes  | GenAIObjectType[]                                                                                                    | -       | A list of object types to search for (for example "dashboard", "metric", or "visualization")                                                  |
| deepSearch   | boolean                                                                                                              | false   | Enable deep search to find dashboards by their contents                                                                              |
| limit        | number                                                                                                               | 10      | Target number of search results to return. See note below about actual result count                                                  |
| threshold    | number                                                                                                               | 0.5     | Minimum similarity score a result must reach to be shown                                                                             |
| placeholder  | string                                                                                                               | -       | Placeholder text for the search input                                                                                                |
| includeTags  | string[]                                                                                                             | -       | A list of tags the returned objects must have                                                                                        |
| excludeTags  | string[]                                                                                                             | -       | A list of tags the returned objects must not have                                                                                    |
| renderFooter | (props: SemanticSearchProps & { status: "idle" \| "loading" \| "error" \| "success"; value: string }, handlers: { closeSearch: () => void }) => ReactNode | -       | Optional function to render a custom footer in the search results. `value` is the current search term                                |
