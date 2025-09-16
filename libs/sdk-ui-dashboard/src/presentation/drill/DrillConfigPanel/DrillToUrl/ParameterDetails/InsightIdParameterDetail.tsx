// (C) 2020-2025 GoodData Corporation

import { useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import { ObjRef, isInsightWidget } from "@gooddata/sdk-model";

import { ParameterDetail } from "./ParameterDetail.js";
import { selectInsightByRef, selectWidgetByRef, useDashboardSelector } from "../../../../../model/index.js";

interface IdentifierDetailProps {
    title: string;
    widgetRef: ObjRef;
}

export function InsightIdParameterDetail({ title, widgetRef }: IdentifierDetailProps) {
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
