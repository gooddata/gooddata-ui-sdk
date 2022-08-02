// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, IntlShape } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    IdentifierParametersSection,
    IIdentifierParametersSectionProps,
} from "./CustomUrlEditorParametersSections/IdentifierParametersSection";
import {
    IInsightParametersSectionProps,
    InsightParametersSection,
} from "./CustomUrlEditorParametersSections/InsightParametersSection";

export interface IParametersPanelSectionsCommonProps {
    onAdd: (placeholder: string) => void;
    intl: IntlShape;
}

type IParametersPanelProps = IInsightParametersSectionProps & IIdentifierParametersSectionProps;

export const ParametersPanel: React.FC<IParametersPanelProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    enableClientIdParameter,
    enableDataProductIdParameter,
    enableWidgetIdParameter,
    onAdd,
    intl,
}) => (
    <div>
        <label className="gd-label">
            <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parametersPanelLabel" />
            <BubbleHoverTrigger className="gd-list-item-tooltip" showDelay={0} hideDelay={0}>
                <span className="gd-icon-circle-question gd-list-item-tooltip-icon" />
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                    <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parametersPanelTooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </label>
        <div className="gd-drill-to-url-parameters gd-drill-to-url-list">
            <InsightParametersSection
                attributeDisplayForms={attributeDisplayForms}
                loadingAttributeDisplayForms={loadingAttributeDisplayForms}
                onAdd={onAdd}
                intl={intl}
            />
            <IdentifierParametersSection
                enableClientIdParameter={enableClientIdParameter}
                enableDataProductIdParameter={enableDataProductIdParameter}
                enableWidgetIdParameter={enableWidgetIdParameter}
                onAdd={onAdd}
                intl={intl}
            />
        </div>
    </div>
);
