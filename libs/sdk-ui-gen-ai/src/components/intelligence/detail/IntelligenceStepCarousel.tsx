// (C) 2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { UiPaginationButton } from "@gooddata/sdk-ui-kit";

import { e } from "../intelligenceBem.js";

export interface IIntelligenceStepCarouselProps {
    /** 0-based index of the currently shown category. */
    currentIndex: number;
    totalCount: number;
    onSelectCategory: (index: number) => void;
}

/**
 * The detail view's footer pager, e.g. "< 2 of 7 >", for moving between categories without
 * returning to the list. The current position is shown in bold.
 */
export function IntelligenceStepCarousel({
    currentIndex,
    totalCount,
    onSelectCategory,
}: IIntelligenceStepCarouselProps) {
    const intl = useIntl();
    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= totalCount - 1;

    return (
        <div className={e("carousel")}>
            <UiPaginationButton
                direction="previous"
                label={intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.pager.previous" })}
                isDisabled={isFirst}
                onClick={() => onSelectCategory(currentIndex - 1)}
            />
            <span className={e("carousel__label")}>
                <FormattedMessage
                    id="gd.gen-ai.interactionIntelligence.pager"
                    values={{
                        current: currentIndex + 1,
                        total: totalCount,
                        b: (chunks) => <b>{chunks}</b>,
                    }}
                />
            </span>
            <UiPaginationButton
                direction="next"
                label={intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.pager.next" })}
                isDisabled={isLast}
                onClick={() => onSelectCategory(currentIndex + 1)}
            />
        </div>
    );
}
