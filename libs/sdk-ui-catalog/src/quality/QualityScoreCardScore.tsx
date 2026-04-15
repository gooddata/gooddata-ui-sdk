// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import type { ISemanticQualityIssue } from "@gooddata/sdk-model";
import { LoadingSpinner, UiIcon } from "@gooddata/sdk-ui-kit";

import { QualitySeverityIcon } from "./QualitySeverityIcon.js";
import { groupQualityIssuesBySeverity } from "./utils.js";

type Props = {
    issues: ISemanticQualityIssue[];
    isLoading: boolean;
    isError: boolean;
};

export function QualityScoreCardScore({ issues, isLoading, isError }: Props) {
    const severityGroup = groupQualityIssuesBySeverity(issues);
    const intl = useIntl();
    const totalCount = issues.length;

    return (
        <div className={cx("gd-analytics-catalog__quality-score-card__score", { "with-error": isError })}>
            {isError ? (
                <div className="gd-analytics-catalog__quality-score-card__score__error">
                    <strong>
                        {intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.checkFailed" })}
                    </strong>
                    <div>
                        {intl.formatMessage({
                            id: "analyticsCatalog.quality.scoreCard.checkFailed.description",
                        })}
                    </div>
                </div>
            ) : isLoading ? (
                <LoadingSpinner className="gd-analytics-catalog__quality-score-card__score__loading" />
            ) : totalCount > 0 ? (
                [...severityGroup].map(([severity, issues]) => {
                    if (issues.length === 0) {
                        return null;
                    }
                    return (
                        <div key={severity} className="gd-analytics-catalog__quality-score-card__score__item">
                            {issues.length}
                            <QualitySeverityIcon severity={severity} count={issues.length} size={14} />
                        </div>
                    );
                })
            ) : (
                <div className="gd-analytics-catalog__quality-score-card__score__item" aria-hidden="true">
                    {totalCount}
                    <UiIcon type="checkCircle" color="success" size={14} />
                </div>
            )}
        </div>
    );
}
