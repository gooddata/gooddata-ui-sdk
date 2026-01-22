// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import { type ObjRef, isInsightWidget } from "@gooddata/sdk-model";

import { ParameterDetail } from "./ParameterDetail.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectInsightByRef } from "../../../../../model/store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../../../../model/store/tabs/layout/layoutSelectors.js";

interface IIdentifierDetailProps {
    title: string;
    widgetRef: ObjRef;
}

export function InsightIdParameterDetail({ title, widgetRef }: IIdentifierDetailProps) {
    const intl = useIntl();
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));
    invariant(isInsightWidget(widget), "must be insight widget selected");
    const insight = useDashboardSelector(selectInsightByRef(widget.insight));

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={insight?.insight.identifier ? [insight.insight.identifier] : []}
        />
    );
}
