// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { ContentDivider } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { AlertingDialogAttribute } from "../blocks/AlertingDialogAttribute.js";
import { AlertingDialogComparisonOperator } from "../blocks/AlertingDialogComparisonOperator.js";
import { AlertingDialogComparisonPeriod } from "../blocks/AlertingDialogComparisonPeriod.js";
import { AlertingDialogFormFieldGroup } from "../blocks/AlertingDialogFormFieldGroup.js";
import { AlertingDialogGranularity } from "../blocks/AlertingDialogGranularity.js";
import { AlertingDialogMeasure } from "../blocks/AlertingDialogMeasure.js";
import { AlertingDialogSensitivity } from "../blocks/AlertingDialogSensitivity.js";
import { AlertingDialogShell } from "../blocks/AlertingDialogShell.js";
import { AlertingDialogThreshold } from "../blocks/AlertingDialogThreshold.js";
import { AlertingDialogTriggerInterval } from "../blocks/AlertingDialogTriggerInterval.js";
import { AlertingDialogTriggerMode } from "../blocks/AlertingDialogTriggerMode.js";
import { DefaultLoadingAlertingDialog } from "../blocks/DefaultLoadingAlertingDialog.js";
import {
    useAlertingDialogDestinationProps,
    useAlertingDialogFiltersProps,
    useAlertingDialogRecipientsProps,
} from "../state/useAlertingDialogRegionProps.js";
import { useAlertSubmit } from "../state/useAlertSubmit.js";
import { type IDefaultAlertingDialogProps } from "../types.js";

import { DefaultAlertingDialogDestination } from "./DefaultAlertingDialogDestination.js";
import { DefaultAlertingDialogFilters } from "./DefaultAlertingDialogFilters.js";
import { DefaultAlertingDialogRecipients } from "./DefaultAlertingDialogRecipients.js";

/**
 * Default implementation of the alerting create/edit dialog.
 *
 * This component is a pure consumer of `AutomationsContext`, `AlertingDialogContext`, and the
 * alerting dialog state contexts: it reads org/workspace data, per-dialog state, and the alert
 * draft's state from those contexts rather than from the dashboard store. It must therefore be
 * rendered within an `AutomationsContextProvider`, an `AlertingDialogContextProvider` (for the
 * create/edit flow), and an `AlertingDialogStateProvider`. Inside a `Dashboard`, the alerting
 * connector supplies the first two providers above the `AlertingDialogComponent` slot, and mounts
 * `AlertingDialogStateProvider` around the resolved slot component once
 * `useAlertingDialogContext().isLoading` is false — so the default component, and any wholesale
 * slot replacement, inherit all three contexts automatically and require no extra wiring.
 *
 * The providers are intentionally hoisted above the slot rather than built inside this component:
 * that is what lets a wholesale replacement receive the same contexts. Rendering this component
 * outside those providers throws at runtime.
 *
 * The dialog is {@link AlertingDialogShell} — the chrome: overlay, frame, header row, action bar, the
 * dialog's messages, the stale-filters and delete confirmation steps, the loading skeleton — around the
 * exported region renders ({@link DefaultAlertingDialogFilters}, {@link DefaultAlertingDialogDestination},
 * {@link DefaultAlertingDialogRecipients}, fed by {@link useAlertingDialogFiltersProps} and siblings; the
 * header and action bar are the shell's) and the connected field blocks — {@link AlertingDialogMeasure},
 * {@link AlertingDialogAttribute}, {@link AlertingDialogComparisonOperator}, {@link AlertingDialogThreshold},
 * {@link AlertingDialogComparisonPeriod}, {@link AlertingDialogSensitivity}, {@link AlertingDialogGranularity},
 * {@link AlertingDialogTriggerMode}, {@link AlertingDialogTriggerInterval} — grouped under the "When" and
 * "Do" headings by {@link AlertingDialogFormFieldGroup}; each field is a labelled
 * {@link AutomationDialogFormField} row and the conditional ones gate themselves on the draft. A custom
 * `AlertingDialogComponent` that keeps this chrome but owns the arrangement renders
 * {@link AlertingDialogShell} around the blocks it wants (see its example); one that owns the chrome too
 * places the blocks in its own markup and reads or writes the same draft through {@link useAlertDraft} and
 * {@link useAlertActions}.
 *
 * Slots render only in the fully rendered dialog: not while the dialog context reports loading,
 * and not while the stale-filters confirmation step is shown.
 *
 * @alpha
 */
