---
title: Analytics Catalog
linkTitle: Analytics Catalog
copyright: (C) 2025-2026 GoodData Corporation
id: embed_analytics_catalog
no_list: true
weight: 72
---

GoodData.UI provides React components to browse and manage analytics catalog items, including dashboards, insights, measures, attributes, and facts.

## Analytics Catalog Component Features

- Browse and search all workspace analytics objects.
- Filter objects by type (dashboards, insights, etc.).
- Detailed view for each catalog item with metadata and actions.
- Customizable navigation and item opening behavior.
- Integrated creation of new analytics objects.
- Theming is supported out of the box through [Theme Provider].

## Basic integration example

The `AnalyticsCatalog` component is the main entry point for embedding the full catalog experience.

```tsx
import { AnalyticsCatalog } from "@gooddata/sdk-ui-catalog";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

// Import required styles
import "@gooddata/sdk-ui-catalog/styles/css/main.css";

const App = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="workspace-id">
                <div style={{ height: 600 }}>
                    <AnalyticsCatalog
                        onCatalogItemOpenClick={(e, event) => {
                            console.log("Opening item:", event.id, event.type);
                        }}
                        onCreateObject={(type) => {
                            console.log("Creating new:", type);
                        }}
                    />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
```

### Props

| Name                      | Type                                             | Default | Description                                                                               |
| ------------------------- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `backend`                 | IAnalyticalBackend                               | -       | Analytical backend instance. Falls back to `BackendProvider` context if not specified.    |
| `workspace`               | string                                           | -       | Workspace ID. Falls back to `WorkspaceProvider` context if not specified.                 |
| `locale`                  | string                                           | -       | Specifies the locale for internationalization.                                            |
| `openCatalogItemRef`      | ICatalogItemRef                                  | -       | Reference to the catalog item to open on initial render.                                  |
| `onCatalogItemOpenClick`  | (e: MouseEvent, event: OpenHandlerEvent) => void | -       | Handler for opening catalog items.                                                        |
| `onCatalogItemNavigation` | (e: MouseEvent, ref: ICatalogItemRef) => void    | -       | Handler for navigating to a catalog item. Consumers can use this to handle route changes. |
| `onCatalogDetailOpened`   | (ref: ICatalogItemRef) => void                   | -       | Handler called when the catalog item detail view is opened.                               |
| `onCatalogDetailClosed`   | () => void                                       | -       | Handler called when the catalog item detail view is closed.                               |
| `onCreateObject`          | (type: CatalogCreateObjectType) => void          | -       | Handler for creating a new object from the catalog header.                                |

## Catalog Detail Components

If you need more granular control, you can use the detail components separately.

### AnalyticsCatalogDetail

A ready-to-use overlay/modal that displays details for a specific catalog item.

```tsx
import { AnalyticsCatalogDetail } from "@gooddata/sdk-ui-catalog";

// Import required styles
import "@gooddata/sdk-ui-catalog/styles/css/detail.css";

const DetailOverlay = ({ objectId, objectType, isOpen, onClose }) => {
    return (
        <AnalyticsCatalogDetail objectId={objectId} objectType={objectType} open={isOpen} onClose={onClose} />
    );
};
```

#### Props

| Name         | Type               | Default | Description                                                                            |
| ------------ | ------------------ | ------- | -------------------------------------------------------------------------------------- |
| `objectId`   | string             | -       | An object id of the catalog item.                                                      |
| `objectType` | ObjectType         | -       | An object type of the catalog item.                                                    |
| `open`       | boolean            | -       | Whether the detail overlay is open.                                                    |
| `onClose`    | () => void         | -       | Handler called when the detail view is closed.                                         |
| `backend`    | IAnalyticalBackend | -       | Analytical backend instance. Falls back to `BackendProvider` context if not specified. |
| `workspace`  | string             | -       | Workspace ID. Falls back to `WorkspaceProvider` context if not specified.              |
| `locale`     | string             | -       | Specifies the locale for internationalization.                                         |

### AnalyticsCatalogDetailContent

The content part of the detail view, which you can embed into your own layout or side panel.

```tsx
import { AnalyticsCatalogDetailContent } from "@gooddata/sdk-ui-catalog";

// Import required styles
import "@gooddata/sdk-ui-catalog/styles/css/detail.css";

const SidePanelContent = ({ objectId, objectType }) => {
    return <AnalyticsCatalogDetailContent objectId={objectId} objectType={objectType} />;
};
```

#### Props

| Name          | Type                                             | Default | Description                                                                            |
| ------------- | ------------------------------------------------ | ------- | -------------------------------------------------------------------------------------- |
| `objectId`    | string                                           | -       | An object id of the catalog item.                                                      |
| `objectType`  | ObjectType                                       | -       | An object type of the catalog item.                                                    |
| `backend`     | IAnalyticalBackend                               | -       | Analytical backend instance. Falls back to `BackendProvider` context if not specified. |
| `workspace`   | string                                           | -       | Workspace ID. Falls back to `WorkspaceProvider` context if not specified.              |
| `locale`      | string                                           | -       | Specifies the locale for internationalization.                                         |
| `onOpenClick` | (e: MouseEvent, event: OpenHandlerEvent) => void | -       | Handler for opening catalog items.                                                     |

## Analytics Catalog Filter

The `AnalyticsCatalogFilter` component is a reusable UI element for filtering lists of items with support for search and multi-selection.

```tsx
import { AnalyticsCatalogFilter } from "@gooddata/sdk-ui-catalog";

const MyFilter = () => {
    const [selection, setSelection] = useState([]);
    const [isInverted, setIsInverted] = useState(false);

    return (
        <AnalyticsCatalogFilter
            label="My Filter"
            options={["Option A", "Option B", "Option C"]}
            selection={selection}
            isSelectionInverted={isInverted}
            onSelectionChange={(newSelection, inverted) => {
                setSelection(newSelection);
                setIsInverted(inverted);
            }}
        />
    );
};
```

### Props

| Name                  | Type                                          | Default | Description                                                          |
| --------------------- | --------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `dataTestId`          | string                                        | -       | Test id applied to the root element for automation.                  |
| `label`               | string                                        | -       | Label shown on the trigger button and header.                        |
| `options`             | T[]                                           | -       | All selectable options.                                              |
| `selection`           | T[]                                           | -       | Currently selected options (empty means none when not inverted).     |
| `isSelectionInverted` | boolean                                       | -       | Whether the selection is inverted.                                   |
| `onSelectionChange`   | (selection: T[], isInverted: boolean) => void | -       | Called when selection changes and user confirms.                     |
| `getItemKey`          | (item: T) => string                           | -       | Derives unique key for option items. Defaults to string coercion.    |
| `getItemTitle`        | (item: T) => string                           | -       | Derives display title for option items. Defaults to string coercion. |
| `noDataMessage`       | ReactNode                                     | -       | Message rendered when there are no items to display.                 |
| `statusBar`           | ReactNode                                     | -       | Optional status bar content rendered under the list.                 |
| `actions`             | ReactNode                                     | -       | Optional custom action buttons replacing default Apply/Cancel.       |

[theme provider]: ../../learn/apply_theming/
