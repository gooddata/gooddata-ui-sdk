// (C) 2007-2026 GoodData Corporation

import { memo, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { useSelector } from "react-redux";

import { type IVisualizationClass } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { STACK } from "../../constants/bucket.js";
import { canAddItems, isWithinLimit } from "../../models/bucket_rules.js";
import { EMPTY_BUCKET_LABEL } from "../../models/decorated_bucket.js";
import { isOptionalStackingCheckboxVisible as isOptionalStackingCheckboxVisibleSelector } from "../../selectors/optional_stacking_selector.js";
import { getVisualizationClassType } from "../../services/visualization_class_service.js";
import { type IDecoratedBucket, type IDecoratedBuckets } from "../../typings/buckets.js";
import { type IItemDropContext } from "../../typings/drag_and_drop.js";

import { BucketContent } from "./BucketContent.js";
import { BucketIcon } from "./BucketIcon.js";
import { MeasureConfiguration } from "./MeasureConfiguration.js";
import { OptionalStacking } from "./OptionalStacking.js";

interface IBucketProps {
    buckets: IDecoratedBuckets;
    bucket: IDecoratedBucket;
    visualizationClass: IVisualizationClass;
    configurationPanelCollapsed: boolean;
    setConfigurationPanelCollapsed: (state: boolean) => void;
    localIdentifier?: string;
}

export const Bucket = memo(function Bucket({
    buckets,
    bucket,
    visualizationClass,
    configurationPanelCollapsed,
    setConfigurationPanelCollapsed,
    localIdentifier = "",
}: IBucketProps) {
    const { isOptionalStackingCheckboxVisible } = useSelector(isOptionalStackingCheckboxVisibleSelector);

    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldRenderBubble, setShouldRenderBubble] = useState(false);

    const checkBucketOverflow = () => {
        const containerWidth = Math.ceil(containerRef.current.getBoundingClientRect().width);

        if (containerWidth > 0 && containerWidth < containerRef.current.scrollWidth) {
            setShouldRenderBubble(true);
        } else {
            setShouldRenderBubble(false);
        }
    };

    useEffect(() => {
        checkBucketOverflow();
    });

    const getItemDropContextForBucket = (bucket: IDecoratedBucket): IItemDropContext => {
        return {
            bucket,
            type: "BUCKET_ITEM",
            bucketItem: null,
            item: null,
            index: -1,
            to: null,
            dragged: null,
            from: null,
            renderDraggedItemElement: null,
        };
    };

    const getBucketClasses = () => {
        const isEmpty = bucket.items.length === 0;
        const bucketDropContext = getItemDropContextForBucket(bucket);
        const canAddMetricsStacks = canAddItems(bucketDropContext);
        const canAdd = canAddMetricsStacks && isWithinLimit(bucketDropContext);

        return classNames(
            "adi-bucket",
            {
                "bucket-with-warn-message": !canAddMetricsStacks,
                "s-bucket-empty": isEmpty,
                "s-bucket-not-empty": !isEmpty,
                "has-rounded-corners": !canAdd,
                "bucket-collapsed": !configurationPanelCollapsed,
            },
            nameClass(),
        );
    };

    const getHeaderClasses = () => {
        return classNames(
            "bucket-title",
            "s-bucket-title",
            `${nameClass()}-title`,
            `bucket-title-${transformedLocalIdentifier()}-${localVisualizationType()}`,
        );
    };

    const getWarningMessageClasses = () => {
        return classNames("adi-stack-warn", "s-stack-warn", {
            "optional-stacking-checkbox-visible": isOptionalStackingCheckboxVisible,
        });
    };

    const localVisualizationType = () => {
        return getVisualizationClassType(visualizationClass);
    };

    const transformedLocalIdentifier = () => {
        const localIdent = localIdentifier;

        switch (localIdent) {
            case "measures":
                return "metrics";
            case "secondary_measures":
                return "secondary-metrics";
            case "view":
            case "trend":
            case "attribute":
                return "categories";
            case "stack":
            case "segment":
                return "stacks";
            default:
                return localIdent;
        }
    };

    const nameClass = () => {
        return `s-bucket-${localIdentifier}`;
    };

    const collapseConfigurationPanel = () => {
        if (!configurationPanelCollapsed) {
            setConfigurationPanelCollapsed(true);
        }
    };

    const renderHeader = () => {
        const title = bucket.title;
        const itemsCount = bucket.items.length;
        const subtitle = bucket.subtitle;
        const icon = bucket.icon;
        // Buckets without a subtitle keep the EMPTY_BUCKET_LABEL sentinel default; treat
        // it as "no subtitle" so the raw key never leaks into the panel (e.g. the rows and
        // columns buckets of a pivot table, which never get a subtitle from the uiConfig).
        const hasSubtitle = !!subtitle && subtitle !== EMPTY_BUCKET_LABEL;

        return (
            <div className={getHeaderClasses()} onClick={() => collapseConfigurationPanel()}>
                <BucketIcon icon={icon} />
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <h3 ref={containerRef}>
                        {title}
                        {buckets.length > 1 && hasSubtitle ? (
                            <span className="s-bucket-subtitle bucket-subtitle" title={subtitle}>
                                {" "}
                                ({subtitle})
                            </span>
                        ) : null}
                        {!configurationPanelCollapsed && itemsCount > 0 ? ` (${itemsCount})` : null}
                    </h3>
                    {shouldRenderBubble ? (
                        <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                            {title}
                            {hasSubtitle ? ` (${subtitle})` : null}
                        </Bubble>
                    ) : null}
                </BubbleHoverTrigger>
                <MeasureConfiguration localIdentifier={localIdentifier} />
            </div>
        );
    };

    const renderWarning = () => {
        const warningMessage = bucket.warningMessage;

        if (!warningMessage) {
            return null;
        }

        return (
            <div
                className={getWarningMessageClasses()}
                dangerouslySetInnerHTML={{ __html: warningMessage }} // oxlint-disable-line react/no-danger
            />
        );
    };

    const renderOptionalStacking = () => {
        if (localIdentifier === STACK) {
            return <OptionalStacking />;
        }

        return null;
    };

    return (
        <div className={getBucketClasses()}>
            {renderHeader()}
            {configurationPanelCollapsed ? (
                <div className="bucket-container">
                    <BucketContent buckets={buckets} bucket={bucket} />
                    {renderWarning()}
                    {renderOptionalStacking()}
                </div>
            ) : (
                <div className="bucket-contents" />
            )}
        </div>
    );
});
