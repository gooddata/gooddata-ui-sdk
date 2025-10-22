// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { useQualityActions, useQualityState } from "./QualityContext.js";
import { QualityScoreCardMenu } from "./QualityScoreCardMenu.js";
import { QualityScoreCardScore } from "./QualityScoreCardScore.js";

export function QualityScoreCard() {
    const intl = useIntl();
    const { qualityIssues, qualityIssuesCalculation } = useQualityState();
    const { createQualityIssuesCalculation } = useQualityActions();

    const isLoading =
        qualityIssues.status === "pending" ||
        qualityIssues.status === "loading" ||
        qualityIssuesCalculation.status === "loading";

    return (
        <div className="gd-analytics-catalog__quality-score-card">
            <span className="gd-analytics-catalog__quality-score-card__title">
                {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.title" })}
            </span>
            <QualityScoreCardMenu intl={intl} onRunCheck={createQualityIssuesCalculation} />
            <QualityScoreCardScore issues={qualityIssues.issues} isLoading={isLoading} />
        </div>
    );
}
