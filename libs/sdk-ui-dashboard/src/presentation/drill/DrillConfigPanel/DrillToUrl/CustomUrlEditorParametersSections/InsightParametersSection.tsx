// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

import { DropdownSectionHeader } from "../DropdownSectionHeader";
import { IParametersPanelSectionsCommonProps } from "../CustomUrlEditorParameters";
import { AttributeDisplayFormParameterDetail } from "../ParameterDetails/AttributeDisplayFormParameterDetail";

import { Parameter } from "./Parameter";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { AttributeDisplayFormType, IAttributeDisplayForm } from "../../../../types";

const getDisplayFormIcon = (type: AttributeDisplayFormType) => {
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
    attributeDisplayForms: IAttributeDisplayForm[];
    loadingAttributeDisplayForms: boolean;
}

export const InsightParametersSection: React.FC<IInsightParametersSectionProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    onAdd,
    intl,
}) => {
    const projectId = useWorkspaceStrict();

    return (
        <>
            {(attributeDisplayForms.length > 0 || loadingAttributeDisplayForms) && (
                <>
                    <DropdownSectionHeader>
                        <FormattedMessage id="configurationPanel.drillIntoUrl.editor.insightParametersSectionLabel" />
                    </DropdownSectionHeader>
                    {loadingAttributeDisplayForms ? (
                        <div className="gd-drill-to-url-section-loading s-drill-to-custom-url-attr-section-loading">
                            <div className="gd-spinner small" />
                        </div>
                    ) : (
                        attributeDisplayForms.map(
                            ({ attributeTitle, displayFormTitle, type, identifier, ref }) => (
                                <Parameter
                                    key={identifier}
                                    name={attributeTitle}
                                    description={displayFormTitle}
                                    detailContent={
                                        <AttributeDisplayFormParameterDetail
                                            title={attributeTitle}
                                            label={displayFormTitle}
                                            type={type}
                                            projectId={projectId}
                                            displayFormRef={ref}
                                        />
                                    }
                                    iconClassName={getDisplayFormIcon(type)}
                                    onAdd={() => onAdd(`{attribute_title(${identifier})}`)}
                                    intl={intl}
                                />
                            ),
                        )
                    )}
                </>
            )}
        </>
    );
};
