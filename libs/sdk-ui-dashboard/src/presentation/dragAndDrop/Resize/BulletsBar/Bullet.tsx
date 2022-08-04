// (C) 2019-2022 GoodData Corporation
import React from "react";
import classnames from "classnames";

export interface BulletProps {
    index: number;
    isInitial: boolean;
    isCurrent: boolean;
}

export function Bullet({ isCurrent, isInitial, index }: BulletProps) {
    const bulletStyle = "gd-resize-bullet s-resize-bullet-" + index;
    return (
        <div className={bulletStyle}>
            <svg className="gd-resize-bullet-icon">
                <circle
                    cx="3"
                    cy="3"
                    r="3"
                    className={classnames({
                        active: isCurrent,
                        initial: isInitial,
                        passive: !isCurrent && !isInitial,
                    })}
                />
            </svg>
        </div>
    );
}
