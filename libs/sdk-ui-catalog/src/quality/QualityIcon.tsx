// (C) 2025 GoodData Corporation

import { type ComponentProps, memo } from "react";

import cx from "classnames";
import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import {
    type Identifier,
    SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";
import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useQualityIssuesMapGroupedByCode } from "./QualityContext.js";

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
    const issueMap = useQualityIssuesMapGroupedByCode(objectId);

    if (!issueMap?.size) {
        return null;
    }

    return (
        <div {...htmlProps} className={cx("gd-analytics-catalog__quality-tooltip", className)}>
            <UiTooltip
                arrowPlacement="left"
                optimalPlacement
                triggerBy={["hover"]}
                anchor={<UiIcon type="warning" color="warning" size={14} backgroundSize={26} ariaHidden />}
                content={
                    <div className="gd-analytics-catalog__quality-tooltip__content">
                        <div>
                            {intl.formatMessage(
                                { id: "analyticsCatalog.quality.tooltip.title" },
                                { count: issueMap.size },
                            )}
                        </div>
                        <ul>
                            {Array.from(issueMap.entries()).map(([code, issues]) => {
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
