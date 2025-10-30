// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { useQualityActions, useQualityState } from "./QualityContext.js";
import { QualityScoreCardAction } from "./QualityScoreCardAction.js";
import { QualityScoreCardDate } from "./QualityScoreCardDate.js";
import { QualityScoreCardMenu } from "./QualityScoreCardMenu.js";
import { QualityScoreCardScore } from "./QualityScoreCardScore.js";
import { useFilterActions } from "../filter/index.js";

export function QualityScoreCard() {
    const intl = useIntl();
    const { status, issues, updatedAt } = useQualityState();
    const { createQualityIssuesCalculation } = useQualityActions();
    const { setQualityIds } = useFilterActions();

    const isLoading = status === "pending" || status === "loading";

    const handleActionClick = () => {
        const idSet: Set<string> = new Set();
        for (const issue of issues) {
            for (const obj of issue.objects) {
                idSet.add(obj.identifier);
            }
        }
        setQualityIds([...idSet]);
    };

    return (
        <div className="gd-analytics-catalog__quality-score-card">
            <span className="gd-analytics-catalog__quality-score-card__title">
                {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.title" })}
            </span>
            <QualityScoreCardMenu intl={intl} onRunCheck={createQualityIssuesCalculation} />
            <QualityScoreCardScore issues={issues} isLoading={isLoading} />
            <QualityScoreCardAction
                intl={intl}
                isEmpty={issues.length === 0}
                isLoading={isLoading}
                onActionClick={handleActionClick}
            />
            {updatedAt ? <QualityScoreCardDate date={updatedAt} locale={intl.locale} /> : null}
        </div>
    );
}
