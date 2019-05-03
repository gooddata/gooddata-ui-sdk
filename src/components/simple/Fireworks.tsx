// (C) 2007-2018 GoodData Corporation
import * as React from "react";

const randomColor = (): string => `rgb(${[1, 2, 3].map(() => Math.round(Math.random() * 255))})`;

const Circle = ({
    maxSize,
    loopDuration,
    animationDuration,
}: {
    maxSize: number;
    loopDuration: number;
    animationDuration: number;
}) => {
    const size = Math.random() * maxSize;
    const totalDuration = loopDuration + animationDuration;
    return (
        <div
            style={{
                width: size + "vmin",
                height: size + "vmin",
                margin: size / -2 + "vmin",
                animation: `explode ${totalDuration}s 1`,
                animationDelay: Math.random() * totalDuration + "s",
                backgroundColor: randomColor(),
                left: Math.ceil(Math.random() * 100) + "vw",
                top: Math.ceil(Math.random() * 100) + "vh",
                borderRadius: "50%",
                position: "fixed",
                animationTimingFunction: "ease-out",
                animationFillMode: "both",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 9999,
                fontSize: size / 2 + "vmin",
                color: "white",
            }}
        />
    );
};

export const Fireworks = () => {
    const count = 50;
    const loopDuration = 10;
    const animationDuration = 1;
    const circleProps = {
        loopDuration,
        animationDuration,
        maxSize: 100,
    };
    const percentOffset = (100 / (loopDuration + animationDuration)) * animationDuration;

    return (
        <div>
            <style>{`
                @keyframes explode {
                    0%   { opacity: 0; transform: scale(0); }
                    0.1%   { opacity: 1; transform: scale(1); }
                    ${percentOffset}% { opacity: 0; transform: scale(0); }
                }
            `}</style>
            {Array(count)
                .fill(null)
                .map((_, index) => {
                    return <Circle key={index} {...circleProps} />;
                })}
        </div>
    );
};
