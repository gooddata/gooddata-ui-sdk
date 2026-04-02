// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
    onRunCheck: () => void;
    isLoading: boolean;
};

export function QualityScoreCardButton({ intl, onRunCheck, isLoading }: Props) {
    return (
        <div className="gd-analytics-catalog__quality-score-card__button">
            <UiButton
                variant="secondary"
                size="small"
                label={intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.runCheck" })}
                onClick={onRunCheck}
                isLoading={isLoading}
                isDisabled={isLoading}
            />
        </div>
    );
}
