// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type ObjRef, isInsightWidget } from "@gooddata/sdk-model";

import { ParameterDetail } from "./ParameterDetail.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectWidgetByRef } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import { isTemporaryIdentity } from "../../../../../model/utils/dashboardItemUtils.js";

interface IIdentifierDetailProps {
    title: string;
    widgetRef: ObjRef;
}

export function WidgetIdParameterDetail({ title, widgetRef }: IIdentifierDetailProps) {
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
