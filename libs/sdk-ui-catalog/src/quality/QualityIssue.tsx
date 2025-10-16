// (C) 2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, type MessageDescriptor, defineMessages } from "react-intl";

import {
    type ISemanticQualityIssue,
    type Identifier,
    type SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { ObjectTypeIconMemo, mapObjectType } from "../objectType/index.js";

type Props = {
    issue: ISemanticQualityIssue;
    objectId: Identifier;
    objectTitle: string;
};

const titleMessages: { [key in SemanticQualityIssueCode]?: MessageDescriptor } = defineMessages({
    [SemanticQualityIssueCodeValues.IDENTICAL_TITLE]: {
        id: "analyticsCatalog.quality.title.identicalTitle",
    },
    [SemanticQualityIssueCodeValues.IDENTICAL_DESCRIPTION]: {
        id: "analyticsCatalog.quality.title.identicalDescription",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_TITLE]: {
        id: "analyticsCatalog.quality.title.similarTitle",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_DESCRIPTION]: {
        id: "analyticsCatalog.quality.title.similarDescription",
    },
    [SemanticQualityIssueCodeValues.UNKNOWN_ABBREVIATION]: {
        id: "analyticsCatalog.quality.title.unknownAbbreviation",
    },
});

const descriptionMessages: { [key in SemanticQualityIssueCode]?: MessageDescriptor } = defineMessages({
    [SemanticQualityIssueCodeValues.IDENTICAL_TITLE]: {
        id: "analyticsCatalog.quality.description.identicalTitle",
    },
    [SemanticQualityIssueCodeValues.IDENTICAL_DESCRIPTION]: {
        id: "analyticsCatalog.quality.description.identicalDescription",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_TITLE]: {
        id: "analyticsCatalog.quality.description.similarTitle",
    },
    [SemanticQualityIssueCodeValues.SIMILAR_DESCRIPTION]: {
        id: "analyticsCatalog.quality.description.similarDescription",
    },
    [SemanticQualityIssueCodeValues.UNKNOWN_ABBREVIATION]: {
        id: "analyticsCatalog.quality.description.unknownAbbreviation",
    },
});

export function QualityIssue({ issue, objectId, objectTitle }: Props) {
    const titleMessage = titleMessages[issue.code];
    const descriptionMessage = descriptionMessages[issue.code];

    if (!titleMessage || !descriptionMessage) {
        return null;
    }

    // Exclude the current object from the list
    const objects = issue.objects.filter((obj) => obj.identifier !== objectId);

    return (
        <div className="gd-analytics-catalog__quality-issue">
            <UiIcon type="warning" color="warning" size={20} ariaHidden backgroundColor="complementary-0" />
            <div className="gd-analytics-catalog__quality-issue__title">
                <FormattedMessage {...titleMessage} />
            </div>
            <div className="gd-analytics-catalog__quality-issue__description">
                <FormattedMessage
                    {...descriptionMessage}
                    values={{
                        title: objectTitle,
                        abbreviation: issue.detail.abbreviation,
                        objects: objects.map((obj, idx) => {
                            const type = obj.type ? mapObjectType(obj.type) : undefined;
                            return (
                                <span
                                    key={idx}
                                    className="gd-analytics-catalog__quality-issue__description__object"
                                >
                                    {type ? <ObjectTypeIconMemo type={type} size={18} /> : null}
                                    <span
                                        className={cx(
                                            "gd-analytics-catalog__object-type",
                                            "gd-analytics-catalog__quality-issue__description__object__identifier",
                                        )}
                                        data-object-type={type}
                                    >
                                        {obj.identifier}
                                    </span>
                                    {idx === objects.length - 1 ? "." : ", "}
                                </span>
                            );
                        }),
                        u: (chunks) => <u>{chunks}</u>,
                    }}
                />
            </div>
        </div>
    );
}
