// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import { type IInsightWidget } from "@gooddata/sdk-model";
import { getInsightVisualizationMeta } from "@gooddata/sdk-ui-ext";
import { Bubble, BubbleHoverTrigger, Checkbox, Message } from "@gooddata/sdk-ui-kit";

import {
    changeInsightWidgetVisProperties,
    selectInsightByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IZoomInsightConfigurationProps {
    widget: IInsightWidget;
}

export function ZoomInsightConfiguration({ widget }: IZoomInsightConfigurationProps) {
    const intl = useIntl();
    // useState helps the status of checkbox change faster than using the zoomable value
    const [zoomInsightState, setZoomInsightStatus] = useState(widget.properties?.["controls"]?.zoomInsight);

    const dispatch = useDashboardDispatch();

    const insight = useDashboardSelector(selectInsightByRef(widget.insight));
    if (!insight) {
        return null;
    }

    const visualizationMeta = getInsightVisualizationMeta(insight);
    if (!visualizationMeta.supportsZooming) {
        return null;
    }

    const handleZoomableChange = (isChecked: boolean) => {
        setZoomInsightStatus(isChecked);
        dispatch(
            changeInsightWidgetVisProperties(widget.ref, {
                ...widget.properties,
                controls: { ...widget.properties?.["controls"], zoomInsight: isChecked },
            }),
        );
    };

    return (
        <div className="s-zoom-and-pan zoom-and-pan-section configuration-category">
            <Checkbox
                onChange={handleZoomableChange}
                value={zoomInsightState}
                text={intl.formatMessage({ id: "configurationPanel.zoomInsight" })}
            />
            <BubbleHoverTrigger tagName="abbr" hideDelay={1000} showDelay={100}>
                <i className="gd-button-link gd-icon-circle-question s-circle_question gd-button" />
                <Bubble alignTo=".gd-icon-circle-question" alignPoints={[{ align: "cr cl" }]}>
                    {intl.formatMessage({ id: "configurationPanel.zoomInsight.help" })}
                </Bubble>
            </BubbleHoverTrigger>
            {zoomInsightState ? (
                <Message type="progress">
                    {intl.formatMessage({ id: "configurationPanel.zoomInsight.notice" })}
                </Message>
            ) : null}
        </div>
    );
}
