// (C) 2024 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import {
    Bubble,
    BubbleHoverTrigger,
    IAlignPoint,
    Icon,
    OverlayController,
    OverlayControllerProvider,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: 5, y: 0 } }];
const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export const AddVisualizationSwitcherWidgetButton: React.FC = () => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    const theme = useTheme();
    return (
        <div className="add-item-placeholder add-panel-item s-add-visualization-switcher">
            <Icon.VisualizationSwitcher color={theme?.palette?.complementary?.c6 ?? "#94a1ad"} />
            <FormattedMessage id="addPanel.visualizationSwitcher" />
            <OverlayControllerProvider overlayController={overlayController}>
                <BubbleHoverTrigger
                    eventsOnBubble={true}
                    className="gd-add-item-placeholder-help-trigger gd-add-visualization-switcher s-add-visualization-switcher-bubble-trigger"
                >
                    <div
                        className={cx("s-description-trigger", {
                            "is-mobile": isMobileDevice,
                        })}
                    >
                        <div className="gd-icon-circle-question" />
                    </div>
                    <Bubble alignPoints={bubbleAlignPoints} alignTo=".gd-add-item-placeholder-help-trigger">
                        <FormattedMessage id="addPanel.visualizationSwitcher.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
            </OverlayControllerProvider>
        </div>
    );
};
