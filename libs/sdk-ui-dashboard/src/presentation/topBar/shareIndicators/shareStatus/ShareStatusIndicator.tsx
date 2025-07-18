// (C) 2021-2025 GoodData Corporation
import { ReactElement } from "react";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { IShareStatusProps } from "./types.js";

/**
 * @alpha
 */
export function ShareStatusIndicator(props: IShareStatusProps): ReactElement | null {
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
                    <i aria-hidden="true" className="gd-share-icon gd-icon-invisible" />
                    <FormattedMessage id="header.shareStatus.private.text" />
                </div>
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-share-icon`}>
                    {tooltip}
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
