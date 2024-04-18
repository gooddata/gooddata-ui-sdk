// (C) 2021-2024 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger, Bubble, Icon } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ILockedStatusProps } from "./types.js";
import { gdColorStateBlank } from "../../../constants/colors.js";
import { useDashboardSelector, selectSupportsAccessControlCapability } from "../../../../model/index.js";

const alignPoints = [{ align: "bl tl" }];

/**
 * @alpha
 */
export const LockedStatusIndicator = (props: ILockedStatusProps): JSX.Element | null => {
    const isInherited = useDashboardSelector(selectSupportsAccessControlCapability);
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
                <Bubble alignPoints={alignPoints} alignTo={`.gd-icon-locked`}>
                    <FormattedMessage
                        id={isInherited ? "header.inheritedInsight.tooltip" : "header.lockStatus.tooltip"}
                        values={{ br: <br /> }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
