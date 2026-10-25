// (C) 2022-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { Message } from "@gooddata/sdk-ui-kit";

import { DisableableFilterWrapper } from "../AdditionalFiltersSection/DisableableFilterWrapper.js";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";
import { type IComparisonCompatibleMeasure } from "../types.js";

import { ComparedMeasuresDropdown } from "./ComparedMeasuresDropdown.js";
import { TimeComparisonTypesDropdown } from "./TimeComparisonTypesDropdown.js";

const areAllCompatibleMeasuresSelected = (
    compatibleMeasures: IComparisonCompatibleMeasure[],
    selectedMeasureIds: string[],
) => selectedMeasureIds.length > 0 && selectedMeasureIds.length === compatibleMeasures.length;

interface IComparedMeasuresSection {
    selectedType: OverTimeComparisonType;
    compatibleMeasures: IComparisonCompatibleMeasure[];
    selectedMeasureIds: string[];
    onMeasuresSelected: (selectedMeasureLocalIdentifiers: string[]) => void;
}

export interface ITimeComparisonSectionProps extends IComparedMeasuresSection {
    supportedTypes: OverTimeComparisonType[];
    onTypeSelected: (selectedType: OverTimeComparisonType) => void;
    isPoPAvailable: boolean;
    isAllTimeDateFilter: boolean;
    isSectionHidden: boolean;
    isDisabled?: boolean;
}

function ComparedMeasuresSection({
    compatibleMeasures,
    selectedType,
    selectedMeasureIds,
    onMeasuresSelected,
}: IComparedMeasuresSection) {
    if (selectedType === OverTimeComparisonTypes.NOTHING) {
        return null;
    }
    return (
        <div className="subsection-wrap">
            <div className="subsection">
                <label className="adi-compare-apply-label" htmlFor="time-comparison-measures-dropdown">
                    <FormattedMessage id="filter.compare.apply_on" />
                </label>
                <ComparedMeasuresDropdown
                    listItemHeight={DROPDOWN_ITEM_HEIGHT}
                    selectedMeasures={selectedMeasureIds}
                    compatibleMeasures={compatibleMeasures}
                    selectedAllCompatible={areAllCompatibleMeasuresSelected(
                        compatibleMeasures,
                        selectedMeasureIds,
                    )}
                    onSelectionApplied={onMeasuresSelected}
                />
            </div>
        </div>
    );
}

export function TimeComparisonSection({
    selectedType,
    supportedTypes,
    selectedMeasureIds,
    compatibleMeasures,
    onTypeSelected,
    onMeasuresSelected,
    isAllTimeDateFilter,
    isPoPAvailable,
    isSectionHidden,
    isDisabled,
}: ITimeComparisonSectionProps) {
    const intl = useIntl();

    if (isSectionHidden) {
        return (
            <Message type={"progress"} className={"s-date-filter-error-message date-filter-error-message"}>
                {intl.formatMessage({ id: "filter.date.comparing_only_on_first_warning" })}
            </Message>
        );
    }

    if (supportedTypes.length === 0) {
        return (
            <Message type={"progress"} className={"s-date-filter-error-message date-filter-error-message"}>
                {intl.formatMessage({ id: "filter.date.comparing_not_supported_by_visualization" })}
            </Message>
        );
    }

    return (
        <DisableableFilterWrapper
            isDisabled={isDisabled}
            className={"section adi-date-dropdown adi-compare-apply-select"}
        >
            <label htmlFor="time-comparison-dropdown">
                <FormattedMessage id="filter.date.compare_period_with" />
            </label>
            <TimeComparisonTypesDropdown
                className="s-filter-date-compare-switch adi-date-preset-select-dropdown"
                supportedTypes={supportedTypes}
                isAllTimeDateFilter={isAllTimeDateFilter}
                selectedType={selectedType}
                onSelect={onTypeSelected}
                itemHeight={DROPDOWN_ITEM_HEIGHT}
                isPoPAvailable={isPoPAvailable}
            />
            <ComparedMeasuresSection
                selectedType={selectedType}
                compatibleMeasures={compatibleMeasures}
                selectedMeasureIds={selectedMeasureIds}
                onMeasuresSelected={onMeasuresSelected}
            />
        </DisableableFilterWrapper>
    );
}
