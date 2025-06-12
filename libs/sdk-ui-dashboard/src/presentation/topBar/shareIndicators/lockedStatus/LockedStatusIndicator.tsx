// (C) 2021-2022 GoodData Corporation
import React, { ReactNode } from "react";
import { BubbleHoverTrigger, Bubble, Icon } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ILockedStatusProps } from "./types.js";
import { gdColorStateBlank } from "../../../constants/colors.js";

/**
 * @alpha
 */
export const LockedStatusIndicator = (props: ILockedStatusProps): JSX.Element | null => {
    const theme = useTheme();
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
                    color={theme?.palette?.complementary?.c6 ?? gdColorStateBlank}
                />
                <Bubble alignPoints={[{ align: "bc tl" }]} alignTo={`.gd-icon-locked`}>
                    <FormattedMessage
                        id="header.lockStatus.tooltip"
                        values={{ b: (chunks: ReactNode) => <b>{chunks}</b> }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
