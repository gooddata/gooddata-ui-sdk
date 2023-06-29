// (C) 2020-2023 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { AttributeDisplayFormParameterDetail } from "../ParameterDetails/AttributeDisplayFormParameterDetail.js";
import { Parameter } from "./Parameter.js";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAttributeWithDisplayForm, IParametersPanelSectionsCommonProps } from "../types.js";
import { AttributeDisplayFormType, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { selectAllCatalogAttributesMap, useDashboardSelector } from "../../../../../model/index.js";

interface XProps {
    item: IAttributeDisplayFormMetadataObject;
    onAdd: (placeholder: string) => void;
}

const ParameterX: React.FC<XProps> = ({ item, onAdd }) => {
    const x = useDashboardSelector(selectAllCatalogAttributesMap);
    const y = x.get(item.attribute);
    const intl = useIntl();
    const projectId = useWorkspaceStrict();

    return (
        <Parameter
            key={item.id}
            name={y?.attribute.title || ""}
            description={item.title}
            detailContent={
                <AttributeDisplayFormParameterDetail
                    title={y?.attribute.title || ""}
                    label={item.title}
                    type={item.displayFormType as AttributeDisplayFormType}
                    projectId={projectId}
                    displayFormRef={item.ref}
                    showValues={true} // TODO
                />
            }
            iconClassName={getDisplayFormIcon(item.displayFormType as AttributeDisplayFormType)}
            onAdd={() => onAdd(`{attribute_title(${item.id})}`)}
            intl={intl}
        />
    );
};

const getDisplayFormIcon = (type: AttributeDisplayFormType | undefined) => {
    switch (type) {
        case "GDC.link":
            return "gd-icon-hyperlink-warning";
        case "GDC.geo.pin":
        case "GDC.geo.pin_latitude":
        case "GDC.geo.pin_longitude":
            return "gd-icon-earth";
        default:
            return "gd-icon-label-warning";
    }
};

export interface IInsightParametersSectionProps extends IParametersPanelSectionsCommonProps {
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    loadingAttributeDisplayForms: boolean;
}

export const InsightParametersSection: React.FC<IInsightParametersSectionProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    onAdd,
}) => {
    return (
        <>
            {(attributeDisplayForms && attributeDisplayForms.length > 0) || loadingAttributeDisplayForms ? (
                <>
                    <DropdownSectionHeader>
                        <FormattedMessage id="configurationPanel.drillIntoUrl.editor.insightParametersSectionLabel" />
                    </DropdownSectionHeader>
                    {loadingAttributeDisplayForms ? (
                        <div className="gd-drill-to-url-section-loading s-drill-to-custom-url-attr-section-loading">
                            <div className="gd-spinner small" />
                        </div>
                    ) : (
                        attributeDisplayForms?.map((item) => (
                            <ParameterX key={item.displayForm.id} item={item.displayForm} onAdd={onAdd} />
                        ))
                    )}
                </>
            ) : null}
        </>
    );
};
