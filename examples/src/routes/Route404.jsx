// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ErrorComponent } from "@gooddata/react-components";
import { NavLink } from "react-router-dom";

export const Route404 = () => (
    <ErrorComponent
        icon="icon-ghost"
        className="s-default-Error"
        message="The requested page could not be found"
        description={
            <NavLink to="/" className="navItem" activeClassName="navItemActive" exact>
                <span>Back to Basic components</span>
            </NavLink>
        }
        height={200}
    />
);

export default Route404;
