// (C) 2021-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import classnames from "classnames";

import { type IMeasureMetadataObject, type ISeparators } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, IconQuestionMark } from "@gooddata/sdk-ui-kit";

import { useEvents } from "../eventing/useEvents.js";
import { type IExpressionToken } from "../MaqlPreview/backend/measureExpressionTokens.js";
import { type IMaqlFragmentCommonProps } from "../MaqlPreview/MaqlPreview.js";
import { makeStyles } from "../theme/index.js";

import { events } from "./MetricTooltip.events.js";
import { type IMetricTooltipContentProps, MetricTooltipContent } from "./MetricTooltipContent.js";

const useStyles = makeStyles()(() => ({
    root: {
        ".bubble-content": {
            padding: "0 !important",
        },
    },
}));

/**
 * @internal
 */
export interface IMetricTooltipProps {
    active?: boolean;
    className?: string;
    iconClassName?: string;
    metric: IMeasureMetadataObject;
    previewOptions?: IMetricTooltipContentProps["previewOptions"];
    onTooltipOpen?: (open: boolean) => void;
    useReferences?: boolean;
    separators?: ISeparators;
}

const alignPoints = [
    { align: "cr cl", offset: { x: -8, y: 0 } },
    { align: "cr bl", offset: { x: -8, y: 0 } },
    { align: "cr tl", offset: { x: -8, y: 0 } },
];

/**
 * @internal
 */
export function MetricTooltip({
    metric,
    className,
    iconClassName,
    active = false,
    onTooltipOpen,
    previewOptions = {},
    useReferences,
    separators,
}: IMetricTooltipProps) {
    const { classes } = useStyles();
    const tokenClickHandler = useTokenClick(previewOptions.onClick);
    useOpenedEvent(active);

    return (
        <span
            className={className}
            onMouseEnter={() => onTooltipOpen?.(true)}
            onMouseLeave={() => onTooltipOpen?.(false)}
        >
            <BubbleHoverTrigger showDelay={0} hideDelay={0} eventsOnBubble>
                <IconQuestionMark
                    className={classnames(
                        "s-metric_list_item_tooltip_trigger",
                        iconClassName,
                        active && "hover",
                    )}
                />
                <Bubble
                    className={classnames("bubble-light", classes.root)}
                    alignPoints={alignPoints}
                    arrowStyle={{ display: "none" }}
                >
                    <div className="s-metric_list_item_tooltip_bubble">
                        <MetricTooltipContent
                            metric={metric}
                            separators={separators}
                            previewOptions={{ ...previewOptions, onClick: tokenClickHandler }}
                            useReferences={useReferences}
                        />
                    </div>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}

function useTokenClick(onTokenClick?: IMaqlFragmentCommonProps["onClick"]) {
    const { userClickOnMetricInTooltipEvent } = useEvents(events);

    return useCallback(
        (token: IExpressionToken) => {
            if (token.category === "metric" || token.category === "measure") {
                userClickOnMetricInTooltipEvent();
            }
            if (onTokenClick) {
                onTokenClick(token);
            }
        },
        [userClickOnMetricInTooltipEvent, onTokenClick],
    );
}

function useOpenedEvent(active: undefined | boolean) {
    const { metricTooltipDisplayedEvent } = useEvents(events);

    useEffect(() => {
        if (active) {
            metricTooltipDisplayedEvent();
        }
    }, [metricTooltipDisplayedEvent, active]);
}
