// (C) 2020-2022 GoodData Corporation
import { IInsightWidget, insightVisualizationUrl } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Checkbox, Message } from "@gooddata/sdk-ui-kit";
import includes from "lodash/includes";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
    changeInsightWidgetVisProperties,
    selectInsightByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model";
import { VisType, VisualizationTypes } from "@gooddata/sdk-ui";

const supportedVisualizationTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.SCATTER,
    VisualizationTypes.COMBO,
    VisualizationTypes.COMBO2,
    VisualizationTypes.BUBBLE,
    VisualizationTypes.TREEMAP,
    VisualizationTypes.HEATMAP,
    VisualizationTypes.BULLET,
];

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
    const insightUrl = insight ? insightVisualizationUrl(insight) : "";
    const visualizationType = insightUrl.replace("local:", "") as VisType;
    if (!includes(supportedVisualizationTypes, visualizationType)) {
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
            {zoomInsightState && (
                <Message type="progress">
                    {intl.formatMessage({ id: "configurationPanel.zoomInsight.notice" })}
                </Message>
            )}
        </div>
    );
}
