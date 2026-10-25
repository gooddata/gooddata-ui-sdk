// (C) 2007-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { selectVisualizationType } from "../actions/buckets_actions.js";
import { getDecoratedBuckets } from "../selectors/buckets_selector.js";
import { enableNewGeoPushpin as enableNewGeoPushpinSelector } from "../selectors/feature_flag_selector.js";
import {
    getEnabledVisualizationClasses,
    getVisualizationClass,
} from "../services/visualization_class_service.js";
import { isConfigurationPanelCollapsed } from "../store/configuration_panel/configuration_panel_selectors.js";
import { type AppDispatch } from "../store/types.js";

import { BucketsPanel } from "./buckets/BucketsPanel.js";
import { VisualizationPicker } from "./buckets/VisualizationPicker.js";
import { DragScroller } from "./DragScroller/DragScroller.js";

export const Buckets = memo(function Buckets() {
    const buckets = useSelector(getDecoratedBuckets);
    const visualizationClass = useSelector(getVisualizationClass);
    const visualizationClasses = useSelector(getEnabledVisualizationClasses);
    const configurationPanelCollapsed = useSelector(isConfigurationPanelCollapsed);
    const enableNewGeoPushpin = useSelector(enableNewGeoPushpinSelector);

    const dispatch = useDispatch<AppDispatch>();

    const onTypeChanged = useCallback(
        (type: IVisualizationClass) => {
            dispatch(selectVisualizationType(type));
        },
        [dispatch],
    );

    if (!visualizationClasses || !visualizationClass) {
        return false;
    }
    return (
        <div className="adi-buckets-panel">
            <VisualizationPicker
                selected={visualizationClass}
                visualizationClasses={visualizationClasses}
                onClick={onTypeChanged}
                enableNewGeoPushpin={enableNewGeoPushpin}
            />

            <DragScroller className="adi-buckets-scroller">
                <BucketsPanel
                    buckets={buckets}
                    configurationPanelCollapsed={configurationPanelCollapsed}
                    visualizationClass={visualizationClass}
                />
            </DragScroller>
        </div>
    );
});
