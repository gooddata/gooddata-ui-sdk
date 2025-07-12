// (C) 2020-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { ParameterDetail } from "./ParameterDetail.js";
import { selectWidgetByRef, useDashboardSelector, isTemporaryIdentity } from "../../../../../model/index.js";
import { ObjRef, isInsightWidget } from "@gooddata/sdk-model";

interface IdentifierDetailProps {
    title: string;
    widgetRef: ObjRef;
}

export function WidgetIdParameterDetail({ title, widgetRef }: IdentifierDetailProps) {
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
}
