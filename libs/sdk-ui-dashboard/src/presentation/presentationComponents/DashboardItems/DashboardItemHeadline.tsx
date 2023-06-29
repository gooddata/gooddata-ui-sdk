// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC.js";

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

import { DashboardItemHeadlineContainer } from "./DashboardItemHeadlineContainer.js";

interface IDashboardItemHeadlineProps {
    title: string;
    clientHeight?: number;
}

export const DashboardItemHeadline: React.FC<IDashboardItemHeadlineProps> = ({ title, clientHeight }) => {
    // memoize the Truncate render as it is quite expensive
    const truncatedTitlePart = useMemo(() => {
        return (
            <ResponsiveEllipsis
                maxLine={2}
                ellipsis="..."
                className="item-headline-inner s-headline"
                text={title}
            />
        );
    }, [title]);

    return (
        <DashboardItemHeadlineContainer clientHeight={clientHeight}>
            {truncatedTitlePart}
        </DashboardItemHeadlineContainer>
    );
};
