// (C) 2007-2026 GoodData Corporation

import { type ChangeEvent, useState } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { GRANULARITY, type Granularity, type IGranularityOption } from "../../models/granularity.js";

import { Recommendation } from "./Recommendation.js";

interface IRecommendationComparisonWithPeriodProps {
    granularityOptions?: IGranularityOption[];
    onApply: (granularity: Granularity) => void;
}

export function RecommendationComparisonWithPeriod({
    granularityOptions = [],
    onApply,
}: IRecommendationComparisonWithPeriodProps) {
    const intl = useIntl();
    const recommendedGranularities = granularityOptions.filter((option) => option.recommendationLabel);
    const [granularity, setGranularity] = useState<Granularity>(
        recommendedGranularities[0]?.dateType ?? GRANULARITY.QUARTER,
    );

    const granularitySelected = (e: ChangeEvent<HTMLSelectElement>) => {
        setGranularity(e.target.value as Granularity);
    };

    const apply = () => {
        onApply(granularity);
    };

    const renderSelect = () => {
        const renderOption = (granularity: IGranularityOption) => (
            <option key={granularity.dateType} value={granularity.dateType}>
                {intl.formatMessage({ id: granularity.recommendationLabel })}
            </option>
        );

        return (
            <select
                className="adi-attribute-switch s-attribute-switch"
                value={granularity}
                onChange={granularitySelected}
            >
                {recommendedGranularities.map(renderOption)}
            </select>
        );
    };

    return (
        <Recommendation type="comparison-with-period">
            <h3 className="gd-heading-3">
                {intl.formatMessage({ id: "recommendation.comparison.contribution_compare" })}
            </h3>
            {renderSelect()}
            <br />
            {intl.formatMessage({ id: "recommendation.comparison.with_same_period" })}
            <br />
            <Button
                value={intl.formatMessage({ id: "apply" })}
                className="gd-button-secondary s-apply-recommendation"
                onClick={apply}
            />
        </Recommendation>
    );
}
