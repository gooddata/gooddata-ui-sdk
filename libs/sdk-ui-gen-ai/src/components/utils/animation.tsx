// (C) 2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import cx from "classnames";

export function AIThinkingLoader({ size = 200, color = "#14B2E2" }) {
    const urRef = useRef<SVGSVGElement>(null);
    const llRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        let running = true;
        let timer = -1;
        let sparkIndex = 0;

        const rand = (min: number, max: number) => min + Math.random() * (max - min);
        const blink = (el: SVGSVGElement | null) => {
            if (!el) {
                return;
            }

            const rot = rand(-10, 10);
            el.animate(
                [
                    {
                        transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
                        easing: "cubic-bezier(0.4, 0, 0.7, 1)",
                    },
                    {
                        transform: `translate(-50%, -50%) scale(0) rotate(${rot}deg)`,
                        offset: 0.5,
                        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                    },
                    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
                ],
                { duration: rand(260, 440) },
            );
        };

        const loop = () => {
            if (!running) {
                return;
            }
            if (Math.random() < 0.8) {
                sparkIndex = 1 - sparkIndex;
            }

            blink(sparkIndex === 0 ? urRef.current : llRef.current);
            timer = window.setTimeout(loop, rand(280, 1100));
        };

        loop();
        return () => {
            running = false;
            clearTimeout(timer);
        };
    }, []);

    const s = size / 200;

    return (
        <div
            className="gd-gen-ai-chat__animations--loader"
            style={{ width: size, height: size, perspective: 700 * s }}
        >
            <div
                className="gd-gen-ai-chat__animations--loader--inner"
                style={{
                    width: 120 * s,
                    height: 120 * s,
                }}
            >
                <div
                    className="gd-gen-ai-chat__animations--loader--flip"
                    style={{
                        width: 120 * s,
                        height: 120 * s,
                    }}
                >
                    <svg
                        width={120 * s}
                        height={120 * s}
                        viewBox="0 0 24 24"
                        fill="none"
                        className="gd-gen-ai-chat__animations--loader--svg"
                    >
                        <path
                            d="M11.4 20.9999C11.4 18.8549 10.8654 17.286 10.0945 16.1296C9.32103 14.9694 8.28542 14.1885 7.2316 13.6616C6.17551 13.1336 5.1122 12.8664 4.30777 12.7323C3.9073 12.6656 3.57461 12.6328 3.34449 12.6163C3.22952 12.6081 3.13966 12.6042 3.08082 12.6022C3.0517 12.6013 3.03005 12.6001 3.01636 12.5999H2.99996C2.66858 12.5999 2.39996 12.3313 2.39996 11.9999C2.39996 11.6685 2.66859 11.3999 2.99996 11.3999H3.01636C3.03005 11.3997 3.0517 11.3985 3.08082 11.3976C3.13966 11.3956 3.22952 11.3917 3.34449 11.3835C3.57461 11.367 3.9073 11.3342 4.30777 11.2675C5.1122 11.1334 6.17551 10.8662 7.2316 10.3382C8.28541 9.81127 9.32103 9.0304 10.0945 7.87021C10.8654 6.71379 11.4 5.14491 11.4 2.9999C11.4 2.66853 11.6686 2.3999 12 2.3999C12.3313 2.39991 12.6 2.66853 12.6 2.9999C12.6 5.14491 13.1345 6.71379 13.9054 7.87021C14.6789 9.0304 15.7145 9.81127 16.7683 10.3382C17.8244 10.8662 18.8877 11.1334 19.6921 11.2675C20.0926 11.3342 20.4253 11.367 20.6554 11.3835C20.7704 11.3917 20.8603 11.3956 20.9191 11.3976C20.9482 11.3985 20.9699 11.3997 20.9835 11.3999H21L21.1207 11.4116C21.3942 11.4675 21.5999 11.7099 21.6 11.9999C21.6 12.29 21.3942 12.5323 21.1207 12.5882L21 12.5999H20.9835C20.9699 12.6001 20.9482 12.6013 20.9191 12.6022C20.8603 12.6042 20.7704 12.6081 20.6554 12.6163C20.4253 12.6328 20.0926 12.6656 19.6921 12.7323C18.8877 12.8664 17.8244 13.1336 16.7683 13.6616C15.7145 14.1885 14.6789 14.9694 13.9054 16.1296C13.1826 17.2138 12.6673 18.6607 12.6058 20.605L12.6 20.9999L12.5882 21.1206C12.5324 21.3942 12.29 21.5999 12 21.5999C11.6686 21.5999 11.4 21.3313 11.4 20.9999Z"
                            fill={color}
                        />
                    </svg>
                </div>
            </div>
            <svg
                ref={urRef}
                width={30 * s}
                height={30 * s}
                viewBox="16.5 2.1 5.3 5.3"
                fill="none"
                className="gd-gen-ai-chat__animations--loader--sparkle"
                style={{
                    left: 135.85 * s,
                    top: 64 * s,
                }}
            >
                <path
                    d="M18.9645 2.59958C19.0084 2.33334 19.3912 2.33334 19.4351 2.59958C19.6011 3.60808 20.3916 4.39853 21.4002 4.56465C21.6663 4.60849 21.6663 4.9913 21.4002 5.03516C20.3916 5.20128 19.6011 5.99171 19.4351 7.00022C19.3912 7.26646 19.0084 7.26646 18.9645 7.00022C18.7984 5.99171 18.0079 5.20128 16.9994 5.03516C16.7333 4.9913 16.7333 4.60849 16.9994 4.56465C18.0079 4.39853 18.7984 3.60808 18.9645 2.59958Z"
                    fill={color}
                />
            </svg>
            <svg
                ref={llRef}
                width={30 * s}
                height={30 * s}
                viewBox="2.1 16.5 5.3 5.3"
                fill="none"
                className="gd-gen-ai-chat__animations--loader--sparkle"
                style={{
                    left: 64 * s,
                    top: 135.85 * s,
                }}
            >
                <path
                    d="M4.56465 16.9994C4.60849 16.7333 4.9913 16.7333 5.03516 16.9994C5.20128 18.0079 5.99171 18.7984 7.00022 18.9645C7.26646 19.0083 7.26646 19.3912 7.00022 19.4351C5.99171 19.6011 5.20128 20.3916 5.03516 21.4002C4.9913 21.6663 4.60849 21.6663 4.56465 21.4002C4.39853 20.3916 3.60808 19.6011 2.59958 19.4351C2.33334 19.3912 2.33334 19.0083 2.59958 18.9645C3.60808 18.7984 4.39853 18.0079 4.56465 16.9994Z"
                    fill={color}
                />
            </svg>
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
