// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ParameterDetail } from "./ParameterDetail.js";
import {
    selectInsightByRef,
    selectSelectedWidgetRef,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { isInsightWidget } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

interface IdentifierDetailProps {
    title: string;
}

export const InsightIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
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
};
