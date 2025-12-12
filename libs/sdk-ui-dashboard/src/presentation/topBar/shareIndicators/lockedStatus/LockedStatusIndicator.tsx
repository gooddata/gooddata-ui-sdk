// (C) 2021-2025 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, IconLock } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { type ILockedStatusProps } from "./types.js";
import { gdColorStateBlank } from "../../../constants/colors.js";

/**
 * @alpha
 */
export function LockedStatusIndicator(props: ILockedStatusProps): ReactElement | null {
    const theme = useTheme();
    if (!props.isLocked) {
        return null;
    }
    return (
        <div className="s-locked-status gd-locked-status">
            <BubbleHoverTrigger>
                <IconLock
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
}
