// (C) 2024-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { Recommendation } from "./Recommendation.js";

export type RecommendationFilteringVariant = "default" | "geoSegmentConflict";

interface IRecommendationFilteringProps {
    onApply: () => void;
    variant?: RecommendationFilteringVariant;
}

export function RecommendationFiltering({ onApply, variant = "default" }: IRecommendationFilteringProps) {
    const intl = useIntl();

    if (variant === "geoSegmentConflict") {
        return (
            <Recommendation type="filtering" showArrow={false} showIcon={false}>
                <h3 className="gd-heading-3">
                    {intl.formatMessage({ id: "recommendation.geo.segment_conflict.title" })}
                </h3>
                {intl.formatMessage({ id: "recommendation.geo.segment_conflict.message" })}
                <br />
                <Button
                    className="gd-button-secondary s-apply-filtering"
                    value={intl.formatMessage({ id: "recommendation.geo.segment_conflict.action" })}
                    onClick={onApply}
                />
            </Recommendation>
        );
    }

    return (
        <Recommendation type="filtering" showArrow={false} showIcon={false}>
            <h3 className="gd-heading-3">{intl.formatMessage({ id: "recommendation.filtering.title" })}</h3>
            {intl.formatMessage({ id: "recommendation.filtering.message" })}
            <br />
            <Button
                className="gd-button-secondary s-apply-filtering"
                value={intl.formatMessage({ id: "recommendation.filtering.action" })}
                onClick={onApply}
            />
        </Recommendation>
    );
}
