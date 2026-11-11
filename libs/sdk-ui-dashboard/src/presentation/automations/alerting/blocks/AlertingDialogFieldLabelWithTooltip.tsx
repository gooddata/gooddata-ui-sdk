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
        <span className="gd-dashboard-alerting-dialog-form-field__content-container-tooltip">
            <FormattedMessage {...label} />
            <span className="gd-dashboard-alerting-dialog-form-field__label-tooltip-icon">
                <UiTooltip
                    component="span"
                    inlineAnchor
                    anchor={
                        <UiIconButton
                            icon="question"
                            variant="tertiary"
                            size="xxsmall"
                            accessibilityConfig={{ ariaLabel: intl.formatMessage(label) }}
                        />
                    }
                    content={<FormattedMessage {...tooltip} />}
                    arrowPlacement="left"
                    optimalPlacement
                    offset={10}
                    triggerBy={["hover", "click"]}
                />
            </span>
        </span>
    );
}
