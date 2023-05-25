// (C) 2021-2022 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { IShareStatusProps } from "./types.js";

/**
 * @alpha
 */
export const ShareStatusIndicator = (props: IShareStatusProps): JSX.Element | null => {
    const { shareStatus, isUnderStrictControl } = props;

    if (shareStatus !== "private") {
        return null;
    }

    const tooltip = isUnderStrictControl ? (
        <FormattedMessage id="header.shareStatus.private.strict.tooltip" />
    ) : (
        <FormattedMessage id="header.shareStatus.private.not.strict.tooltip" />
    );

    return (
        <div className="s-share-status gd-share-status">
            <BubbleHoverTrigger>
                <div className="gd-share-indicator">
                    <i className="gd-share-icon gd-icon-invisible" />
                    <FormattedMessage id="header.shareStatus.private.text" />
                </div>
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-share-icon`}>
                    {tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
