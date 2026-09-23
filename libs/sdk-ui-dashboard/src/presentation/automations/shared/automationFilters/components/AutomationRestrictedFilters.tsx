// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { UiChip, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

const CHIP_ANCHOR_STYLES = { display: "flex", width: "100%", height: "100%", minWidth: 0 };
const DELETE_ANCHOR_STYLES = { height: "100%" };

/**
 * Stands in for the automation filters the current user may not read, without naming them.
 */
export function AutomationRestrictedFilters({
    count,
    onRemove,
    isReadOnly,
}: {
    count: number;
    onRemove: () => void;
    isReadOnly?: boolean;
}) {
    const intl = useIntl();
    const tooltipId = useIdPrefixed("automation-restricted-filters-tooltip");

    const label = intl.formatMessage({ id: "filterBar.restrictedFilters" }, { count });
    const reason = intl.formatMessage({ id: "filterBar.restrictedFilters.reason" }, { count });
    const deleteTooltip = intl.formatMessage(
        { id: "dialogs.automation.filters.restricted.deleteTooltip" },
        { count },
    );

    return (
        <UiChip
            label={label}
            // the entry has nothing to open; isLocked also renders the lock icon
            isLocked
            isExpandable={false}
            isDeletable={!isReadOnly}
            onDelete={onRemove}
            dataTestId="automation-restricted-filters"
            accessibilityConfig={{
                ariaLabel: `${label} ${reason}`,
                deleteAriaLabel: deleteTooltip,
                deleteAriaDescribedBy: tooltipId,
            }}
            renderChipContent={(content: ReactNode) => (
                <UiTooltip
                    id={tooltipId}
                    arrowPlacement="top-start"
                    content={reason}
                    triggerBy={["hover", "focus"]}
                    anchor={content}
                    anchorWrapperStyles={CHIP_ANCHOR_STYLES}
                />
            )}
            renderActionButton={(button: ReactNode) => (
                <UiTooltip
                    arrowPlacement="top-start"
                    content={deleteTooltip}
                    triggerBy={["hover", "focus"]}
                    anchor={button}
                    anchorWrapperStyles={DELETE_ANCHOR_STYLES}
                />
            )}
        />
    );
}
