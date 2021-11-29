// (C) 2021 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { IShareStatusProps } from "./types";

/**
 * @alpha
 */
export const ShareStatusIndicator = (props: IShareStatusProps): JSX.Element => {
    let icon, text, tooltip;
    if (props.shareStatus !== "private") {
        icon = "gd-icon-users";
        text = "header.shareStatus.shared.text";
        tooltip = "header.shareStatus.shared.tooltip";
    } else {
        icon = "gd-icon-invisible";
        text = "header.shareStatus.private.text";
        tooltip = "header.shareStatus.private.tooltip";
    }
    return (
        <div className="s-share-status gd-share-status">
            <BubbleHoverTrigger>
                <div className="gd-share-indicator">
                    <i className={`gd-share-icon ${icon}`} />
                    <FormattedMessage id={text} />
                </div>
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-share-icon`}>
                    <FormattedMessage id={tooltip} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
