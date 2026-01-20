// (C) 2026 GoodData Corporation

import type { ReactNode } from "react";

import cx from "classnames";

/**
 * @beta
 */
export interface ILandingContentProps {
    children: ReactNode;
    isFullscreen?: boolean;
    isBigScreen?: boolean;
    isSmallScreen?: boolean;
}

/**
 * @beta
 */
export function DefaultLandingContainer({
    children,
    isBigScreen,
    isSmallScreen,
    isFullscreen,
}: ILandingContentProps) {
    return (
        <div
            className={cx("gd-gen-ai-chat__messages__empty__container", {
                "gd-gen-ai-chat__messages__empty__container--fullscreen": isFullscreen,
                "gd-gen-ai-chat__messages__empty__container--big-screen": isBigScreen,
                "gd-gen-ai-chat__messages__empty__container--small-screen": isSmallScreen,
            })}
        >
            {children}
        </div>
    );
}

/**
 * @beta
 */
export function DefaultLandingQuestions({
    children,
    isFullscreen,
    isBigScreen,
    isSmallScreen,
}: ILandingContentProps) {
    return (
        <div
            className={cx("gd-gen-ai-chat__messages__empty__questions", {
                "gd-gen-ai-chat__messages__empty__questions--fullscreen": isFullscreen,
                "gd-gen-ai-chat__messages__empty__questions--big-screen": isBigScreen,
                "gd-gen-ai-chat__messages__empty__questions--small-screen": isSmallScreen,
            })}
        >
            {children}
        </div>
    );
}
