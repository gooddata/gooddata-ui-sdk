// (C) 2007-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { Recommendation } from "./Recommendation.js";

interface IRecommendationMetricWithPeriodProps {
    onApply: () => void;
}

export function RecommendationMetricWithPeriod({ onApply }: IRecommendationMetricWithPeriodProps) {
    const intl = useIntl();

    return (
        <Recommendation type="metric-with-period">
            <h3 className="gd-heading-3">
                {intl.formatMessage({ id: "recommendation.comparison.contribution_compare" })}
            </h3>
            {intl.formatMessage({ id: "recommendation.comparison.with_same_period" })}
            <br />
            <Button
                value={intl.formatMessage({ id: "apply" })}
                className="gd-button-secondary s-apply-recommendation"
                onClick={onApply}
            />
        </Recommendation>
    );
}
