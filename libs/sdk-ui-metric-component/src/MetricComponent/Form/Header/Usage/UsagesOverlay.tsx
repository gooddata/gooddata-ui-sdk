// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IMetadataObject, isInsight } from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    Header,
    IconQuestionMark,
    Item,
    ItemsWrapper,
    Overlay,
} from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../../shared/theme/index.js";

import { UsageItems } from "./UsageItems.js";

const useStyles = makeStyles<void, "trigger">()((theme, _params, classes) => {
    return {
        root: {
            marginTop: 2,
            whiteSpace: "nowrap",
        },
        overlay: {
            ".gd-menu-wrapper.gd-menu-wrapper-small-spacing": {
                width: 300,
                marginLeft: 4,
                padding: 0,
                border: "1px solid #c9d5e0",
            },

            ".gd-list-item.gd-list-item-header, .gd-list-item.gd-list-item-header:hover": {
                borderRadius: "3px 3px 0 0",
                padding: "10px 12px !important",
                background: "var(--gd-palette-complementary-2, #ebeff4) !important",
                fontWeight: "800 !important" as "bold",
                fontSize: "11px !important",
                display: "flex",
                alignItems: "center",

                [`.${classes.trigger}`]: {
                    flex: "0 0 auto",
                    marginLeft: 4,
                    marginBottom: -4,
                },
            },
        },
        overlayList: {
            padding: "10px 10px 10px 0",
        },
        overlayItem: {
            maxHeight: 355,
            overflowY: "auto",
            padding: 0,
            marginBottom: 15,
            marginLeft: 25,

            ".gd-icon-left": {
                "&:before": {
                    marginLeft: 4,
                    color: "#b2bfcb",
                },
                p: {
                    marginLeft: 8,
                    fontSize: 13,
                    fontWeight: 600,
                },
            },
            p: {
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                flex: "1 0 auto",
                display: "flex",
                alignItems: "center",

                svg: {
                    marginRight: 8,
                },
            },

            "&:last-child": {
                marginBottom: 0,
            },
        },
        overlayItemHeader: {
            marginBottom: 2,
            marginLeft: 0,
        },
        item: {
            p: {
                marginLeft: 0,
            },
        },
        trigger: {},
        spacer: {
            flex: "1 0 auto",
        },
        noHover: {
            cursor: "pointer",

            "&:hover": {
                color: theme.globals.colors.defaultText,
                background: theme.globals.colors.defaultWhite,
            },
        },
    };
});

type UsagesOverlayProps = {
    data: IMeasureReferencing;
    metricsOpened: boolean;
    insightsOpened: boolean;
    onToggle: (type: "metrics" | "insights") => void;
    onClose: () => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
};

export function UsagesOverlay({
    data,
    metricsOpened,
    insightsOpened,
    onToggle,
    onClose,
    activeInsight,
    insightOpenType = "external",
    onInsightClick,
    metricOpenType = "external",
    onMetricClick,
}: UsagesOverlayProps) {
    const { insights = [], measures = [] } = data;
    const metricsCount = measures.length;
    const insightsCount = insights.length;
    const { classes, cx } = useStyles();

    const headerClasses = ["gd-icon-left", "gd-list-item", "gd-menu-item"];

    const onInsightClickHandler = useCallback(
        (object: IMetadataObject | IInsight) => {
            if (isInsight(object) && onInsightClick) {
                onInsightClick(object);
                if (onClose) {
                    onClose();
                }
            }
        },
        [onInsightClick, onClose],
    );

    const onMetricClickHandler = useCallback(
        (object: IMetadataObject | IInsight) => {
            if (!isInsight(object) && onMetricClick) {
                onMetricClick(object);
                if (onClose) {
                    onClose();
                }
            }
        },
        [onMetricClick, onClose],
    );

    return (
        <Overlay
            key={classes.root}
            alignTo={`.${classes.root}`}
            alignPoints={[{ align: "bl tl" }]}
            closeOnMouseDrag
            closeOnOutsideClick
            onClose={onClose}
            className={classes.overlay}
        >
            <ItemsWrapper smallItemsSpacing>
                <Header>
                    <FormattedMessage id="metricComponent.objectUsage.usedIn.title" />
                    <BubbleHoverTrigger
                        showDelay={0}
                        hideDelay={0}
                        eventsOnBubble
                        className={classes.trigger}
                    >
                        <IconQuestionMark color="#94a1ad" />
                        <Bubble
                            className="bubble-dark"
                            alignPoints={[{ align: "tc bl", offset: { x: 0, y: 0 } }]}
                        >
                            <FormattedMessage id="metricComponent.objectUsage.usedIn.titleTooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                    <div className={classes.spacer} />
                </Header>
                <div className={classes.overlayList}>
                    {metricsCount > 0 && (
                        <>
                            <div className={cx(classes.overlayItem, classes.overlayItemHeader)}>
                                <Item
                                    className={cx(
                                        ...headerClasses,
                                        classes.noHover,
                                        metricsOpened ? "gd-icon-navigatedown" : "gd-icon-navigateright",
                                    )}
                                    onClick={() => onToggle("metrics")}
                                >
                                    <p>
                                        <FormattedMessage id="metricComponent.objectUsage.metrics" /> (
                                        {metricsCount})
                                    </p>
                                </Item>
                            </div>
                            {metricsOpened && (
                                <div className={classes.overlayItem}>
                                    <UsageItems
                                        objects={measures}
                                        onObjectClick={onMetricClick && onMetricClickHandler}
                                        openType={metricOpenType}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    {insightsCount > 0 && (
                        <>
                            <div className={cx(classes.overlayItem, classes.overlayItemHeader)}>
                                <Item
                                    className={cx(
                                        ...headerClasses,
                                        classes.noHover,
                                        insightsOpened ? "gd-icon-navigatedown" : "gd-icon-navigateright",
                                    )}
                                    onClick={() => onToggle("insights")}
                                >
                                    <p>
                                        <FormattedMessage id="metricComponent.objectUsage.insights" /> (
                                        {insightsCount})
                                    </p>
                                </Item>
                            </div>
                            {insightsOpened && (
                                <div className={classes.overlayItem}>
                                    <UsageItems
                                        active={activeInsight}
                                        objects={insights}
                                        onObjectClick={onInsightClick && onInsightClickHandler}
                                        openType={insightOpenType}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </ItemsWrapper>
        </Overlay>
    );
}
