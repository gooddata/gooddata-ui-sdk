// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { IShareStatusProps } from "./types";

/**
 * @alpha
 */
export const ShareStatusIndicator = (props: IShareStatusProps): JSX.Element => {
    const { icon, text, tooltip } = getShareStatusData(props);

    return (
        <div className="s-share-status gd-share-status">
            <BubbleHoverTrigger>
                <div className="gd-share-indicator">
                    <i className={`gd-share-icon ${icon}`} />
                    {text}
                </div>
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-share-icon`}>
                    {tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};

function getShareStatusData(props: IShareStatusProps): {
    icon: string;
    text: React.ReactElement;
    tooltip: React.ReactElement;
} {
    const { shareStatus, isUnderStrictControl } = props;

    if (shareStatus !== "private") {
        return {
            icon: "gd-icon-users",
            text: <FormattedMessage id="header.shareStatus.shared.text" />,
            tooltip: <FormattedMessage id="header.shareStatus.shared.tooltip" />,
        };
    }

    return {
        icon: "gd-icon-invisible",
        text: <FormattedMessage id="header.shareStatus.private.text" />,
        tooltip: isUnderStrictControl ? (
            <FormattedMessage id="header.shareStatus.private.strict.tooltip" />
        ) : (
            <FormattedMessage id="header.shareStatus.private.not.strict.tooltip" />
        ),
    };
}
