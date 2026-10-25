// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

interface IRecommendationProps {
    type: string;
    showArrow?: boolean;
    showIcon?: boolean;
    children: ReactNode;
}

export function Recommendation({ type, showArrow = true, showIcon = true, children }: IRecommendationProps) {
    return (
        <div className={`adi-recommendation adi-recommendation-${type} s-recommendation-${type}`}>
            {showArrow ? <div className="adi-recommendation-arrow" /> : null}
            <div className="adi-recommendation-content">
                {showIcon ? <div className="adi-recommendation-ico" /> : null}
                {children}
            </div>
        </div>
    );
}
