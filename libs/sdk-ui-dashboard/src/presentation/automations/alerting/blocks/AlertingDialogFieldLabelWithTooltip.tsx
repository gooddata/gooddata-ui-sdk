// (C) 2026 GoodData Corporation

import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * A form-row label with a "?" tooltip after it; the Granularity and TriggerInterval blocks use it.
 *
 * @internal
 */
export function AlertingDialogFieldLabelWithTooltip({
    label,
    tooltip,
}: {
    label: MessageDescriptor;
    tooltip: MessageDescriptor;
}) {
    const intl = useIntl();
    return (
        <div className="gd-dashboard-alerting-dialog-form-field__content-container-tooltip">
            <FormattedMessage {...label} />
            <UiTooltip
                anchor={
                    <UiIconButton
                        icon="question"
                        variant="tertiary"
                        size="xsmall"
                        accessibilityConfig={{ ariaLabel: intl.formatMessage(label) }}
                    />
                }
                content={<FormattedMessage {...tooltip} />}
                arrowPlacement="left"
                optimalPlacement
                offset={10}
                width={280}
                triggerBy={["hover", "click"]}
            />
        </div>
    );
}
