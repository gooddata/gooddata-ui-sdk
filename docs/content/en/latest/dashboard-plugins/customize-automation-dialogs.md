---
legacy_path: references/dashboard_component/automation_dialogs_customization
title: Customize the alert and scheduled email dialogs
linkTitle: Customize automation dialogs
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DefaultAlertingDialog"
  - "@gooddata/sdk-ui-dashboard:DefaultScheduledEmailDialog"
  - "@gooddata/sdk-ui-dashboard:AlertingDialogShell"
  - "@gooddata/sdk-ui-dashboard:ScheduledEmailDialogShell"
source_files:
  - src/presentation/dashboard/Dashboard.tsx
  - src/presentation/automations/alerting/DefaultAlertingDialog/DefaultAlertingDialog.tsx
  - src/presentation/automations/scheduledEmail/DefaultScheduledEmailDialog/DefaultScheduledEmailDialog.tsx
  - src/presentation/automations/alerting/blocks/AlertingDialogShell.tsx
  - src/presentation/automations/scheduledEmail/blocks/ScheduledEmailDialogShell.tsx
related_pages:
  - /docs/ai-modules/automations
  - /docs/dashboard-plugins/customize-widgets
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/dashboard-plugins/dashboard
type: docs
description: Replace, slot, decorate, or compose the alert and scheduled email dialogs that the Dashboard component opens, and replace the management dialogs that list them.
weight: 37
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/automation_dialogs_customization/"
---

Dashboards can create, edit, and manage two kinds of automations: **alerts**, which notify a recipient when a measure
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

