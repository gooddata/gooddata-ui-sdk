// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { storeConfigurationPanelCollapsed } from "../../actions/buckets_actions.js";
import { ConfigurationPanel } from "../../components/ConfigurationPanel.js";
import { appSessionIdSelector } from "../../selectors/report_selector.js";
import { getVisualizationClassTypeFromState } from "../../services/visualization_class_service.js";
import { type AppDispatch } from "../../store/types.js";
import { type IDecoratedBucket, type IDecoratedBuckets } from "../../typings/buckets.js";

import { Bucket } from "./Bucket.js";
import { BucketNotifications } from "./notifications/BucketNotifications.js";

export interface IBucketsPanelProps {
    buckets?: IDecoratedBuckets;
    visualizationClass: IVisualizationClass;
    configurationPanelCollapsed: boolean;
}

export const BucketsPanel = memo(function BucketsPanel({
    buckets = [],
    visualizationClass,
    configurationPanelCollapsed,
}: IBucketsPanelProps) {
    const dispatch = useDispatch<AppDispatch>();

    const appSessionId = useSelector(appSessionIdSelector);
    const configurationPanelVisualizationType = useSelector(getVisualizationClassTypeFromState);

    const setConfigurationPanelCollapsed = useCallback(
        (collapsed: boolean) => {
            dispatch(storeConfigurationPanelCollapsed(collapsed));
        },
        [dispatch],
    );

    const renderBucket = useCallback(
        (decoratedBucket: IDecoratedBucket): ReactElement => {
            const localIdentifier = decoratedBucket.original?.localIdentifier;
            return decoratedBucket?.enabled ? (
                <Bucket
                    key={localIdentifier}
                    localIdentifier={localIdentifier}
                    buckets={buckets}
                    visualizationClass={visualizationClass}
                    bucket={decoratedBucket}
                    setConfigurationPanelCollapsed={setConfigurationPanelCollapsed}
                    configurationPanelCollapsed={configurationPanelCollapsed}
                />
            ) : null;
        },
        [buckets, visualizationClass, configurationPanelCollapsed, setConfigurationPanelCollapsed],
    );

    const renderConfigurationPanel = useCallback(() => {
        return (
            <ConfigurationPanel
                appSessionId={appSessionId}
                visualizationType={configurationPanelVisualizationType}
                isCollapsed={configurationPanelCollapsed}
                setCollapsed={setConfigurationPanelCollapsed}
            />
        );
    }, [
        appSessionId,
        configurationPanelCollapsed,
        configurationPanelVisualizationType,
        setConfigurationPanelCollapsed,
    ]);

    const bucketsArray = buckets.map((bucket) => {
        return renderBucket(bucket);
    });

    return (
        <div className="adi-bucket-list">
            <div className="adi-bucket-group">{bucketsArray}</div>
            <BucketNotifications />
            {renderConfigurationPanel()}
        </div>
    );
});
