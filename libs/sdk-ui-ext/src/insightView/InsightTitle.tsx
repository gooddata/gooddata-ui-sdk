import React from "react";
import Truncate from "react-truncate";
/**
 * @Public
 */
export interface IInsightTitle {
    title: string;
}

/**
 * @Public
 */
const InsightTitle: React.FC<IInsightTitle> = ({ title }) => {
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
