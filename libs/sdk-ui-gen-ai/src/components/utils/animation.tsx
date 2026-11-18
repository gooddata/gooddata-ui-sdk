// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import cx from "classnames";

import { UiAiThinkingIcon } from "@gooddata/sdk-ui-kit";

/**
 * The shared "AI thinking" sparkle, centred in a box of the given size with the star at 60 % of it.
 */
export function AIThinkingLoader({ size = 200, color = "#14B2E2" }) {
    return (
        <div className="gd-gen-ai-chat__animations--loader" style={{ width: size, height: size }}>
            <UiAiThinkingIcon size={size * 0.6} color={color} />
        </div>
    );
}

export function AIThinkingSummary({ headings }: { headings: string[] }) {
    const [currentHeading, setCurrentHeading] = useState<string | undefined>(headings[headings.length - 1]);
    const [previousHeading, setPreviousHeading] = useState<string | undefined>(undefined);

    useEffect(() => {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading !== currentHeading) {
            setPreviousHeading(currentHeading);
            setCurrentHeading(lastHeading);
        }
    }, [headings, currentHeading]);

    return (
        <div className="gd-gen-ai-chat__animations--headings">
            {previousHeading ? (
                <div
                    key={`${previousHeading}-old`}
                    className={cx(
                        "gd-gen-ai-chat__animations--headings--heading",
                        "gd-gen-ai-chat__animations--headings--heading--old",
                    )}
                    onAnimationEnd={() => setPreviousHeading(undefined)}
                >
                    {previousHeading}...
                </div>
            ) : null}
            <div
                key={`${currentHeading}-new`}
                className={cx("gd-gen-ai-chat__animations--headings--heading", {
                    "gd-gen-ai-chat__animations--headings--heading--new": !!previousHeading,
                })}
            >
                {currentHeading}...
            </div>
        </div>
    );
}
