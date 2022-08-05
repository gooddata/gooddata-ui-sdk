// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader";
import { AttributeDisplayFormParameterDetail } from "../ParameterDetails/AttributeDisplayFormParameterDetail";
import { Parameter } from "./Parameter";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IParametersPanelSectionsCommonProps } from "../types";
import { IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { AttributeDisplayFormType } from "../../../types";
import { selectAllCatalogAttributesMap, useDashboardSelector } from "../../../../../model";

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
                    type={item.displayFormType}
                    projectId={projectId}
                    displayFormRef={item.ref}
                    showValues={true} // TODO
                />
            }
            iconClassName={getDisplayFormIcon(item.displayFormType)}
            onAdd={() => onAdd(`{attribute_title(${item.id})}`)}
            intl={intl}
        />
    );
};

const getDisplayFormIcon = (type: string | undefined) => {
    switch (type) {
        case AttributeDisplayFormType.HYPERLINK:
            return "gd-icon-hyperlink-warning";
        case AttributeDisplayFormType.GEO_PUSHPIN:
            return "gd-icon-earth";
        default:
            return "gd-icon-label-warning";
    }
};

export interface IInsightParametersSectionProps extends IParametersPanelSectionsCommonProps {
    attributeDisplayForms?: IAttributeDisplayFormMetadataObject[];
    loadingAttributeDisplayForms: boolean;
}

export const InsightParametersSection: React.FC<IInsightParametersSectionProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    onAdd,
}) => {
    return (
        <>
            {((attributeDisplayForms && attributeDisplayForms.length > 0) ||
                loadingAttributeDisplayForms) && (
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
                            <ParameterX key={item.id} item={item} onAdd={onAdd} />
                        ))
                    )}
                </>
            )}
        </>
    );
};
