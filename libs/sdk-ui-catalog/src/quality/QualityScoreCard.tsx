// (C) 2025-2026 GoodData Corporation

import { useId } from "react";

import { useIntl } from "react-intl";

import { useQualityActions, useQualityState } from "./QualityContext.js";
import { QualityScoreCardAction } from "./QualityScoreCardAction.js";
import { QualityScoreCardAnnouncements } from "./QualityScoreCardAnnouncements.js";
import { QualityScoreCardDate } from "./QualityScoreCardDate.js";
import { QualityScoreCardMenu } from "./QualityScoreCardMenu.js";
import { QualityScoreCardScore } from "./QualityScoreCardScore.js";
import { getQualityIssueCodes } from "./utils.js";
import { useFilterActions } from "../filter/FilterContext.js";

export function QualityScoreCard() {
    const intl = useIntl();
    const id = useId();
    const titleId = `quality-score-card-title/${id}`;
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
        <section
            className="gd-analytics-catalog__quality-score-card"
            aria-labelledby={titleId}
            aria-busy={isLoading}
        >
            <h3 id={titleId} className="gd-analytics-catalog__quality-score-card__title">
                {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.title" })}
            </h3>
            <QualityScoreCardAnnouncements isLoading={isLoading} />
            <QualityScoreCardMenu intl={intl} onRunCheck={handleRunCheck} isLoading={isLoading} />
            <QualityScoreCardScore issues={issues} isLoading={isLoading} />
            <QualityScoreCardAction
                intl={intl}
                isEmpty={issues.length === 0}
                isLoading={isLoading}
                onActionClick={handleActionClick}
            />
            {updatedAt ? <QualityScoreCardDate date={updatedAt} locale={intl.locale} /> : null}
        </section>
    );
}
