// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    type IAlignPoint,
    OverlayController,
    OverlayControllerProvider,
    UiIcon,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/zIndex.js";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: 5, y: 0 } }];
const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function AddVisualizationSwitcherWidgetButton() {
    const isMobileDevice = useMediaQuery("mobileDevice");
    return (
        <div className="add-item-placeholder add-panel-item s-add-visualization-switcher">
            <div className="add-item-placeholder__icon">
                <UiIcon type="visualizationStack" size={18} layout="block" />
            </div>
            <FormattedMessage id="addPanel.visualizationSwitcher" />
            <OverlayControllerProvider overlayController={overlayController}>
                <BubbleHoverTrigger
                    eventsOnBubble
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
}
