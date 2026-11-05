---
title: Customize Analytical Designer
description: Hide header actions, make Analytical Designer read-only, filter its catalog, theme it, and replace its loading and error screens and its editor header with slots.
diataxis_type: howto
type: docs
weight: 4
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerConfig"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerSlots"
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesignerSlotComponent"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerEditorHeaderProps"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerVisualizationInfoProps"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerEditorActionsProps"
source_files:
  - src/embedding/analyticalDesignerTypes.ts
  - src/embedding/slots.tsx
  - src/embedding/editorHeaderSlotTypes.ts
related_pages:
  - /docs/analytical-designer/analytical-designer
  - /docs/analytical-designer/handle-analytical-designer-events
  - /docs/integrations/embedding/apply-theming
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

When you finish, Analytical Designer shows only the actions and catalog items your application allows, uses your theme, shows your own loading and error screens, and has the editor header your application needs.

## Hide header actions

List the actions to hide in `config.hiddenActions`. Set `config.isReadOnly` to hide every action that changes the visualization: save, save as, and create new.

```tsx
<AnalyticalDesigner
    insight="<visualization-id>"
    config={{
        hiddenActions: ["export", "saveAs", "openInAnalyticalDesigner"],
        displayedActions: ["cancel"],
    }}
    onEvent={(event) => {
        if (event.type === "insightEditingCancelled") {
            navigateBack();
        }
    }}
/>
```

The **Cancel** action is hidden by default. Show it with `displayedActions: ["cancel"]`, and handle the `insightEditingCancelled` event in `onEvent`.

## Filter the catalog

Show only the catalog items with one of the tags in `config.includeObjectsWithTags`, or hide the items with one of the tags in `config.excludeObjectsWithTags`:

```tsx
<AnalyticalDesigner config={{ includeObjectsWithTags: ["sales"], excludeObjectsWithTags: ["internal"] }} />
```

## Open a visualization from a dashboard

Two flows open a visualization from another context:

- **Edit from a dashboard**: pass `config.sourceDashboard` with the dashboard. The header offers going back to it. Pass an empty string when the dashboard is not saved yet.
- **Explore**: pass `config.sourceInsight` with the visualization. Analytical Designer opens it as an unsaved copy, and saving creates a new visualization.

```tsx
<AnalyticalDesigner insight="<visualization-id>" config={{ sourceDashboard: "<dashboard-id>" }} />
```

## Theme Analytical Designer

Analytical Designer loads and applies the workspace theme. To change that:

- Pass `theme` to apply your theme instead.
- Pass `disableThemeLoading` to apply none.
- Pass `themeModifier` to change the theme before Analytical Designer applies it.

```tsx
<AnalyticalDesigner
    themeModifier={(theme) => ({ ...theme, palette: { ...theme.palette, primary: { base: "#14b2e2" } } })}
/>
```

The theme is read when the component mounts. See [Apply theming](../../integrations/embedding/apply-theming/) for the theme object.

## Replace the loading and error screens

`slots` replaces or wraps the `Loading` and `Error` regions. A slot component gets the default region as `Default` and its props as `defaultProps`, so you can wrap the default or render your own:

```tsx
import {
    AnalyticalDesigner,
    type AnalyticalDesignerSlotComponent,
    type IAnalyticalDesignerErrorProps,
    type IAnalyticalDesignerLoadingProps,
    type IAnalyticalDesignerSlots,
} from "@gooddata/sdk-ui-analytical-designer";

const HostLoading: AnalyticalDesignerSlotComponent<IAnalyticalDesignerLoadingProps> = ({
    Default,
    defaultProps,
}) => (
    <div className="my-loading">
        <p>Starting Analytical Designer…</p>
        <Default {...defaultProps} />
    </div>
);

const HostError: AnalyticalDesignerSlotComponent<IAnalyticalDesignerErrorProps> = ({ defaultProps }) => (
    <div className="my-error">
        {defaultProps.error instanceof Error ? defaultProps.error.message : "Analytical Designer cannot start."}
    </div>
);

// Define the slots outside the component, so they keep their identity between renders.
const slots: IAnalyticalDesignerSlots = { Loading: HostLoading, Error: HostError };

<AnalyticalDesigner insight="<visualization-id>" slots={slots} />;
```

`Error` covers both a failed load and the errors Analytical Designer hits while it starts.

## Customize the editor header

Every part of the editor header is a slot. The regions hold the controls:

```text
EditorHeader
├─ VisualizationInfo: VisualizationTitle, VisualizationDescription, VisualizationAccess
└─ EditorActions: UndoRedo, Clear, Open, Cancel, SaveAs, Save, Embed, Options
```

Each slot can do one of four things:

- **Hide** the part: return `null`.
- **Replace** it: render your own component from the data and callbacks in `defaultProps`.
- **Change** it: render `Default` with changed props, for example another label.
- **Decorate** it: render `Default` next to your own content.

The example below adds a Back button before the visualization name, a banner above the header, its own Open, access and Save controls, relabels Clear and hides Embed:

