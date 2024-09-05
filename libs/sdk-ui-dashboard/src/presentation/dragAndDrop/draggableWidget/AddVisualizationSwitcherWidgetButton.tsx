// (C) 2024 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, IAlignPoint, Icon, useMediaQuery } from "@gooddata/sdk-ui-kit";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: 5, y: 0 } }];

export const AddVisualizationSwitcherWidgetButton: React.FC = () => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    return (
        <div className="add-item-placeholder add-item-placeholder-visualization-switcher s-add-visualization-switcher">
            <Icon.VisualizationSwitcher />
            <FormattedMessage id="addPanel.visualizationSwitcher" />
            <BubbleHoverTrigger
                eventsOnBubble={true}
                className="gd-add-visualization-switcher s-add-visualization-switcher-bubble-trigger"
            >
                <div
                    className={cx("s-description-trigger", {
                        "is-mobile": isMobileDevice,
                    })}
                >
                    <div className="gd-icon-circle-question" />
                </div>
                <Bubble alignPoints={bubbleAlignPoints}>
                    <FormattedMessage id="addPanel.visualizationSwitcher.tooltip" />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
