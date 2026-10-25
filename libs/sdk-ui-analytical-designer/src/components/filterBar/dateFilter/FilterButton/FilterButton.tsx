// (C) 2022-2026 GoodData Corporation

import { type ReactNode, type Ref } from "react";

import classNames from "classnames";

import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";
import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

import { FilterButtonLabel } from "./FilterButtonLabel.js";

export interface IFilterButtonProps {
    filter: IDateFilterOption;
    datasetTitle: string;
    buttonRef: Ref<HTMLDivElement>;
    onClick: () => void;
    onOpen: () => void;
    onClose: () => void;
    overTimeComparisonSummary: IOverTimeComparisonSummary | null;
    additionalDateFilterLabels: IAdditionalDateFilterLabel[];
    dateFormat: string;
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
    className?: string;
    isOpen?: boolean;
    isDragged?: boolean;
    warningMessage?: ReactNode;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsForAbsoluteRangeEnabled?: boolean;
}

export function FilterButton({
    buttonRef,
    isOpen,
    onClick,
    className,
    warningMessage,
    filter,
    overTimeComparisonSummary,
    isDragged,
    additionalDateFilterLabels,
    datasetTitle,
    dateFormat,
    isTimeForAbsoluteRangeEnabled,
    isSecondsForAbsoluteRangeEnabled,
    emptyDateValuesFilterMode,
}: IFilterButtonProps) {
    const displayWarningIcon = !!warningMessage;
    const buttonClassNames = classNames(
        [
            "dropdown-button",
            "toggle-menu",
            "adi-filter-button",
            "s-filter-button",
            "s-date-filter-button",
            "adi-date-filter-button",
            "gd-button",
            "button-dropdown",
            "gd-icon-right",
        ],
        {
            "is-active": isOpen,
            "adi-filter-warning": displayWarningIcon,
            "s-filter-warning": displayWarningIcon,
        },
        className,
    );
    return (
        <div ref={buttonRef} tabIndex={-1} className={buttonClassNames} onClick={onClick}>
            <span className="gd-button-text">
                <FilterButtonLabel
                    filter={filter}
                    timeComparisonSummary={overTimeComparisonSummary}
                    isDragged={isDragged}
                    additionalDateFilterLabels={additionalDateFilterLabels}
                    datasetTitle={datasetTitle}
                    dateFormat={dateFormat}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled}
                    emptyDateValuesFilterMode={emptyDateValuesFilterMode}
                />
            </span>
        </div>
    );
}
