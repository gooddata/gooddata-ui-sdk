// (C) 2019-2026 GoodData Corporation

import { type ReactNode, useCallback, useRef } from "react";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";
import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";
import { FilterButton } from "../FilterButton/FilterButton.js";
import { getWarningMessage } from "../warningMessageFactory.js";

import { FilterDropdownOverlay } from "./FilterDropdownOverlay.js";

export interface IFilterDropdownProps {
    filter: IDateFilterOption;
    datasetTitle: string;
    onOpen: () => void;
    onClose: () => void;
    overTimeComparisonSummary: IOverTimeComparisonSummary | null;
    additionalDateFilterLabels: IAdditionalDateFilterLabel[];
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
    isUsedByInsight: boolean;
    migratedAdditionalFilters: string[];
    dateFormat: string;
    className?: string;
    isOpen?: boolean;
    isDragged?: boolean;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsForAbsoluteRangeEnabled?: boolean;
    children?: ReactNode;
}

export function FilterDropdown(props: IFilterDropdownProps) {
    const {
        isUsedByInsight,
        migratedAdditionalFilters,
        isOpen,
        onOpen,
        onClose,
        isDragged,
        datasetTitle,
        children,
        isTimeForAbsoluteRangeEnabled,
        isSecondsForAbsoluteRangeEnabled,
    } = props;
    const buttonRef = useRef<HTMLDivElement>(null);
    const warningMessage = getWarningMessage(isUsedByInsight, migratedAdditionalFilters);

    // bubble trigger is always rendered otherwise button would get remounted, stored button ref would point
    //  to element no longer in DOM and opened dropdown would jump to the top left corner of viewport
    const renderTooltip = !isOpen && !isDragged && !!warningMessage;

    const onClick = useCallback(() => {
        if (isOpen) {
            onClose();
        } else {
            onOpen();
        }
    }, [isOpen, onClose, onOpen]);

    return (
        <span className="s-attr-filter">
            <BubbleHoverTrigger tagName="div" showDelay={200} hideDelay={0}>
                <FilterButton
                    {...props}
                    buttonRef={buttonRef}
                    onClick={onClick}
                    datasetTitle={datasetTitle}
                    warningMessage={warningMessage}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled}
                />
                {renderTooltip ? <Bubble alignPoints={[{ align: "bc tc" }]}>{warningMessage}</Bubble> : null}
            </BubbleHoverTrigger>
            {isOpen ? (
                <FilterDropdownOverlay alignTo={buttonRef} onClose={onClose}>
                    {children}
                </FilterDropdownOverlay>
            ) : null}
        </span>
    );
}
