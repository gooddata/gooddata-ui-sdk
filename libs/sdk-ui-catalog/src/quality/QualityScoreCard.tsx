// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { useQualityActions, useQualityState } from "./QualityContext.js";
import { QualityScoreCardAction } from "./QualityScoreCardAction.js";
import { QualityScoreCardDate } from "./QualityScoreCardDate.js";
import { QualityScoreCardMenu } from "./QualityScoreCardMenu.js";
import { QualityScoreCardScore } from "./QualityScoreCardScore.js";
import { getQualityIssueCodes } from "./utils.js";
import { useFilterActions } from "../filter/index.js";

export function QualityScoreCard() {
    const intl = useIntl();
    const { status, issues, updatedAt } = useQualityState();
    const { createQualityIssuesCalculation } = useQualityActions();
    const { setQualityCodes } = useFilterActions();

    const isLoading = status === "pending" || status === "loading";

    const handleActionClick = () => {
        const codes = getQualityIssueCodes(issues);
        setQualityCodes({ values: codes, isInverted: false });
    };

    const handleRunCheck = () => {
        setQualityCodes({ values: [], isInverted: true });
        createQualityIssuesCalculation();
    };

    return (
        <div className="gd-analytics-catalog__quality-score-card">
            <span className="gd-analytics-catalog__quality-score-card__title">
                {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.title" })}
            </span>
            <QualityScoreCardMenu intl={intl} onRunCheck={handleRunCheck} />
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
