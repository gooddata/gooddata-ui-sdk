// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ParameterDetail } from "./ParameterDetail";
import { selectSelectedWidgetRef, selectWidgetByRef, useDashboardSelector } from "../../../../../model";
import { isInsightWidget } from "@gooddata/sdk-model";

interface IdentifierDetailProps {
    title: string;
}

export const WidgetIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={isInsightWidget(widget) ? [widget.identifier] : []}
        />
    );
};
