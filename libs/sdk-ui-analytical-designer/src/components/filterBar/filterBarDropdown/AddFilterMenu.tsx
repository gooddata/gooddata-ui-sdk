// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { UiIcon, UiSubmenuHeader, UiTooltip } from "@gooddata/sdk-ui-kit";

import { AddFilterMenuItem } from "./AddFilterMenuItem.js";
import { type RankingFilterDisabledReason, getRankingDisabledTooltipKey } from "./filterBarDropdownUtils.js";

interface IAddFilterMenuProps {
    onClose: () => void;
    onAddDateFilter: () => void;
    onOpenAttributePicker: () => void;
    isDateItemAvailable: boolean;
    /** explains a disabled Date entry, when there is something to explain */
    dateDisabledTooltip?: string;
    isAttributeItemAvailable?: boolean;
    /** explains a disabled Attribute values entry, when there is something to explain */
    attributeDisabledTooltip?: string;
    /**
     * The entries only the insight filter bar offers; a metric's menu leaves them out, which is the
     * one way the two menus differ.
     */
    showMetricItem?: boolean;
    onOpenMetricPicker?: () => void;
    showRankingItem?: boolean;
    onAddRankingFilter?: () => void;
    onOpenRankingMetricPicker?: () => void;
    rankingDisabledReason?: RankingFilterDisabledReason | undefined;
    enableImprovedRankingFilter?: boolean;
    enableParameters?: boolean;
    onOpenParameterPicker?: () => void;
}

/** a disabled entry explained on hover; the tooltip anchors the whole row so the hint covers it */
function withDisabledTooltip(item: ReactNode, tooltip: string | undefined): ReactNode {
    if (!tooltip) {
        return item;
    }
    return (
        <UiTooltip
            content={tooltip}
            triggerBy={["hover", "focus"]}
            width="same-as-anchor"
            optimalPlacement
            arrowPlacement="left"
            anchor={<span className="adi-add-filter-menu-item__tooltip-anchor">{item}</span>}
        />
    );
}

export function AddFilterMenu({
    onClose,
    onAddDateFilter,
    onOpenAttributePicker,
    isDateItemAvailable,
    dateDisabledTooltip,
    isAttributeItemAvailable = true,
    attributeDisabledTooltip,
    showMetricItem = true,
    onOpenMetricPicker,
    showRankingItem = true,
    onAddRankingFilter,
    onOpenRankingMetricPicker,
    rankingDisabledReason,
    enableImprovedRankingFilter = false,
    enableParameters = false,
    onOpenParameterPicker,
}: IAddFilterMenuProps) {
    const intl = useIntl();
    // rankingDisabledReason already accounts for the ranking feature flags (enableImprovedRankingFilter,
    // enableRankingWithMvf), so ranking is enabled exactly when no blocking reason remains.
    const isRankingEnabled = rankingDisabledReason === undefined;
    const tooltipKey = getRankingDisabledTooltipKey(rankingDisabledReason);
    const rankingDisabledTooltip = isRankingEnabled
        ? undefined
        : tooltipKey
          ? intl.formatMessage({ id: tooltipKey })
          : undefined;

    return (
        <div className="adi-add-filter-menu">
            <UiSubmenuHeader
                title={intl.formatMessage({ id: "filter_bar_add_filter.menu.title" })}
                closeAriaLabel={intl.formatMessage({ id: "cancel" })}
                onClose={onClose}
                height="medium"
            />
            <div className="adi-add-filter-menu__content">
                {withDisabledTooltip(
                    <AddFilterMenuItem
                        testClassName="s-add-filter-menu-item-date"
                        icon={<UiIcon type="date" size={18} color="currentColor" />}
                        iconClassName="adi-add-filter-menu-item__icon--date"
                        label={intl.formatMessage({ id: "filter_bar_add_filter.menu.date" })}
                        disabled={!isDateItemAvailable}
                        onClick={onAddDateFilter}
                    />,
                    isDateItemAvailable ? undefined : dateDisabledTooltip,
                )}
                {withDisabledTooltip(
                    <AddFilterMenuItem
                        testClassName="s-add-filter-menu-item-attribute"
                        icon={<UiIcon type="ldmAttribute" size={18} color="currentColor" />}
                        iconClassName="adi-add-filter-menu-item__icon--attribute"
                        label={intl.formatMessage({ id: "filter_bar_add_filter.menu.attribute" })}
                        hasSubmenu
                        disabled={!isAttributeItemAvailable}
                        onClick={onOpenAttributePicker}
                    />,
                    isAttributeItemAvailable ? undefined : attributeDisabledTooltip,
                )}
                {showMetricItem ? (
                    <AddFilterMenuItem
                        testClassName="s-add-filter-menu-item-metric"
                        icon={<UiIcon type="metric" size={18} color="currentColor" />}
                        iconClassName="adi-add-filter-menu-item__icon--metric"
                        label={intl.formatMessage({ id: "filter_bar_add_filter.menu.metric" })}
                        hasSubmenu
                        onClick={onOpenMetricPicker}
                    />
                ) : null}
                {showRankingItem
                    ? withDisabledTooltip(
                          <AddFilterMenuItem
                              testClassName="s-add-filter-menu-item-ranking"
                              icon={null}
                              iconClassName="adi-add-filter-menu-item__icon--ranking"
                              label={intl.formatMessage({ id: "filter_bar_add_filter.menu.ranking" })}
                              hasSubmenu={enableImprovedRankingFilter}
                              disabled={!isRankingEnabled}
                              onClick={
                                  enableImprovedRankingFilter ? onOpenRankingMetricPicker : onAddRankingFilter
                              }
                          />,
                          rankingDisabledTooltip,
                      )
                    : null}
                {enableParameters ? (
                    <>
                        <div
                            className="adi-add-filter-menu__separator s-add-filter-menu-separator"
                            role="separator"
                        />
                        <AddFilterMenuItem
                            testClassName="s-add-filter-menu-item-parameter"
                            icon={<UiIcon type="parameter" size={18} color="currentColor" />}
                            iconClassName="adi-add-filter-menu-item__icon--parameter"
                            label={intl.formatMessage({ id: "filter_bar_add_filter.menu.parameter" })}
                            hasSubmenu
                            onClick={onOpenParameterPicker}
                        />
                    </>
                ) : null}
            </div>
        </div>
    );
}
