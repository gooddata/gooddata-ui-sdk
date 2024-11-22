// (C) 2024 GoodData Corporation

import { ArrowOffsets, Bubble, BubbleHoverTrigger, IAlignPoint, Icon } from "@gooddata/sdk-ui-kit";
import React from "react";
import cx from "classnames";

import { useDashboardUserInteraction } from "../../../../model/index.js";
import {
    defaultAlignPoints,
    defaultArrowDirections,
} from "../../common/configuration/ConfigurationBubble.js";
import { FormattedMessage } from "react-intl";

const defaultArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 8],
    "br bl": [7, -8],
    "tl tr": [-7, 8],
    "tr tr": [-76, 8],
    "br br": [-76, -8],
};

const bubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc", offset: { x: 0, y: -8 } }];

interface ToolbarProps {
    onWidgetDelete: () => void;
    onClose: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onWidgetDelete, onClose }) => {
    const userInteraction = useDashboardUserInteraction();

    const alignTo = ".s-dash-item.is-selected";
    const ignoreClicksOnByClass = [alignTo]; // do not close on click to the widget
    const configBubbleClassNames = cx(
        "edit-insight-config",
        "s-edit-insight-config",
        "edit-insight-config-title-1-line",
        "edit-insight-config-arrow-color",
    );

    return (
        <Bubble
            className={cx(
                "bubble-light gd-configuration-bubble gd-dashboard-nested-layout-toolbar s-gd-dashboard-nested-layout-toolbar-bubble",
                configBubbleClassNames,
            )}
            overlayClassName="gd-configuration-bubble-wrapper gd-dashboard-nested-layout-toolbar-bubble-wrapper sdk-edit-mode-on"
            alignTo={alignTo}
            alignPoints={defaultAlignPoints}
            arrowOffsets={defaultArrowOffsets}
            arrowDirections={defaultArrowDirections}
            closeOnOutsideClick
            closeOnParentScroll={false}
            ignoreClicksOnByClass={ignoreClicksOnByClass}
            arrowStyle={{ display: "none" }}
            onClose={onClose}
        >
            <div
                className="s-dashboard-nested-layout-remove-button gd-dashboard-nested-layout-remove-button "
                onClick={() => {
                    onWidgetDelete();
                    userInteraction.nestedLayoutInteraction("nestedLayoutRemoved");
                }}
            >
                <BubbleHoverTrigger eventsOnBubble={true}>
                    <Icon.Trash className="gd-trash-icon" width={20} height={20} />
                    <Bubble alignPoints={bubbleAlignPoints}>
                        <FormattedMessage id="nestedLayoutToolbar.remove" />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </Bubble>
    );
};
