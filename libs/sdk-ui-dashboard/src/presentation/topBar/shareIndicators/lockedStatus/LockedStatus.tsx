// (C) 2021 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble, Icon } from "@gooddata/sdk-ui-kit";
import { FormattedHTMLMessage } from "react-intl";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { ILockedStatusProps } from "./types";

const LockedStatusComponent = (props: ILockedStatusProps): JSX.Element | null => {
    if (!props.isLocked) {
        return null;
    }
    return (
        <div className="s-locked-status gd-locked-status">
            <BubbleHoverTrigger>
                <Icon.Lock
                    className="gd-icon-locked"
                    width={25}
                    height={24}
                    color={props.theme?.palette?.complementary?.c6 ?? "#94a1ad"}
                />
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-icon-locked`}>
                    <FormattedHTMLMessage id={"header.lockStatus.tooltip"} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};

/**
 * @alpha
 */
export const LockedStatus = withTheme(LockedStatusComponent);
