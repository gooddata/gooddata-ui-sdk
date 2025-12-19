// (C) 2023-2025 GoodData Corporation

import { type RefObject } from "react";

import { useIntl } from "react-intl";

import { HeadlinePagination } from "@gooddata/sdk-ui-vis-commons";

import { usePagination } from "./baseHeadlineDataItems/useOutOfBoundsDetection.js";
import { CompareSectionItem } from "./CompareSectionItem.js";
import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionProps {
    secondaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    tertiaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted> | null;
}

export function CompareSection({ secondaryItem, tertiaryItem }: ICompareSectionProps) {
    const intl = useIntl();

    const {
        shouldUsePagination,
        overflowState,
        handleSecondaryOverflow,
        handleTertiaryOverflow,
        compareSectionClassNames,
        secondaryItemTitleWrapperRef,
    } = usePagination(tertiaryItem !== undefined);

    return shouldUsePagination ? (
        <div className="gd-flex-container headline-compare-section headline-paginated-compare-section s-headline-paginated-compare-section">
            <HeadlinePagination
                renderSecondaryItem={() => (
                    <CompareSectionItem
                        dataItem={secondaryItem}
                        titleRef={secondaryItemTitleWrapperRef as RefObject<HTMLDivElement>}
                        onValueOverflow={undefined} // No overflow detection needed in pagination mode
                        measurementTrigger={overflowState.measurementKey}
                    />
                )}
                renderTertiaryItem={() => (
                    <CompareSectionItem
                        dataItem={tertiaryItem!}
                        onValueOverflow={undefined} // No overflow detection needed in pagination mode
                        measurementTrigger={overflowState.measurementKey}
                    />
                )}
                accessibilityConfig={{
                    nextAriaLabel: intl.formatMessage({
                        id: "visualizations.headline.pagination.next.metricLabel",
                    }),
                    previousAriaLabel: intl.formatMessage({
                        id: "visualizations.headline.pagination.previous.metricLabel",
                    }),
                }}
            />
        </div>
    ) : (
        <div className={compareSectionClassNames}>
            {tertiaryItem ? (
                <CompareSectionItem
                    dataItem={tertiaryItem}
                    onValueOverflow={handleTertiaryOverflow}
                    measurementTrigger={overflowState.measurementKey}
                />
            ) : null}
            <CompareSectionItem
                dataItem={secondaryItem}
                titleRef={secondaryItemTitleWrapperRef as RefObject<HTMLDivElement>}
                onValueOverflow={handleSecondaryOverflow}
                measurementTrigger={overflowState.measurementKey}
            />
        </div>
    );
}
