// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import Truncate from "react-truncate";

import { DashboardItemHeadlineContainer } from "./DashboardItemHeadlineContainer";

interface IDashboardItemHeadlineProps {
    title: string;
    clientHeight?: number;
}

export const DashboardItemHeadline: React.FC<IDashboardItemHeadlineProps> = ({ title, clientHeight }) => {
    // memoize the Truncate render as it is quite expensive
    const truncatedTitlePart = useMemo(() => {
        return (
            <Truncate lines={2} ellipsis="..." className="item-headline-inner s-headline">
                {title}
            </Truncate>
        );
    }, [title]);

    return (
        <DashboardItemHeadlineContainer clientHeight={clientHeight}>
            {truncatedTitlePart}
        </DashboardItemHeadlineContainer>
    );
};
