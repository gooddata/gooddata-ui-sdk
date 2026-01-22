// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { ParameterDetail } from "./ParameterDetail.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectDashboardId } from "../../../../../model/store/meta/metaSelectors.js";

interface IIdentifierDetailProps {
    title: string;
}

export function DashboardIdParameterDetail({ title }: IIdentifierDetailProps) {
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
