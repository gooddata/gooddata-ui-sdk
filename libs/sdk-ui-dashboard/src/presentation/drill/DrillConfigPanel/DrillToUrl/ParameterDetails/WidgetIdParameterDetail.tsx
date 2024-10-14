// (C) 2020-2024 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ParameterDetail } from "./ParameterDetail.js";
import { selectWidgetByRef, useDashboardSelector, isTemporaryIdentity } from "../../../../../model/index.js";
import { ObjRef, isInsightWidget } from "@gooddata/sdk-model";

interface IdentifierDetailProps {
    title: string;
    widgetRef: ObjRef;
}

export const WidgetIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title, widgetRef }) => {
    const intl = useIntl();
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    let values: string[] = [];
    if (isInsightWidget(widget) && !isTemporaryIdentity(widget)) {
        values = [widget.identifier];
    }

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={values}
        />
    );
};
