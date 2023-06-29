// (C) 2019 GoodData Corporation
import React from "react";
import { DateFilterRoute } from "./types.js";

export const DateFilterHeader: React.FC<{
    children: any;
    changeRoute: (route: DateFilterRoute) => void;
}> = ({ children, changeRoute, ...otherProps }) => {
    return (
        <button
            className="gd-extended-date-filter-header s-do-not-close-dropdown-on-click"
            onClick={(e) => {
                e.preventDefault();
                changeRoute(null);
            }}
            {...otherProps}
        >
            <span className="gd-icon-navigateleft" />
            &emsp;{children}
        </button>
    );
};
