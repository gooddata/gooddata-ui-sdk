// (C) 2007-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";

/**
 * Tooltip explaining arbitrary values input for the text filter body.
 *
 * @internal
 */
export function ArbitraryValuesTooltip() {
    const intl = useIntl();

    return (
        <UiTooltip
            content={
                <span style={{ whiteSpace: "pre-line" }}>
                    {intl.formatMessage(
                        {
                            id: "attributeFilter.text.values.tooltip",
                        },
                        {
                            emptyValue: `(${intl.formatMessage({ id: "empty_value" })})`,
                            maxValues: MAX_SELECTION_SIZE,
                        },
                    )}
                </span>
            }
            triggerBy={["hover", "focus"]}
            arrowPlacement="left"
            anchor={
                <span className="gd-text-filter-body__values-help-icon">
                    <UiIconButton
                        icon="question"
                        size="xsmall"
                        variant="bare"
                        iconColor="complementary-7"
                        label={intl.formatMessage({
                            id: "attributeFilter.text.values.helpIconLabel",
                        })}
                    />
                </span>
            }
        />
    );
}
