---
title: Handle Analytical Designer events
description: React to what the user does in Analytical Designer with the typed onEvent callback, and drive it with commands through apiRef.
diataxis_type: howto
type: docs
weight: 3
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerApi"
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesignerEvent"
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesignerEventType"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerEventDataMap"
source_files:
  - src/embedding/analyticalDesignerTypes.ts
  - src/embedding/analyticalDesignerConfig.ts
  - src/postMessageApi/outgoing/post_event_helper.ts
related_pages:
  - /docs/analytical-designer/analytical-designer
  - /docs/analytical-designer/embed-analytical-designer
  - /docs/analytical-designer/customize-analytical-designer
  - /docs/dashboard-plugins/dashboard-events
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

When you finish, your application reacts to what the user does in Analytical Designer, such as saving or cancelling the editing, and sends Analytical Designer commands, such as clearing the visualization or applying your filters.

The event types and payloads follow the `@gooddata/sdk-embedding` contract of Analytical Designer embedded in an iframe, so code written for the iframe maps to the component. The only exception is `drill`: the component gives the `IDrillEvent` of `@gooddata/sdk-ui`.

## Handle the events

Pass `onEvent`. It gets every event that Analytical Designer emits. Check `event.type`, and TypeScript narrows `event.data` to the payload of that event:

```tsx
import { AnalyticalDesigner, type AnalyticalDesignerEvent } from "@gooddata/sdk-ui-analytical-designer";

function handleEvent(event: AnalyticalDesignerEvent) {
    switch (event.type) {
        case "insightOpened":
            console.log("opened", event.data.insight, event.data.availableCommands);
            break;
        case "visualizationSaved":
            console.log("saved", event.data.insight);
            break;
        case "insightEditingCancelled":
            navigateBack();
            break;
        case "filterContextChanged":
            console.log("filters", event.data.filters);
            break;
    }
}

<AnalyticalDesigner
    insight="<visualization-id>"
    onEvent={handleEvent}
    onError={(error) => console.error("Analytical Designer cannot start", error)}
/>;
```

| Event type | Emitted when |
| --- | --- |
| `insightOpened` | Analytical Designer opens a visualization. `data` has its metadata, its definition, and the commands it accepts. |
| `insightChanged` | The visualization definition changes and its execution starts. |
| `insightRendered` | The visualization renders. |
| `visualizationSaved` | The user or a save command saves the visualization. |
| `insightEditingCancelled` | The user cancels the editing. |
| `catalogLoaded` | The catalog loads. |
| `filterContextChanged` | The user changes a filter of the visualization. |
| `metricsChanged` | The user saves or deletes a metric. |
| `attributeHierarchyModified` | The user creates, changes, or deletes an attribute hierarchy. |
| `drill` | The user drills in the visualization. `data` is the `IDrillEvent` of `@gooddata/sdk-ui`. |
| `availableCommands` | The commands that Analytical Designer accepts change. |
| `listeningForDrillableItems` | Analytical Designer accepts the `drillableItems` command. |
| `apiTokenIsAboutToExpire` | The API token of Analytical Designer expires soon. |

The results of commands are events too. See [Match a command to its result](#match-a-command-to-its-result).

`onError` is not an event. Analytical Designer calls it when it cannot start.

`onEvent` is read on every event, so a new function in each render is fine.

To type a function for one event, give the event type to `AnalyticalDesignerEvent`, for example `AnalyticalDesignerEvent<"visualizationSaved">`. `IAnalyticalDesignerEventDataMap` lists the payload of each event type.

## Send commands

Create a ref of `IAnalyticalDesignerApi` and pass it as `apiRef`:

```tsx
import { useRef } from "react";

import {
    AnalyticalDesigner,
    type IAnalyticalDesignerApi,
} from "@gooddata/sdk-ui-analytical-designer";

export function Editor() {
    const apiRef = useRef<IAnalyticalDesignerApi>(null);

    const applyRegionFilter = () =>
        apiRef.current?.setFilterContext(
            {
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: { identifier: "<label-id>" },
                            in: ["<attribute-value>"],
                        },
                    },
                ],
            },
            "region-filter",
        );

    return (
        <>
            <button onClick={applyRegionFilter}>Filter by region</button>
            <button onClick={() => apiRef.current?.clear()}>Clear</button>
            <AnalyticalDesigner
                insight="<visualization-id>"
                apiRef={apiRef}
                onEvent={(event) => {
                    if (event.type === "setFilterContextFinished") {
                        console.log("applied", event.contextId);
                    } else if (event.type === "appCommandFailed") {
                        console.error("failed", event.contextId, event.data.errorMessage);
                    }
                }}
            />
        </>
    );
}
```

| Method | What it does |
| --- | --- |
| `clear` | Clears the visualization. |
| `requestCancellation` | Asks Analytical Designer to cancel the editing. With unsaved changes, it asks the user first. When the editing is cancelled, Analytical Designer emits `insightEditingCancelled`. |
| `setFilterContext` | Merges your filters into the filters of the open visualization. |
| `sendCommand` | Sends any command of the `@gooddata/sdk-embedding` contract, for example undo, redo, save, or export. |

Commands you send before Analytical Designer mounts run when it does.

### Match a command to its result

Each command emits an event when it finishes: `clearFinished`, `clearInsightFinished`, `undoFinished`, `redoFinished`, `exportInsightFinished`, `setFilterContextFinished`, `removeFilterContextFinished`, or `visualizationSaved`. A command that fails emits `appCommandFailed`. These events have the `contextId` of the command. Give each command a `contextId` to know which one finished or failed:

```tsx
import { GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

apiRef.current?.sendCommand({
    gdc: {
        product: GdcProductName.ANALYTICAL_DESIGNER,
        event: { name: GdcAdCommandType.Undo, contextId: "undo-1" },
    },
});
```

## Keep a shared cache fresh

When your application shares a caching backend with Analytical Designer, pass `cacheReset`. Analytical Designer calls it when the user refreshes the catalog or edits a metric, before it reloads the data. Use the `metricsChanged` event to refresh the rest of your application after a metric changes. See [Set up the backend](../embed-analytical-designer/#set-up-the-backend).
