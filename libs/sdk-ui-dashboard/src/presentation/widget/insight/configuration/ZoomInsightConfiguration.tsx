// (C) 2020-2022 GoodData Corporation
import { IInsightWidget } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Checkbox, Message } from "@gooddata/sdk-ui-kit";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
    changeInsightWidgetVisProperties,
    selectInsightByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { getInsightVisualizationMeta } from "@gooddata/sdk-ui-ext";

interface ZoomInsightConfigurationProps {
    widget: IInsightWidget;
}

export function ZoomInsightConfiguration(props: ZoomInsightConfigurationProps) {
    const { widget } = props;
    const intl = useIntl();
    // useState helps the status of checkbox change faster than using the zoomable value
    const [zoomInsightState, setZoomInsightStatus] = useState(widget.properties?.controls?.zoomInsight);

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
                controls: { ...widget.properties?.controls, zoomInsight: isChecked },
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
