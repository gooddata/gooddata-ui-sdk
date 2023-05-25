// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, defineMessages } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { ProjectIdParameterDetail } from "../ParameterDetails/ProjectIdParameterDetail.js";
import { DashboardIdParameterDetail } from "../ParameterDetails/DashboardIdParameterDetail.js";
import { WidgetIdParameterDetail } from "../ParameterDetails/WidgetIdParameterDetail.js";
import { InsightIdParameterDetail } from "../ParameterDetails/InsightIdParameterDetail.js";
import { ClientIdParameterDetail } from "../ParameterDetails/ClientIdParameterDetail.js";
import { DataProductIdParameterDetail } from "../ParameterDetails/DataProductIdParameterDetail.js";
import { Parameter } from "./Parameter.js";
import { IIdentifierParametersSectionProps } from "../types.js";
import {
    DRILL_TO_URL_PLACEHOLDER,
    selectEnableRenamingProjectToWorkspace,
    useDashboardSelector,
} from "../../../../../model/index.js";

interface IIdentifierParameter {
    titleIntlKey: string;
    placeholder: string;
}

const identifierParametersMessages = defineMessages({
    insightIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.insightIdParameterLabel" },
    widgetIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.widgetIdParameterLabel" },
    dashboardIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.dashboardIdParameterLabel" },
    projectIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.projectIdParameterLabel" },
    workspaceIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.workspaceIdParameterLabel" },
    clientIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.clientIdParameterLabel" },
    dataProductIdParameterLabel: { id: "configurationPanel.drillIntoUrl.editor.dataProductIdParameterLabel" },
});

const identifierParametersSection: IIdentifierParameter[] = [
    {
        titleIntlKey: identifierParametersMessages.insightIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.INSIGHT_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.widgetIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.WIDGET_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.dashboardIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.DASHBOARD_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.projectIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.PROJECT_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.workspaceIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.WORKSPACE_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.clientIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.CLIENT_ID,
    },
    {
        titleIntlKey: identifierParametersMessages.dataProductIdParameterLabel.id,
        placeholder: DRILL_TO_URL_PLACEHOLDER.DATA_PRODUCT_ID,
    },
];

const getDetailContent = (type: string, title: string): JSX.Element => {
    switch (type) {
        case DRILL_TO_URL_PLACEHOLDER.PROJECT_ID:
        case DRILL_TO_URL_PLACEHOLDER.WORKSPACE_ID:
            return <ProjectIdParameterDetail title={title} />;
        case DRILL_TO_URL_PLACEHOLDER.DASHBOARD_ID:
            return <DashboardIdParameterDetail title={title} />;
        case DRILL_TO_URL_PLACEHOLDER.WIDGET_ID:
            return <WidgetIdParameterDetail title={title} />;
        case DRILL_TO_URL_PLACEHOLDER.INSIGHT_ID:
            return <InsightIdParameterDetail title={title} />;
        case DRILL_TO_URL_PLACEHOLDER.CLIENT_ID:
            return <ClientIdParameterDetail title={title} />;
        case DRILL_TO_URL_PLACEHOLDER.DATA_PRODUCT_ID:
            return <DataProductIdParameterDetail title={title} />;
        default:
            return <></>;
    }
};

export const IdentifierParametersSection: React.FC<IIdentifierParametersSectionProps> = ({
    enableClientIdParameter,
    enableDataProductIdParameter,
    enableWidgetIdParameter,
    onAdd,
    intl,
}) => {
    const enableRenamingProjectToWorkspace = useDashboardSelector(selectEnableRenamingProjectToWorkspace);

    return (
        <>
            <DropdownSectionHeader>
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.identifierParametersSectionLabel" />
            </DropdownSectionHeader>
            {identifierParametersSection
                .filter(
                    ({ placeholder }) =>
                        placeholder !== DRILL_TO_URL_PLACEHOLDER.CLIENT_ID || enableClientIdParameter,
                )
                .filter(
                    ({ placeholder }) =>
                        placeholder !== DRILL_TO_URL_PLACEHOLDER.WIDGET_ID || enableWidgetIdParameter,
                )
                .filter(
                    ({ placeholder }) =>
                        placeholder !== DRILL_TO_URL_PLACEHOLDER.DATA_PRODUCT_ID ||
                        enableDataProductIdParameter,
                )
                .filter(
                    ({ placeholder }) =>
                        placeholder !==
                        (enableRenamingProjectToWorkspace
                            ? DRILL_TO_URL_PLACEHOLDER.PROJECT_ID
                            : DRILL_TO_URL_PLACEHOLDER.WORKSPACE_ID),
                )
                .map(({ placeholder, titleIntlKey }) => {
                    const title = intl.formatMessage({ id: titleIntlKey });
                    return (
                        <Parameter
                            key={placeholder}
                            name={title}
                            detailContent={getDetailContent(placeholder, title)}
                            iconClassName="gd-icon-sharp"
                            onAdd={() => onAdd(placeholder)}
                            intl={intl}
                        />
                    );
                })}
        </>
    );
};
