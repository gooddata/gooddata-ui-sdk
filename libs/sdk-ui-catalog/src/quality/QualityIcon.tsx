// (C) 2025 GoodData Corporation

import { type ComponentProps, memo } from "react";

import cx from "classnames";
import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import {
    type Identifier,
    SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";
import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { useQualityIssuesById } from "./QualityContext.js";
import { QualitySeverityIcon } from "./QualitySeverityIcon.js";
import { getQualityIssuesHighestSeverity, groupQualityIssuesByCode } from "./utils.js";

const messages: { [key in SemanticQualityIssueCode]?: MessageDescriptor } = defineMessages({
    [SemanticQualityIssueCodeValues.IDENTICAL_TITLE]: {
        id: "analyticsCatalog.quality.tooltip.identicalTitle",
    },
    [SemanticQualityIssueCodeValues.IDENTICAL_DESCRIPTION]: {
        id: "analyticsCatalog.quality.tooltip.identicalDescription",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_TITLE]: {
        id: "analyticsCatalog.quality.tooltip.similarTitle",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_DESCRIPTION]: {
        id: "analyticsCatalog.quality.tooltip.similarDescription",
    },
    [SemanticQualityIssueCodeValues.UNKNOWN_ABBREVIATION]: {
        id: "analyticsCatalog.quality.tooltip.unknownAbbreviation",
    },
});

type Props = ComponentProps<"div"> & {
    intl: IntlShape;
    objectId: Identifier;
};

export function QualityIcon({ objectId, intl, className, ...htmlProps }: Props) {
    const issues = useQualityIssuesById(objectId);

    if (!issues?.length) {
        return null;
    }

    const codeGroup = groupQualityIssuesByCode(issues);
    const severity = getQualityIssuesHighestSeverity(issues);

    return (
        <div {...htmlProps} className={cx("gd-analytics-catalog__quality-tooltip", className)}>
            <UiTooltip
                arrowPlacement="top"
                optimalPlacement
                triggerBy={["hover"]}
                anchor={<QualitySeverityIcon severity={severity} size={14} backgroundSize={26} />}
                content={
                    <div className="gd-analytics-catalog__quality-tooltip__content">
                        <div>
                            {intl.formatMessage(
                                { id: "analyticsCatalog.quality.tooltip.title" },
                                { count: codeGroup.size },
                            )}
                        </div>
                        <ul>
                            {[...codeGroup].map(([code, issues]) => {
                                const message = messages[code];
                                if (!message) {
                                    return null;
                                }
                                return (
                                    <li key={code}>
                                        {intl.formatMessage(message, { count: issues.length })}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                }
            />
        </div>
    );
}

export const QualityIconMemo = memo(QualityIcon);
