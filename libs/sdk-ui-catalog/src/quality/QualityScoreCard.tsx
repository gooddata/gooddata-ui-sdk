// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { LoadingComponent } from "@gooddata/sdk-ui";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { useQualityActions, useQualityState } from "./QualityContext.js";
import { QualityScoreCardMenu } from "./QualityScoreCardMenu.js";

export function QualityScoreCard() {
    const intl = useIntl();
    const { qualityIssues, qualityIssuesCalculation } = useQualityState();
    const { createQualityIssuesCalculation } = useQualityActions();

    const issueCount = qualityIssues.issues.length;
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
            <div className="gd-analytics-catalog__quality-score-card__score">
                {isLoading ? (
                    <LoadingComponent />
                ) : (
                    <>
                        <span>{issueCount}</span>
                        {issueCount > 0 ? (
                            <UiIcon type="warning" color="warning" size={14} ariaHidden />
                        ) : (
                            <UiIcon type="checkCircle" color="success" size={14} ariaHidden />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
