// (C) 2026 GoodData Corporation

import { useState } from "react";

import { type IParameterMetadataObject } from "@gooddata/sdk-model";

import { AddFilterDropdownShell } from "./AddFilterDropdownShell.js";
import { AddFilterMenu } from "./AddFilterMenu.js";
import { ConnectedCatalogItemPicker } from "./ConnectedCatalogItemPicker.js";
import { type IAddFilterItem, type RankingFilterDisabledReason } from "./filterBarDropdownUtils.js";
import { FilterBarParameterPicker } from "./FilterBarParameterPicker.js";

type FilterBarDropdownView = "menu" | "attributes" | "metrics" | "rankingMetric" | "parameters";

export interface IFilterBarDropdownBodyOwnProps {
    onClose: () => void;
    onAddFilters: (items: IAddFilterItem[]) => void;
    onAddDateFilter: () => void;
    onAddRankingFilter: () => void;
    onAddRankingFilterFromMetric: (items: IAddFilterItem[]) => void;
    onAddParameters: (parameters: ReadonlyArray<IParameterMetadataObject>) => void;
    rankingDisabledReason: RankingFilterDisabledReason | undefined;
    isDateItemAvailable: boolean;
    enableImprovedRankingFilter: boolean;
    enableParameters: boolean;
    buttonNode: HTMLElement;
    contextWindow?: Window;
}

export type IFilterBarDropdownBodyProps = IFilterBarDropdownBodyOwnProps;

export function FilterBarDropdownBody({
    onClose,
    onAddFilters,
    onAddDateFilter,
    onAddRankingFilter,
    onAddRankingFilterFromMetric,
    rankingDisabledReason,
    isDateItemAvailable,
    buttonNode,
    contextWindow = window,
    enableImprovedRankingFilter,
    enableParameters,
    onAddParameters,
}: IFilterBarDropdownBodyProps) {
    const [activeView, setActiveView] = useState<FilterBarDropdownView>("menu");

    const isRankingMetric = activeView === "rankingMetric";
    const isCatalogPicker =
        activeView === "attributes" || activeView === "metrics" || activeView === "rankingMetric";

    return (
        <AddFilterDropdownShell
            buttonNode={buttonNode}
            onClose={onClose}
            testClassName="s-add-filter-dropdown"
            contextWindow={contextWindow}
        >
            {(maxListHeight) => (
                <>
                    {activeView === "menu" ? (
                        <AddFilterMenu
                            onClose={onClose}
                            onAddDateFilter={onAddDateFilter}
                            onOpenAttributePicker={() => setActiveView("attributes")}
                            onOpenMetricPicker={() => setActiveView("metrics")}
                            onAddRankingFilter={onAddRankingFilter}
                            onOpenRankingMetricPicker={() => setActiveView("rankingMetric")}
                            onOpenParameterPicker={() => setActiveView("parameters")}
                            rankingDisabledReason={rankingDisabledReason}
                            isDateItemAvailable={isDateItemAvailable}
                            enableImprovedRankingFilter={enableImprovedRankingFilter}
                            enableParameters={enableParameters}
                        />
                    ) : null}
                    {activeView === "parameters" ? (
                        <FilterBarParameterPicker
                            maxListHeight={maxListHeight}
                            onBack={() => setActiveView("menu")}
                            onClose={onClose}
                            onAdd={onAddParameters}
                        />
                    ) : null}
                    {isCatalogPicker ? (
                        <ConnectedCatalogItemPicker
                            itemTypes={[activeView === "attributes" ? "attribute" : "metric"]}
                            selectionMode={isRankingMetric ? "single" : "multiple"}
                            ignoreMeasureValueFilters={isRankingMetric}
                            isOpen
                            maxListHeight={maxListHeight}
                            onBack={() => setActiveView("menu")}
                            onClose={onClose}
                            onAdd={isRankingMetric ? onAddRankingFilterFromMetric : onAddFilters}
                        />
                    ) : null}
                </>
            )}
        </AddFilterDropdownShell>
    );
}