export function DefaultAlertingDialog(props: IDefaultAlertingDialogProps): ReactElement {
    const { onCancel } = props;
    const { locale } = useAutomationsContext();
    const { isLoading, alertToEdit } = useAlertingDialogContext();

    if (isLoading) {
        return <DefaultLoadingAlertingDialog onCancel={onCancel} alertToEdit={alertToEdit} />;
    }

    return (
        <IntlWrapper locale={locale}>
            <DefaultAlertingDialogBody {...props} />
        </IntlWrapper>
    );
}

function DefaultAlertingDialogBody({
    onCancel,
    onDeleteSuccess,
    onDeleteError,
    onError,
    onSuccess,
    onSaveError,
    onSaveSuccess,
    slots,
    topContent,
    bottomContent,
}: IDefaultAlertingDialogProps): ReactElement {
    const FiltersSlot = slots?.Filters;
    const DestinationSlot = slots?.Destination;
    const RecipientsSlot = slots?.Recipients;

    const { notificationChannels } = useAlertingDialogContext();

    const { isSaving, submit } = useAlertSubmit({ onSuccess, onError, onSaveSuccess, onSaveError });

    const filtersDefaultProps = useAlertingDialogFiltersProps();
    const destinationDefaultProps = useAlertingDialogDestinationProps();
    const recipientsDefaultProps = useAlertingDialogRecipientsProps();

    return (
        <AlertingDialogShell
            onCancel={onCancel}
            onDeleteSuccess={onDeleteSuccess}
            onDeleteError={onDeleteError}
            onSubmit={() => void submit()}
            isSaving={isSaving}
            slots={slots}
            topContent={topContent}
            bottomContent={bottomContent}
        >
            {FiltersSlot ? (
                <FiltersSlot Default={DefaultAlertingDialogFilters} defaultProps={filtersDefaultProps} />
            ) : (
                <DefaultAlertingDialogFilters {...filtersDefaultProps} />
            )}
            <ContentDivider className="gd-divider-with-margin" />
            <AlertingDialogFormFieldGroup label={<FormattedMessage id="insightAlert.config.when" />}>
                <AlertingDialogMeasure />
                <AlertingDialogAttribute />
                <AlertingDialogComparisonOperator />
                <AlertingDialogThreshold />
                <AlertingDialogComparisonPeriod />
                <AlertingDialogSensitivity />
                <AlertingDialogGranularity />
            </AlertingDialogFormFieldGroup>
            <ContentDivider className="gd-divider-with-margin" />
            <AlertingDialogFormFieldGroup label={<FormattedMessage id="insightAlert.config.do" />}>
                {notificationChannels.length > 1 ? (
                    DestinationSlot ? (
                        <DestinationSlot
                            Default={DefaultAlertingDialogDestination}
                            defaultProps={destinationDefaultProps}
                        />
                    ) : (
                        <DefaultAlertingDialogDestination {...destinationDefaultProps} />
                    )
                ) : null}
                <AlertingDialogTriggerMode />
                <AlertingDialogTriggerInterval />
                {RecipientsSlot ? (
                    <RecipientsSlot
                        Default={DefaultAlertingDialogRecipients}
                        defaultProps={recipientsDefaultProps}
                    />
                ) : (
                    <DefaultAlertingDialogRecipients {...recipientsDefaultProps} />
                )}
            </AlertingDialogFormFieldGroup>
        </AlertingDialogShell>
    );
}
