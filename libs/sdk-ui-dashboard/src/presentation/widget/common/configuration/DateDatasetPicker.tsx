// (C) 2007-2025 GoodData Corporation

import { type Ref } from "react";

import { defaultImport } from "default-import";
import { FormattedMessage } from "react-intl";
import DefaultMeasure from "react-measure";

import { type ICatalogDateDataset, type IWidget, isInsightWidget } from "@gooddata/sdk-model";

import { DateDatasetDropdown } from "./DateDatasetDropdown.js";
import { getUnrelatedDateDataset, removeDateFromTitle } from "./utils.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

export interface IDateDatasetPickerProps {
    autoOpen?: boolean;
    widget: IWidget;
    relatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
    selectedDateDataset?: ICatalogDateDataset;
    selectedDateDatasetHidden?: boolean;

    unrelatedDateDataset?: ICatalogDateDataset;
    dateFromVisualization?: ICatalogDateDataset;
    onDateDatasetChange: (id: string) => void;
    className?: string;
    isLoading?: boolean;
    enableUnrelatedItemsVisibility?: boolean;
    unrelatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
}

export function DateDatasetPicker({
    relatedDateDatasets,
    selectedDateDataset,
    selectedDateDatasetHidden,
    widget,
    dateFromVisualization,
    autoOpen,
    isLoading,
    enableUnrelatedItemsVisibility,
    unrelatedDateDatasets,

    onDateDatasetChange,
}: IDateDatasetPickerProps) {
    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(relatedDateDatasets, selectedDateDataset, selectedDateDatasetHidden);

    const getDateFilter = (measureRef: Ref<HTMLDivElement> | undefined, width: number) => (
        <div className="subcategory-dropdown" ref={measureRef}>
            <DateDatasetDropdown
                autoOpen={autoOpen}
                widgetRef={widget.ref}
                className="s-filter-date-dropdown"
                relatedDateDatasets={relatedDateDatasets ?? []}
                activeDateDataset={selectedDateDatasetHidden ? undefined : selectedDateDataset}
                unrelatedDateDataset={unrelatedDateDataset}
                dateFromVisualization={dateFromVisualization}
                onDateDatasetChange={onDateDatasetChange}
                isLoading={isLoading}
                width={width}
                enableUnrelatedItemsVisibility={enableUnrelatedItemsVisibility}
                unrelatedDateDatasets={unrelatedDateDatasets}
            />
        </div>
    );

    return (
        <div>
            <div className="configuration-subcategory">
                <label
                    className="s-filter-date-dropdown-heading subcategory-label"
                    htmlFor="s-filter-date-dropdown"
                >
                    <FormattedMessage id="configurationPanel.dateAs" />
                </label>
                <Measure>
                    {({ measureRef, contentRect }) => getDateFilter(measureRef, contentRect.entry.width || 0)}
                </Measure>
            </div>
            {!!(unrelatedDateDataset && !isLoading) && (
                <div className="gd-message error s-unrelated-date">
                    {isInsightWidget(widget) ? (
                        <FormattedMessage
                            id="configurationPanel.unrelatedVizDateInfo"
                            values={{ dateDataSet: removeDateFromTitle(unrelatedDateDataset.dataSet.title) }}
                        />
                    ) : (
                        <FormattedMessage
                            id="configurationPanel.unrelatedKpiDateInfo"
                            values={{ dateDataSet: removeDateFromTitle(unrelatedDateDataset.dataSet.title) }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
