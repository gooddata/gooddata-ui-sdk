---
title: Customize the Alert and Scheduled Email Dialogs
sidebar_label: Customize the Alert and Scheduled Email Dialogs
copyright: (C) 2007-2026 GoodData Corporation
id: automation_dialogs_customization
---

Dashboards can create, edit, and manage two kinds of automations: **alerts**, which notify a recipient when a metric
crosses a threshold, and **scheduled emails**, which export a dashboard or widget on a recurring schedule. Both are
configured through modal dialogs that the Dashboard component opens on demand: a create/edit dialog for each, and a
management dialog that lists the alerts or scheduled emails already set up for the current dashboard or widget. This
guide covers customizing those four dialogs — referred to collectively below as the **automation dialogs**.

## What you can customize

The Dashboard component exposes four independent levers, from coarsest to finest:

1. [**Replace a dialog wholesale**](#replace-a-dialog-wholesale) — swap in your own component for the alert dialog,
   the scheduled-email dialog, or either one's management dialog.
2. [**Override one region with a slot**](#override-one-region-with-a-slot) — keep the default dialog's chrome and
   behavior, but wrap or replace one region of it (the header, the filters, and so on).
3. [**Decorate the data a dialog reads**](#decorate-the-data-a-dialog-reads) — leave the rendering alone and adjust
   the data (or the callbacks) a dialog is seeded with.
4. [**Compose your own dialog from the shell and blocks**](#compose-your-own-dialog-from-the-shell-and-blocks) —
   keep the standard modal chrome but arrange the body's fields yourself.

The [management dialogs](#customize-the-alert-and-scheduled-email-management-dialogs) support only the first and the third
lever — there is no slot or block-level composition surface for them.

**NOTE:** Follow the [API maturity](../../../architecture/architecture_overview/api_maturity/) annotations on every
symbol mentioned in this guide. The `Dashboard` props that wire in a replacement or a decorator — the four in the
table under [Replace a dialog wholesale](#replace-a-dialog-wholesale) and the five in the table under
[Decorate the data a dialog reads](#decorate-the-data-a-dialog-reads) — are all `@alpha`: they may change in a
future release outside of SemVer. The contracts you implement against them — from the component prop types to the
state accessor hooks — are `@beta`, except the management dialogs' own context values
(`IAlertingManagementDialogContextValue`, `IScheduledEmailManagementDialogContextValue`), which are `@alpha` too.

## Replace a dialog wholesale

Four `Dashboard` props each take a component type that replaces one dialog outright:

| Prop                                      | Type                                            | Replaces                               |
| :---------------------------------------- | :---------------------------------------------- | :------------------------------------- |
| `AlertingDialogComponent`                 | `CustomAlertingDialogComponent`                 | the alert create/edit dialog           |
| `AlertingManagementDialogComponent`       | `CustomAlertingManagementDialogComponent`       | the alert management dialog            |
| `ScheduledEmailDialogComponent`           | `CustomScheduledEmailDialogComponent`           | the scheduled-email create/edit dialog |
| `ScheduledEmailManagementDialogComponent` | `CustomScheduledEmailManagementDialogComponent` | the scheduled-email management dialog  |

Whatever you render there is mounted inside the same context providers as the default dialog, so it can read the
[state accessors](#compose-your-own-dialog-from-the-shell-and-blocks) below instead of relying on props. The props
each component receives still carry the dialogs' lifecycle callbacks:

- the create/edit dialog props (`IAlertingDialogProps`, `IScheduledEmailDialogProps`) extend
  `IAutomationDialogCallbacks` — the `onCreate*`/`onUpdate*`/`onDelete*` success and error pairs, plus `onCancel`;
- the management dialog props (`IAlertingManagementDialogProps`, `IScheduledEmailManagementDialogProps`) extend
  `IAutomationManagementDialogCallbacks` — `onAdd`, `onEdit`, and `onClose`.

Their data-carrying members (`alertToEdit`, `insight`, and the rest) are deprecated and no longer populated — read
the same data from the dialog's own context instead (see
[Decorate the data a dialog reads](#decorate-the-data-a-dialog-reads)).

```tsx
import { Dashboard, type CustomAlertingDialogComponent } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const MyAlertingDialog: CustomAlertingDialogComponent = (props) => {
    return <MyOwnAlertDialog onCancel={props.onCancel} onCreateSuccess={props.onCreateSuccess} />;
};

const dashboardRef = idRef("<dashboard-identifier>");

const EmbeddedReactDashboard = () => (
    <Dashboard dashboard={dashboardRef} AlertingDialogComponent={MyAlertingDialog} />
);
```

## Override one region with a slot

The default dialogs — `DefaultAlertingDialog` and `DefaultScheduledEmailDialog` — accept a `slots` prop
(`IAlertingDialogSlots` / `IScheduledEmailDialogSlots`) that lets you wrap or replace one region without touching
the rest of the dialog:

- Alerting: `Header`, `Filters`, `Destination`, `Recipients`, `ActionBar`.
- Scheduled email: `Header`, `Filters`, `Timezone`, `Destination`, `Recipients`, `ActionBar`.

Each slot component receives `{ Default, defaultProps }` — the `ISlotProps` shape exported by `@gooddata/sdk-ui-kit`.
Render `<Default {...defaultProps} />` inside your own markup to wrap the region,
or render your own content instead to replace it. A slot component needs a stable reference identity: define it at
module scope (or memoize it) — an inline definition remounts the region on every render, losing focus and any
transient state in it. `topContent` and `bottomContent` on the same props inject content above or below the whole
form without targeting a specific region.

Not every slot always renders:

- the alert dialog's `Destination` appears only when more than one notification channel is available;
- the scheduled-email dialog's `Filters` renders only on the Filters tab;
- its `Destination` and `Recipients` render only on the General tab.

See `IAlertingDialogSlots` and `IScheduledEmailDialogSlots` for the exact conditions of each region.

```tsx
import {
    Dashboard,
    DefaultAlertingDialog,
    type AlertingDialogHeaderDefaultProps,
    type IAlertingDialogProps,
} from "@gooddata/sdk-ui-dashboard";
import { type ISlotProps } from "@gooddata/sdk-ui-kit";

function HeaderWithBanner({ Default, defaultProps }: ISlotProps<AlertingDialogHeaderDefaultProps>) {
    return (
        <>
            <WarningBanner>Alerts may take up to 5 minutes to trigger.</WarningBanner>
            <Default {...defaultProps} />
        </>
    );
}

function CustomAlertingDialog(props: IAlertingDialogProps) {
    return <DefaultAlertingDialog {...props} slots={{ Header: HeaderWithBanner }} />;
}

<Dashboard dashboard={dashboardRef} AlertingDialogComponent={CustomAlertingDialog} />;
```

## Decorate the data a dialog reads

Five props let you adjust the data an automation dialog is seeded with, without touching how it renders. Each
mounts a component that reads the current context value, decorates it, and re-provides it to everything below:

| Prop                                                      | Reads with                                   | Re-provides with                                |
| :-------------------------------------------------------- | :------------------------------------------- | :---------------------------------------------- |
| `AlertingDialogContextDecoratorComponent`                 | `useAlertingDialogContext()`                 | `AlertingDialogContextProvider`                 |
| `AlertingManagementDialogContextDecoratorComponent`       | `useAlertingManagementDialogContext()`       | `AlertingManagementDialogContextProvider`       |
| `ScheduledEmailDialogContextDecoratorComponent`           | `useScheduledEmailDialogContext()`           | `ScheduledEmailDialogContextProvider`           |
| `ScheduledEmailManagementDialogContextDecoratorComponent` | `useScheduledEmailManagementDialogContext()` | `ScheduledEmailManagementDialogContextProvider` |
| `AutomationsContextDecoratorComponent`                    | `useAutomationsContext()`                    | `AutomationsContextProvider`                    |

The first four each decorate one dialog; `AutomationsContextDecoratorComponent` decorates the context shared by all
of them and is mounted once per dialog tree.

The contract, stated on each `Custom*ContextDecoratorComponent` type:

- **Change the data, not what it means.** Every member keeps its documented meaning, and the dialog does not check
  the decorated value, so overriding a member makes you responsible for everything that reads it.
- **Spread the value you read** (`{ ...ctx, member }`) so the untouched members pass through, and wrap functions
  instead of replacing them outright.
- **Leave `isLoading` alone on the create/edit dialogs** — their state model defers seeding the draft until it turns
  false, and an overridden value corrupts that seed.
- **Define the decorator outside render**, or the dialog remounts (and, on the create/edit dialogs, reseeds) on
  every parent render.

```tsx
import {
    Dashboard,
    useAlertingDialogContext,
    AlertingDialogContextProvider,
    type CustomAlertingDialogContextDecoratorComponent,
} from "@gooddata/sdk-ui-dashboard";
import { useMemo, type ReactNode } from "react";

const InsightDecorator: CustomAlertingDialogContextDecoratorComponent = ({
    children,
}: {
    children?: ReactNode;
}) => {
    const ctx = useAlertingDialogContext();
    const insight = useMyDecoratedInsight(ctx.insight);
    const decorated = useMemo(() => ({ ...ctx, insight }), [ctx, insight]);
    return <AlertingDialogContextProvider value={decorated}>{children}</AlertingDialogContextProvider>;
};

<Dashboard dashboard={dashboardRef} AlertingDialogContextDecoratorComponent={InsightDecorator} />;
```

## Compose your own dialog from the shell and blocks

For full control over the arrangement of an alert or scheduled-email dialog's body while keeping the standard modal
chrome, render the dialog's shell — `AlertingDialogShell` or `ScheduledEmailDialogShell` — inside an
`AlertingDialogComponent` / `ScheduledEmailDialogComponent` replacement. The shell renders:

- the modal overlay,
- the header row and the action bar,
- the body's warning and validation messages,
- the stale-filters confirmation step, and
- the delete confirmation.

Your content goes into its scrollable body through `children`, with `topContent` and `bottomContent` above and below
it. While `useAlertingDialogContext().isLoading` (or `useScheduledEmailDialogContext().isLoading`) is true, the shell
renders its own loading skeleton instead of `children` — none of the state accessors below are available yet, so
gate on that flag before calling them.

The shell does not own the submit path — build it yourself and pass the result into the shell's `onSubmit` and
`isSaving` props:

- alerting: `useAlertSubmit`;
- scheduled email: `useSaveScheduledEmailToBackend`, plus `useScheduledEmailSubmitOnEnter` for the Enter key and the
  shell's `savingErrorMessage` prop.

Create the hook instance only once loading has finished for the first time — it throws before then.

```tsx
import {
    AlertingDialogShell,
    AlertingDialogFormFieldGroup,
    AlertingDialogMeasure,
    AlertingDialogComparisonOperator,
    AlertingDialogThreshold,
    AlertingDialogRecipients,
    useAlertingDialogContext,
    useAlertSubmit,
    type IAlertingDialogProps,
} from "@gooddata/sdk-ui-dashboard";

function MyAlertingDialog(props: IAlertingDialogProps) {
    const { isLoading } = useAlertingDialogContext();
    if (isLoading) {
        return <AlertingDialogShell {...props} onSubmit={() => {}} isSaving={false} />;
    }
    return <MyAlertingDialogBody {...props} />;
}

function MyAlertingDialogBody(props: IAlertingDialogProps) {
    const { isSaving, submit } = useAlertSubmit(props);
    return (
        <AlertingDialogShell {...props} onSubmit={() => void submit()} isSaving={isSaving}>
            <AlertingDialogFormFieldGroup label="When">
                <AlertingDialogMeasure />
                <AlertingDialogComparisonOperator />
                <AlertingDialogThreshold />
            </AlertingDialogFormFieldGroup>
            <AlertingDialogRecipients />
        </AlertingDialogShell>
    );
}
```

The blocks placed above (`AlertingDialogMeasure`, `AlertingDialogRecipients`, and their siblings) are self-contained
— they read the dialog's state themselves and need no props. `DefaultAlertingDialog` and `DefaultScheduledEmailDialog`
are built from the same three pieces you can reuse individually:

- a **block** (e.g. `AlertingDialogFilters`, `ScheduledEmailDialogDestination`) — a connected component you can drop
  into your own layout as-is;
- a **props hook** (e.g. `useAlertingDialogFiltersProps`, `useScheduledEmailDialogDestinationProps`) — computes the
  exact props a region needs from the dialog's state; and
- a **`Default*` renderer** (e.g. `DefaultAlertingDialogFilters`, `DefaultScheduledEmailDialogDestination`) — the
  presentational component both the block and a slot's `Default` render, taking the props hook's return
  type.

Use a block directly for the common case, or the props hook plus the `Default*` renderer (or your own markup) when
you need to change what feeds it.

To read or write the create/edit draft directly, use the state accessors:

- alerting: `useAlertDraft`, `useAlertActions`, `useAlertData`, `useAlertFilters`;
- scheduled email: `useScheduledExportDraft`, `useScheduledExportActions`, `useScheduledExportData`,
  `useScheduledExportFilters`.

All of them throw when called outside the dialog's state providers; inside a `Dashboard`, that state model mounts
once the matching context's `isLoading` turns false for the first time and stays mounted from then on — an
automations refresh flips `isLoading` back on without unmounting it, so the draft survives through it.

## Customize the alert and scheduled-email management dialogs

The management dialogs — reached from the dashboard's automation menu, listing the alerts or scheduled emails
already configured for it — support two of the levers above:

- **Replace wholesale** with `AlertingManagementDialogComponent` / `ScheduledEmailManagementDialogComponent`
  (`CustomAlertingManagementDialogComponent` / `CustomScheduledEmailManagementDialogComponent`). The built-in
  implementations are `DefaultAlertingManagementDialogNew` and `DefaultScheduledEmailManagementDialog`.
- **Decorate the data they read** with `AlertingManagementDialogContextDecoratorComponent` /
  `ScheduledEmailManagementDialogContextDecoratorComponent`, following the same contract as the create/edit
  decorators: read the current value with `useAlertingManagementDialogContext()` /
  `useScheduledEmailManagementDialogContext()`, decorate it, and re-provide it via
  `AlertingManagementDialogContextProvider` / `ScheduledEmailManagementDialogContextProvider`.

There is no `slots` prop and no exported blocks for the management dialogs' body — they render a list, not a form.
Their own context values, `IAlertingManagementDialogContextValue` and `IScheduledEmailManagementDialogContextValue`,
are `@alpha`, one maturity level below the create/edit dialogs' contexts.

Note that the **default** management dialogs embed a self-contained list that loads its own data and permissions,
re-fetching when the context's `automationsInvalidationId` changes — decorating the context's `automations`,
`isLoading`, or permission members never changes the displayed list. The scheduled-email default does read
`automations` and `isLoading`, but only to gate its Add action (the automation limit, and disabling the button while
data loads); the alerting default reads neither. To affect the default dialogs, decorate a member they consume, as
the example below does with `dashboardTitle`: the default dialog uses it as the label of the list's preselected
dashboard filter.

```tsx
import {
    Dashboard,
    useAlertingManagementDialogContext,
    AlertingManagementDialogContextProvider,
    type CustomAlertingManagementDialogContextDecoratorComponent,
} from "@gooddata/sdk-ui-dashboard";
import { useMemo, type ReactNode } from "react";

const DashboardLabelDecorator: CustomAlertingManagementDialogContextDecoratorComponent = ({
    children,
}: {
    children?: ReactNode;
}) => {
    const ctx = useAlertingManagementDialogContext();
    const decorated = useMemo(
        () => ({ ...ctx, dashboardTitle: myDisplayTitle(ctx.dashboardTitle) }),
        [ctx],
    );
    return (
        <AlertingManagementDialogContextProvider value={decorated}>
            {children}
        </AlertingManagementDialogContextProvider>
    );
};

<Dashboard
    dashboard={dashboardRef}
    AlertingManagementDialogContextDecoratorComponent={DashboardLabelDecorator}
/>;
```

## Full API reference and the Automations list component

Every symbol named in this guide has its own TSDoc, published at the
[API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.html) — search it for the exact
symbol name.

Do not confuse the automation _dialogs_ covered on this page with the standalone [`Automations`](../../automations/)
component. `Automations` (from `@gooddata/sdk-ui-ext`) is a self-contained list/table of a workspace's or
organization's alert and schedule automations that you can embed on its own, e.g. on a settings page, independently
of the Dashboard component. The dialogs on this page, by contrast, are opened by the Dashboard component itself to
create, edit, and manage the automations of one specific dashboard.