The [management dialogs](#replace-the-alert-and-scheduled-email-management-dialogs) support only the first lever.

{{% alert color="warning" title="API maturity" %}}
The `Dashboard` props that wire a customization in — the four in the table under
[Replace a dialog wholesale](#replace-a-dialog-wholesale) and the three in the table under
[Decorate the data a dialog reads](#decorate-the-data-a-dialog-reads) — are `@alpha`: they may change in a future
release outside of SemVer. The contracts you implement against them — the component prop types, the slots, the
shells and blocks, the state accessor hooks, and the context providers of the create/edit dialogs — are `@beta`:
supported API that may still change in a minor release. See [API maturity](../../integrations/platform/api-maturity/).
{{% /alert %}}

## Replace a dialog wholesale

Four `Dashboard` props each take a component type that replaces one dialog outright:

| Prop                                      | Type                                            | Replaces                               |
| :---------------------------------------- | :---------------------------------------------- | :------------------------------------- |
| `AlertingDialogComponent`                 | `CustomAlertingDialogComponent`                 | the alert create/edit dialog           |
| `AlertingManagementDialogComponent`       | `CustomAlertingManagementDialogComponent`       | the alert management dialog            |
| `ScheduledEmailDialogComponent`           | `CustomScheduledEmailDialogComponent`           | the scheduled-email create/edit dialog |
| `ScheduledEmailManagementDialogComponent` | `CustomScheduledEmailManagementDialogComponent` | the scheduled-email management dialog  |

A create/edit replacement is mounted inside the same context providers as the default dialog, so it can read the
[state accessors](#compose-your-own-dialog-from-the-shell-and-blocks) below instead of relying on props. The props
each component receives still carry the dialogs' lifecycle callbacks:

- the create/edit dialog props (`IAlertingDialogProps`, `IScheduledEmailDialogProps`) carry
  `IAutomationDialogCallbacks` — the `onCreate*`/`onUpdate*`/`onDelete*` success and error pairs, plus `onCancel`
  (the scheduled-email props additionally carry `onBack`);
- the management dialog props (`IAlertingManagementDialogProps`, `IScheduledEmailManagementDialogProps`) carry
  `IAutomationManagementDialogCallbacks` — `onAdd`, `onEdit`, and `onClose`.

The create/edit dialogs read their data from their own context instead (see
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

Not every slot always renders. None of them render while the dialog's data is loading or while the stale-filters
confirmation step is shown, and:

- the alert dialog's `Destination` appears only when more than one notification channel is available;
- the scheduled-email dialog's `Filters` renders only on the Filters tab;
- its `Destination` and `Recipients` render only on the General tab;
- its `Timezone` renders only when the dialog shows the time zone section at all.

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

Three props let you adjust the data a create/edit dialog is seeded with, without touching how it renders. Each
mounts a component that reads the current context value, decorates it, and re-provides it to everything below:

| Prop                                            | Reads with                         | Re-provides with                      |
| :---------------------------------------------- | :--------------------------------- | :------------------------------------ |
| `AlertingDialogContextDecoratorComponent`       | `useAlertingDialogContext()`       | `AlertingDialogContextProvider`       |
| `ScheduledEmailDialogContextDecoratorComponent` | `useScheduledEmailDialogContext()` | `ScheduledEmailDialogContextProvider` |
| `AutomationsContextDecoratorComponent`          | `useAutomationsContext()`          | `AutomationsContextProvider`          |

The first two each decorate one dialog (`IAlertingDialogContextValue` / `IScheduledEmailDialogContextValue`);
`AutomationsContextDecoratorComponent` decorates the context shared by all the automation dialogs
(`IAutomationsContextValue`) and is mounted once per dialog tree — the alerting tree and the scheduled-email tree.
Both instances mount with the dashboard, not only while a dialog is open, so a decorator that fetches data runs on
every dashboard.

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
- the header row and the action bar (and, on scheduled email, the General and Filters tabs),
- the body's warning and validation messages,
- the stale-filters confirmation step, and
- the delete confirmation.

Your content goes into its scrollable body through `children`, with `topContent` and `bottomContent` above and below
it. While `useAlertingDialogContext().isLoading` (or `useScheduledEmailDialogContext().isLoading`) is true, the shell
renders its own loading skeleton instead of `children` — none of the state accessors below are available yet, so
gate on that flag before calling them.

The shell does not own the submit path — build it yourself and pass the result into the shell's `onSubmit` and
`isSaving` props:

- alerting: `useAlertSubmit` returns `submit` and `isSaving`;
- scheduled email: `useSaveScheduledEmailToBackend` returns `handleSaveScheduledEmail`, `isSavingScheduledEmail`,
  and `savingErrorMessage` (for the shell's `savingErrorMessage` prop); build Enter-key handlers for the blocks you
  place with `useScheduledEmailSubmitOnEnter` over the same `handleSaveScheduledEmail`.

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

- a **block** (for example, `AlertingDialogFilters`, `ScheduledEmailDialogDestination`) — a connected component you can drop
  into your own layout as-is;
- a **props hook** (for example, `useAlertingDialogFiltersProps`, `useScheduledEmailDialogDestinationProps`) — computes the
  exact props a region needs from the dialog's state; and
- a **`Default*` renderer** (for example, `DefaultAlertingDialogFilters`, `DefaultScheduledEmailDialogDestination`) — the
  presentational component both the block and a slot's `Default` render, taking the props hook's return
  type.

Use a block directly for the common case, or the props hook plus the `Default*` renderer (or your own markup) when
you need to change what feeds it.

To read or write the create/edit draft directly, use the state accessors (all `@beta`):

- alerting: `useAlertDraft`, `useAlertActions`, `useAlertData`, `useAlertFilters`;
- scheduled email: `useScheduledExportDraft`, `useScheduledExportActions`, `useScheduledExportData`,
  `useScheduledExportFilters`.

All of them throw when called outside the dialog's state providers; inside a `Dashboard`, that state model mounts
once the matching context's `isLoading` turns false for the first time and stays mounted from then on — an
automations refresh flips `isLoading` back on without unmounting it, so the draft survives through it.

## Replace the alert and scheduled-email management dialogs

The management dialogs — reached from the dashboard's automation menu, listing the alerts or scheduled emails
already configured for it — support one of the levers above: replace them wholesale with
`AlertingManagementDialogComponent` / `ScheduledEmailManagementDialogComponent`
(`CustomAlertingManagementDialogComponent` / `CustomScheduledEmailManagementDialogComponent`). The built-in
implementations are `DefaultAlertingManagementDialogNew` and `DefaultScheduledEmailManagementDialog`.

A replacement receives `IAlertingManagementDialogProps` / `IScheduledEmailManagementDialogProps` — the
`IAutomationManagementDialogCallbacks` (`onAdd`, `onEdit`, `onClose`) that open the create/edit dialog, open it for
one automation, or close the list. There is no `slots` prop and no exported blocks for the management dialogs'
body — they render a list, not a form — and their data context is `@alpha`, so it is not covered here.

## API reference and the Automations list component

Every symbol named in this guide has its own TSDoc in the
[`@gooddata/sdk-ui-dashboard` API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard" >}}) — search it
for the exact symbol name.

Do not confuse the automation _dialogs_ covered on this page with the standalone
[`Automations`](../../ai-modules/automations/) component. `Automations` (from `@gooddata/sdk-ui-ext`) is a
self-contained list/table of a workspace's or organization's alert and schedule automations that you can embed on
its own, for example on a settings page, independently of the Dashboard component. The dialogs on this page, by contrast,
are opened by the Dashboard component itself to create, edit, and manage the automations of one specific dashboard.
