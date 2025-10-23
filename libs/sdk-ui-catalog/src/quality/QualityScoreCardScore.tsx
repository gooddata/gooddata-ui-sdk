// (C) 2025 GoodData Corporation

import type { ISemanticQualityIssue } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { QualitySeverityIcon } from "./QualitySeverityIcon.js";
import { groupQualityIssuesBySeverity } from "./utils.js";

type Props = {
    issues: ISemanticQualityIssue[];
    isLoading: boolean;
};

export function QualityScoreCardScore({ issues, isLoading }: Props) {
    const severityGroup = groupQualityIssuesBySeverity(issues);
    const totalCount = issues.length;

    return (
        <div className="gd-analytics-catalog__quality-score-card__score">
            {isLoading ? (
                <LoadingComponent className="gd-analytics-catalog__quality-score-card__score__loading" />
            ) : totalCount > 0 ? (
                [...severityGroup].map(([severity, issues]) => {
                    if (issues.length === 0) {
                        return null;
                    }
                    return (
                        <div key={severity} className="gd-analytics-catalog__quality-score-card__score__item">
                            {issues.length}
                            <QualitySeverityIcon severity={severity} size={14} />
                        </div>
                    );
                })
            ) : (
                <div className="gd-analytics-catalog__quality-score-card__score__item">
                    {totalCount}
                    <UiIcon type="checkCircle" color="success" size={14} ariaHidden />
                </div>
            )}
        </div>
    );
}
