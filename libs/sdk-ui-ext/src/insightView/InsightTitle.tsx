// (C) 2021-2022 GoodData Corporation
import React from "react";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC";

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

/**
 * @public
 */
export interface IInsightTitleProps {
    title: string;
}

/**
 * @public
 */
const InsightTitle: React.FC<IInsightTitleProps> = ({ title }) => {
    return (
        <div className="insight-title-outer">
            <div className="insight-title">
                <ResponsiveEllipsis
                    text={title}
                    maxLine={2}
                    ellipsis="..."
                    className="item-headline-inner s-headline"
                />
            </div>
        </div>
    );
};

export default InsightTitle;