```tsx
import {
    AnalyticalDesigner,
    type AnalyticalDesignerSlotComponent,
    type IAnalyticalDesignerClearProps,
    type IAnalyticalDesignerEditorHeaderProps,
    type IAnalyticalDesignerOpenProps,
    type IAnalyticalDesignerSaveProps,
    type IAnalyticalDesignerSlots,
    type IAnalyticalDesignerVisualizationAccessProps,
    type IAnalyticalDesignerVisualizationInfoProps,
} from "@gooddata/sdk-ui-analytical-designer";

const Header: AnalyticalDesignerSlotComponent<IAnalyticalDesignerEditorHeaderProps> = ({
    Default,
    defaultProps,
}) => (
    <>
        <MyBanner />
        <Default {...defaultProps} />
    </>
);

const Info: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationInfoProps> = ({
    Default,
    defaultProps,
}) => (
    <>
        <MyBackButton disabled={defaultProps.isNavigationDisabled} onClick={defaultProps.onRequestBack} />
        <Default {...defaultProps} />
    </>
);

const Open: AnalyticalDesignerSlotComponent<IAnalyticalDesignerOpenProps> = ({ defaultProps }) => (
    <MyVisualizationPicker
        workspace={defaultProps.workspace}
        disabled={defaultProps.isDisabled}
        selected={defaultProps.selectedInsightId}
        onPick={defaultProps.onOpenInsight}
    />
);

const Access: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationAccessProps> = ({
    defaultProps,
}) => <MyWorkspaceAccess visualization={defaultProps.insightRef} />;

const Save: AnalyticalDesignerSlotComponent<IAnalyticalDesignerSaveProps> = ({ defaultProps }) => (
    <MyButton disabled={defaultProps.isDisabled} loading={defaultProps.isSaving} onClick={defaultProps.onSave}>
        {defaultProps.label}
    </MyButton>
);

const Clear: AnalyticalDesignerSlotComponent<IAnalyticalDesignerClearProps> = ({ Default, defaultProps }) => (
    <Default {...defaultProps} label="Reset visualization" />
);

// Define the slots outside the component, so they keep their identity and state between renders.
const slots: IAnalyticalDesignerSlots = {
    EditorHeader: Header,
    VisualizationInfo: Info,
    Open,
    VisualizationAccess: Access,
    Save,
    Clear,
    Embed: () => null,
};

<AnalyticalDesigner
    insight="<visualization-id>"
    slots={slots}
    onEvent={(event) => {
        if (event.type === "insightEditingCancelled") {
            navigateToVisualizationList();
        }
    }}
/>;
```

How the slots behave:

- **Regions** get their children already rendered with their slots, for example `visualizationTitle` and `editorActions`. Render each child at most once, and leave one out to hide it. `EditorActions` gets the controls as `items` with stable IDs (`undoRedo`, `clear`, `open`, `cancel`, `saveAs`, `save`, `embed`, `options`). Filter, reorder or add items and pass them to `Default`. Prefix the ID of your own item with `custom:`.
- **Callbacks** in `defaultProps` start the same flows as the built-in controls, and they check again when called. A callback ignores a call that Analytical Designer would refuse, for example saving while it saves. A callback starts an operation; the events in `onEvent` report the result. Changing a label or a disabled state grants no permission.
- **Back**: `onRequestBack` starts the flow that `apiRef.requestCancellation()` starts too. Analytical Designer asks the user to confirm unsaved changes and then emits `insightEditingCancelled`. Navigate in `onEvent`, not in the click handler. Unlike `requestCancellation()`, `onRequestBack` is ignored while the visualization is being saved (`isNavigationDisabled`).
- **Unsaved changes**: `hasUnsavedChanges` is true when the visualization differs from its last saved version, also when it cannot be saved now (for example during a save). Always call `onRequestBack` and let Analytical Designer decide whether to ask; do not skip it when `hasUnsavedChanges` is false.
- **Visibility**: a control that Analytical Designer does not show, because of permissions, `config.hiddenActions` or the mode, does not render its slot. `VisualizationAccess` renders also where the built-in sharing is unavailable, for example in an embedded editor, so that you can render your own access control there. `isDefaultAvailable` tells whether the default shows anything.
- **Undo and redo** are one control. `UndoRedo` gets both callbacks and both disabled states.
- **Options** gets its menu as `items`: actions, section labels and separators. The default drops the sections without actions and the extra separators, so you can filter the items without cleanup.
- **Dialogs**: the embed code dialog and the time zone dialog belong to Analytical Designer. They open for your own controls too, when they call `onEmbedInsight` or the `changeTimezone` item.
- **Layout**: Analytical Designer keeps the control that restores a collapsed catalog outside `EditorHeader`, so hiding the header never strands the catalog. Content you add above or below the header moves the editor down. `defaultProps.layout` tells how the header sits next to the catalog. Custom content must fit the width the editor has; Analytical Designer does not shrink it.

## Forward telemetry

Analytical Designer tracks nothing by default. To get its events, page views, and timings in your telemetry, pass `config.telemetryCallbacks`:

```tsx
<AnalyticalDesigner
    config={{
        telemetryCallbacks: {
            trackEvent: (eventName, data) => analytics.track(eventName, data),
            trackPageView: (page, data) => analytics.page(page, data),
            trackTiming: (variable, label, valueMs) => analytics.timing(variable, label, valueMs),
        },
    }}
/>
```

`telemetryCallbacks` is read when the component mounts.
