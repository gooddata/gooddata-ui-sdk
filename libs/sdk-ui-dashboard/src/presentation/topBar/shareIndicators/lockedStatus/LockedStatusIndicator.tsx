// (C) 2021 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble, Icon } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";
import { ILockedStatusProps } from "./types";
import { gdColorStateBlank } from "../../../constants/colors";

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
                    color={props.theme?.palette?.complementary?.c6 ?? gdColorStateBlank}
                />
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-icon-locked`}>
                    <FormattedMessage
                        id="header.lockStatus.tooltip"
                        values={{ b: (chunks: string) => <b>{chunks}</b> }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};

/**
 * @alpha
 */
export const LockedStatusIndicator = withTheme(LockedStatusComponent);
