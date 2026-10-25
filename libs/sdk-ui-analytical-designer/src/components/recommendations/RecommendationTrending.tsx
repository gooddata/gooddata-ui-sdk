// (C) 2007-2026 GoodData Corporation

import { type ChangeEvent, useState } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { GRANULARITY, type Granularity, type IGranularityOption } from "../../models/granularity.js";

import { Recommendation } from "./Recommendation.js";

interface IRecommendationTrendingProps {
    granularityOptions?: IGranularityOption[];
    onApply: (granularity: Granularity) => void;
}

export function RecommendationTrending({ granularityOptions = [], onApply }: IRecommendationTrendingProps) {
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
                {intl.formatMessage({ id: granularity.label })}
            </option>
        );

        return (
            <select className="s-date-granularity-switch" value={granularity} onChange={granularitySelected}>
                {recommendedGranularities.map(renderOption)}
            </select>
        );
    };

    return (
        <Recommendation type="trending">
            <h3 className="gd-heading-3">{intl.formatMessage({ id: "recommendation.trending.see" })}</h3>
            {renderSelect()}
            <br />
            {intl.formatMessage({ id: "recommendation.trending.of_last_four_quarters" })}
            <br />
            {intl.formatMessage({ id: "recommendation.trending.in_time_by" })}
            <br />
            <Button
                value={intl.formatMessage({ id: "apply" })}
                className="gd-button-secondary s-apply-recommendation"
                onClick={apply}
            />
        </Recommendation>
    );
}
