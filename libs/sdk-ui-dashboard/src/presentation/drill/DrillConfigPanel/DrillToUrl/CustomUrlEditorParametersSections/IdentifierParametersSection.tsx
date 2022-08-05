// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader";
import { ProjectIdParameterDetail } from "../ParameterDetails/ProjectIdParameterDetail";
import { DashboardIdParameterDetail } from "../ParameterDetails/DashboardIdParameterDetail";
import { WidgetIdParameterDetail } from "../ParameterDetails/WidgetIdParameterDetail";
import { InsightIdParameterDetail } from "../ParameterDetails/InsightIdParameterDetail";
import { ClientIdParameterDetail } from "../ParameterDetails/ClientIdParameterDetail";
import { DataProductIdParameterDetail } from "../ParameterDetails/DataProductIdParameterDetail";
import { Parameter } from "./Parameter";
import { DRILL_TO_URL_PLACEHOLDER } from "../../../../../model/commandHandlers/drill/resolveDrillToCustomUrl";
import { IIdentifierParametersSectionProps } from "../types";

interface IIdentifierParameter {
    titleIntlKey: string;
    placeholder: string;
}

const identifierParametersSection: IIdentifierParameter[] = [
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.insightIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.INSIGHT_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.widgetIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.WIDGET_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.dashboardIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.DASHBOARD_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.projectIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.PROJECT_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.workspaceIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.WORKSPACE_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.clientIdParameterLabel",
        placeholder: DRILL_TO_URL_PLACEHOLDER.CLIENT_ID,
    },
    {
        titleIntlKey: "configurationPanel.drillIntoUrl.editor.dataProductIdParameterLabel",
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
    const enableRenamingProjectToWorkspace = false; // TODO: use translation with | maybe?

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
