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

- Embed UI for semantic search functionality.
- Search for analytical objects using natural language.
- Filter search results by object types.
- Enable deep search to find dashboards by their contents.
- Theming is supported out of the box through [Theme Provider].

## Basic integration example

`SemanticSearch` component renders a search input field with a dropdown for displaying search results.

```tsx
import * as React from "react";
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";

// Import required styles
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

const App = () => {
    return (
        <div style={{ width: 300 }}>
            {/* Wrap the search UI in a container of desired size */}
            <SemanticSearch
                // Handle item selection
                onSelect={(item) => {
                    console.log(`Selected item: ${item.title}`);
                    // Handle the selected item, e.g., navigate to the dashboard
                }}
                // Optional: Handle search errors
                onError={(errorMessage) => {
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
                // Optional: Custom footer in search results
                renderFooter={(props, { closeSearch }) => {
                    return null;
                }}
            />
        </div>
    );
};
```

### Props

| Name         | Type                                                                                        | Default | Description                                                                             |
| ------------ | ------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| locale       | string                                                                                      | -       | Specifies the locale for internationalization. Falls back to context if not specified   |
| backend      | IAnalyticalBackend                                                                          | -       | Backend instance. Falls back to BackendProvider context if not specified                |
| workspace    | string                                                                                      | -       | Workspace ID. Falls back to WorkspaceProvider context if not specified                  |
| onSelect     | (item: ISemanticSearchResultItem) => void                                                   | -       | Required callback function called when the user selects an item from the search results |
| onError      | (errorMessage: string) => void                                                              | -       | Optional callback function called when an error occurs during the search                |
| className    | string                                                                                      | -       | Additional CSS class for the component                                                  |
| objectTypes  | GenAIObjectType[]                                                                           | -       | A list of object types to search for (e.g., "dashboard", "metric", "insight")           |
| deepSearch   | boolean                                                                                     | false   | Enable deep search to find dashboards by their contents                                 |
| limit        | number                                                                                      | 10      | Target number of search results to return. See note below about actual result count     |
| placeholder  | string                                                                                      | -       | Placeholder text for the search input                                                   |
| renderFooter | (props: SemanticSearchFooterProps, context: SemanticSearchFooterContext) => React.ReactNode | -       | Optional function to render a custom footer in the search results                       |

> **Note about result limits:** The `limit` parameter specifies a target number of results, but the actual number of returned items may vary:
>
> - Fewer items may be returned if there aren't enough semantically relevant matches for the search term
> - More items may be returned when using `deepSearch=true`, as both matching items (like visualizations) and their containers (like dashboards) will be included in the results
> - The relationships between items are provided separately in the `relationships` array

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

## Connecting Semantic Search with AI Assistant

GoodData.UI allows you to seamlessly integrate the Semantic Search component with the AI Assistant, enabling users to transition from searching for analytical objects to having a conversation with the AI about their search query.

### Integration Overview

The integration works by:

1. Using the `FooterButtonAiAssistant` component in the Semantic Search footer
2. Passing the search query from Semantic Search to the AI Assistant when the user clicks the button
3. Managing the AI Assistant chat thread using the dispatcher pattern

### Required Components

- `SemanticSearch` from `@gooddata/sdk-ui-semantic-search`
- `FooterButtonAiAssistant` from `@gooddata/sdk-ui-semantic-search`
- `GenAIAssistant` from `@gooddata/sdk-ui-gen-ai`
- Chat actions from `@gooddata/sdk-ui-gen-ai`

### Implementation Example

```typescript jsx
import React, { useCallback, useEffect, useState } from "react";
import { SemanticSearch, FooterButtonAiAssistant } from "@gooddata/sdk-ui-semantic-search";
import {
    GenAIAssistant,
    clearThreadAction,
    newMessageAction,
    makeUserMessage,
    makeTextContents,
} from "@gooddata/sdk-ui-gen-ai";

type ChatDispatcher = (action: unknown) => void;

const MyCustomSearchComponentWithAiAssistant = () => {
    const [chatDispatcher, setDispatcher] = useState<ChatDispatcher | null>(null);
    const [askedQuestion, setAskedQuestion] = useState("");
    const onDispatcher = useCallback(
        (dispatcher: ChatDispatcher) => {
            setDispatcher(() => dispatcher);
        },
        [setDispatcher],
    );

    useEffect(() => {
        if (!chatDispatcher || !askedQuestion) {
            return;
        }

        chatDispatcher(clearThreadAction());
        chatDispatcher(newMessageAction(makeUserMessage([makeTextContents(askedQuestion, [])])));
    }, [chatDispatcher, askedQuestion]);

    return (
        <>
            <SemanticSearch
                onSelect={(item) => {
                    console.log(`Selected item: ${item.title}`);
                }}
                objectTypes={["dashboard", "visualization", "metric"]}
                renderFooter={({ value }, { closeSearch }) => (
                    <FooterButtonAiAssistant
                        onClick={() => {
                            // You can extend the search query with additional context.
                            setAskedQuestion(`Build new visualization based on: ${value}`);
                            closeSearch();
                        }}
                    />
                )}
            />
            <GenAIAssistant onDispatcher={onDispatcher} />
        </>
    );
};
```

### User Experience Flow

1. User enters a search query in the Semantic Search component
2. User can either:
    - Select a search result using the standard `onSelect` handler
    - Click the "Ask AI Assistant" button to transition to a conversation
3. When the AI Assistant button is clicked:
    - The search query is captured
    - The search dropdown closes
    - The query is automatically sent to the AI Assistant as a user message
    - The AI Assistant responds to the query

This integration provides a seamless transition from searching for analytical objects to having a conversation with the AI Assistant about the same topic.

[theme provider]: ../../learn/apply_theming/
