// (C) 2021 GoodData Corporation
import React from "react";
import Truncate from "react-truncate";
/**
 * @Public
 */
export interface IInsightTitleProps {
    title: string;
}

/**
 * @Public
 */
const InsightTitle: React.FC<IInsightTitleProps> = ({ title }) => {
    return (
        <div className="insight-title-outer">
            <div className="insight-title">
                <Truncate lines={2} ellipsis={"..."} className="item-headline-inner s-headline">
                    {title}
                </Truncate>
            </div>
        </div>
    );
};

export default InsightTitle;
