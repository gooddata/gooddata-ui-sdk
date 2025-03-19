// (C) 2020-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { IdentifierParametersSection } from "./CustomUrlEditorParametersSections/IdentifierParametersSection.js";
import {
    IInsightParametersSectionProps,
    InsightParametersSection,
} from "./CustomUrlEditorParametersSections/InsightParametersSection.js";
import { IIdentifierParametersSectionProps } from "./types.js";
import {
    DashboardParametersSection,
    IDashboardParametersSectionProps,
} from "./CustomUrlEditorParametersSections/DashboardParametersSection.js";

type IParametersPanelProps = IInsightParametersSectionProps &
    IIdentifierParametersSectionProps &
    IDashboardParametersSectionProps;

export const ParametersPanel: React.FC<IParametersPanelProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    enableClientIdParameter,
    enableDataProductIdParameter,
    enableWidgetIdParameter,
    onAdd,
    intl,
    dashboardFilters,
    attributeFilterConfigs,
    insightFilters,
    widgetRef,
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
                insightFilters={insightFilters}
            />
            <DashboardParametersSection
                intl={intl}
                onAdd={onAdd}
                dashboardFilters={dashboardFilters}
                attributeFilterConfigs={attributeFilterConfigs}
            />
            <IdentifierParametersSection
                enableClientIdParameter={enableClientIdParameter}
                enableDataProductIdParameter={enableDataProductIdParameter}
                enableWidgetIdParameter={enableWidgetIdParameter}
                onAdd={onAdd}
                intl={intl}
                widgetRef={widgetRef}
            />
        </div>
    </div>
);
