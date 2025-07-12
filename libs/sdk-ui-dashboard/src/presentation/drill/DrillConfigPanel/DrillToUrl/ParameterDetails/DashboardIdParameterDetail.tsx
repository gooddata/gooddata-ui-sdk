// (C) 2020-2025 GoodData Corporation
import { ParameterDetail } from "./ParameterDetail.js";
import { useIntl } from "react-intl";
import { selectDashboardId, useDashboardSelector } from "../../../../../model/index.js";

interface IdentifierDetailProps {
    title: string;
}

export function DashboardIdParameterDetail({ title }: IdentifierDetailProps) {
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
}
