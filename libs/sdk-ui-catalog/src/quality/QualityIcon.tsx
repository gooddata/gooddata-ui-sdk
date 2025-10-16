// (C) 2025 GoodData Corporation

import { type ComponentProps, memo } from "react";

import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import { SemanticQualityIssueCode, SemanticQualityIssueCodeValues } from "@gooddata/sdk-model";
import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useQualityIssuesMapGroupedByCode } from "./QualityContext.js";
import { ICatalogItem } from "../catalogItem/index.js";

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
    item: ICatalogItem;
};

export function QualityIcon({ item, intl, ...htmlProps }: Props) {
    const issueMap = useQualityIssuesMapGroupedByCode(item.identifier);

    if (!issueMap?.size) {
        return null;
    }

    return (
        <div {...htmlProps}>
            <UiTooltip
                arrowPlacement="left"
                optimalPlacement
                triggerBy={["hover"]}
                anchor={<UiIcon type="warning" color="warning" size={14} backgroundSize={26} ariaHidden />}
                content={
                    <>
                        {Array.from(issueMap.entries()).map(([code, issues]) => {
                            const message = messages[code];
                            if (!message) {
                                return null;
                            }
                            return (
                                <div key={code}>{intl.formatMessage(message, { count: issues.length })}</div>
                            );
                        })}
                    </>
                }
            />
        </div>
    );
}

export const QualityIconMemo = memo(QualityIcon);
