// (C) 2007-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { Recommendation } from "./Recommendation.js";

interface IRecommendationContributionInPercentsProps {
    onApply: () => void;
}

export function RecommendationContributionInPercents({
    onApply,
}: IRecommendationContributionInPercentsProps) {
    const intl = useIntl();

    const handleApply = () => {
        onApply();
    };

    return (
        <Recommendation type="contribution">
            <h3 className="gd-heading-3">
                {intl.formatMessage({ id: "recommendation.comparison.percents" })}
            </h3>
            {intl.formatMessage({ id: "recommendation.comparison.contribution_to_the_whole" })}
            <br />
            <Button
                value={intl.formatMessage({ id: "apply" })}
                className="gd-button-secondary s-apply-recommendation"
                onClick={handleApply}
            />
        </Recommendation>
    );
}
