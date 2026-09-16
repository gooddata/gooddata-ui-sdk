// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import {
    type IAttributeDisplayFormMetadataObject,
    type ISemanticConditionalFormatting,
    type ISeparators,
    type ObjRef,
} from "@gooddata/sdk-model";
import { sortShareableLabels } from "@gooddata/sdk-ui-ext";

import {
    CatalogDetailConditionalFormattingControl,
    labelTargetOption,
} from "./CatalogDetailConditionalFormatting.js";
import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";

export interface ICatalogDetailAttributeLabelsConditionalFormattingProps {
    labels: IAttributeDisplayFormMetadataObject[];
    canEdit: boolean;
    onLabelConditionalFormattingChange: (
        labelRef: ObjRef,
        conditionalFormatting: ISemanticConditionalFormatting | undefined,
    ) => void;
    separators?: ISeparators;
}

/**
 * One "Conditional formatting" row listing the attribute's labels, primary label first.
 */
export function CatalogDetailAttributeLabelsConditionalFormatting({
    labels,
    canEdit,
    onLabelConditionalFormattingChange,
    separators,
}: ICatalogDetailAttributeLabelsConditionalFormattingProps) {
    if (labels.length === 0) {
        return null;
    }

    return (
        <CatalogDetailContentRow
            title={<FormattedMessage id="analyticsCatalog.column.title.conditionalFormatting" />}
            alignTop
            content={
                <div className="gd-analytics-catalog-detail__cf-labels">
                    {sortShareableLabels(labels).map((label) => (
                        <div key={label.id} className="gd-analytics-catalog-detail__cf-label">
                            <span className="gd-analytics-catalog-detail__cf-label-title">{label.title}</span>
                            <CatalogDetailConditionalFormattingControl
                                targetOption={labelTargetOption(label)}
                                conditionalFormatting={label.conditionalFormatting}
                                canEdit={canEdit}
                                onConditionalFormattingChange={(conditionalFormatting) => {
                                    onLabelConditionalFormattingChange(label.ref, conditionalFormatting);
                                }}
                                separators={separators}
                            />
                        </div>
                    ))}
                </div>
            }
        />
    );
}
