// (C) 2007-2025 GoodData Corporation
import { RefObject } from "react";
import { ICatalogDateDataset, isInsightWidget, IWidget } from "@gooddata/sdk-model";
import { FormattedMessage } from "react-intl";
import DefaultMeasure from "react-measure";
import { DateDatasetDropdown } from "./DateDatasetDropdown.js";
import { getUnrelatedDateDataset, removeDateFromTitle } from "./utils.js";
import { defaultImport } from "default-import";

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

    const getDateFilter = (measureRef: RefObject<HTMLDivElement> | undefined, width: number) => (
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
                    {({ measureRef, contentRect }) =>
                        getDateFilter(
                            measureRef as unknown as RefObject<HTMLDivElement>,
                            contentRect.entry.width || 0,
                        )
                    }
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
