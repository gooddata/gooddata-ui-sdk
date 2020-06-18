// (C) 2019 GoodData Corporation
import * as React from "react";
import { DateFilterRoute } from "./types";

export const DateFilterHeader: React.FC<{
    children: any;
    changeRoute: (route: DateFilterRoute) => void;
}> = ({ children, changeRoute, ...otherProps }) => {
    return (
        <button
            className="gd-extended-date-filter-header s-do-not-close-dropdown-on-click"
            onClick={
                // tslint:disable-next-line:jsx-no-lambda
                (e) => {
                    e.preventDefault();
                    changeRoute(null);
                }
            }
            {...otherProps}
        >
            <span className="icon-navigateleft" />
            &emsp;{children}
        </button>
    );
};
