// (C) 2020 GoodData Corporation
import React from "react";

export const DashboardItemHeadlineContainer: React.FC = ({ children }) => {
    return (
        <div className="item-headline-outer">
            <div className="item-headline">{children}</div>
        </div>
    );
};
