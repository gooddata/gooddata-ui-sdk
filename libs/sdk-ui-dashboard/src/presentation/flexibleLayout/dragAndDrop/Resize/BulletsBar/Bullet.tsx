// (C) 2019-2024 GoodData Corporation
import React from "react";
import classnames from "classnames";

export interface BulletProps {
    index: number;
    isInitial: boolean;
    isCurrent: boolean;
    isLast?: boolean;
}

export const Bullet: React.FC<BulletProps> = ({ isCurrent, isInitial, isLast, index }) => {
    const bulletStyle = classnames("gd-resize-bullet", `s-resize-bullet-${index}`, {
        "gd-resize-bullet--last": isLast,
    });
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
};
