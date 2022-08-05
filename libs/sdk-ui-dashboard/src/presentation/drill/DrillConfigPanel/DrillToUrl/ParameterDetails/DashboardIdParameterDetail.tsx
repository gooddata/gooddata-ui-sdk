// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ParameterDetail } from "./ParameterDetail";
import { useIntl } from "react-intl";
import { selectDashboardId, useDashboardSelector } from "../../../../../model";

interface IdentifierDetailProps {
    title: string;
}

export const DashboardIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const value = useDashboardSelector(selectDashboardId);
    const intl = useIntl();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={value ? [value] : []}
        />
    );
};
