// (C) 2025 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import {
    type ISemanticQualityIssue,
    type Identifier,
    type SemanticQualityIssueAttributeName,
    type SemanticQualityIssueCode,
    SemanticQualityIssueCodeValues,
} from "@gooddata/sdk-model";
import { UiButton } from "@gooddata/sdk-ui-kit";

import { QualityIssueObjects } from "./QualityIssueObjects.js";
import { QualitySeverityIcon } from "./QualitySeverityIcon.js";
import { type ICatalogItemRef } from "../catalogItem/index.js";

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

type Props = {
    issue: ISemanticQualityIssue;
    objectId: Identifier;
    canEdit: boolean;
    onEditClick?: (attributeName: SemanticQualityIssueAttributeName) => void;
    onObjectClick?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

export function QualityIssue({ issue, objectId, canEdit, onEditClick, onObjectClick }: Props) {
    const intl = useIntl();
    const titleMessage = titleMessages[issue.code];
    const descriptionMessage = descriptionMessages[issue.code];

    if (!titleMessage || !descriptionMessage) {
        return null;
    }

    // Exclude the current object from the list
    const objects = issue.objects.filter((obj) => obj.identifier !== objectId);

    // Do not show objects for unknown abbreviation issue
    const showObjects = issue.code !== SemanticQualityIssueCodeValues.UNKNOWN_ABBREVIATION;

    function handleEditClick() {
        if (canEdit && onEditClick && issue.detail.attributeName) {
            onEditClick(issue.detail.attributeName);
        }
    }

    return (
        <div className="gd-analytics-catalog__quality-issue">
            <QualitySeverityIcon severity={issue.severity} size={14} backgroundColor="complementary-0" />
            <div className="gd-analytics-catalog__quality-issue__title">
                <FormattedMessage {...titleMessage} />
            </div>
            {canEdit ? (
                <UiButton
                    label={intl.formatMessage(
                        { id: "analyticsCatalog.quality.issue.edit" },
                        { attributeName: issue.detail.attributeName },
                    )}
                    onClick={handleEditClick}
                />
            ) : null}
            <div className="gd-analytics-catalog__quality-issue__separator" />
            <div className="gd-analytics-catalog__quality-issue__description">
                <FormattedMessage
                    {...descriptionMessage}
                    values={{
                        abbreviation: issue.detail.abbreviation,
                        u: (chunks) => <u>{chunks}</u>,
                        count: objects.length,
                    }}
                />
            </div>
            {showObjects ? <QualityIssueObjects objects={objects} onObjectClick={onObjectClick} /> : null}
        </div>
    );
}
