// (C) 2020-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Checkbox, DialogListHeader, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IDrillFiltersConfigOption } from "./types.js";

interface IDrillFiltersConfigSectionProps {
    title: string;
    options: IDrillFiltersConfigOption[];
    selectedIds: string[];
    onSelectionChange: (nextSelectedIds: string[]) => void;
}

export function DrillFiltersConfigSection({
    title,
    options,
    selectedIds,
    onSelectionChange,
}: IDrillFiltersConfigSectionProps) {
    if (options.length === 0) {
        return null;
    }

    const getNextSelectedIds = (id: string, checked: boolean) =>
        checked
            ? selectedIds.includes(id)
                ? selectedIds
                : [...selectedIds, id]
            : selectedIds.filter((selectedId) => selectedId !== id);
    const handleOptionChange = (id: string) => (checked: boolean) =>
        onSelectionChange(getNextSelectedIds(id, checked));

    return (
        <div className="gd-drill-filters-config-section">
            <DialogListHeader title={title} className="gd-drill-filters-config-section-header" />
            <div className="gd-drill-filters-config-section-items">
                {options.map((option) => {
                    const isChecked = selectedIds.includes(option.id);
                    const isRanking = option.sourceInsightFilterObjRef?.type === "rankingFilter";
                    const checkbox = (
                        <Checkbox
                            value={isChecked}
                            onChange={handleOptionChange(option.id)}
                            text={option.title}
                            labelSize="small"
                            disabled={isRanking}
                        />
                    );

                    return (
                        <div
                            key={option.id}
                            className="gd-drill-filters-config-section-item"
                            title={option.title}
                        >
                            {isRanking ? (
                                <UiTooltip
                                    triggerBy={["hover", "focus"]}
                                    arrowPlacement="left"
                                    optimalPlacement
                                    content={
                                        <div className="gd-drill-filters-config-section-tooltip">
                                            <FormattedMessage id="configurationPanel.drillConfig.filterSelection.rankingFilter.tooltip" />
                                        </div>
                                    }
                                    anchor={checkbox}
                                    anchorWrapperStyles={{ lineHeight: 0, width: "fit-content" }}
                                />
                            ) : (
                                checkbox
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
