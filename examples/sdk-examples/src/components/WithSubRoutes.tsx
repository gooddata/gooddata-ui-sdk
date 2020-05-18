// (C) 2007-2019 GoodData Corporation
import React from "react";

import { Link, Redirect } from "react-router-dom";

export const WithSubRoutes = ({ subRoutes, match, location: { pathname } }: any) => {
    if (match.isExact) {
        return <Redirect to={subRoutes[0].path} />;
    }

    return (
        <div className="wrapper">
            {/* language=CSS */}
            <style jsx>
                {`
                    .wrapper {
                        flex: 0 0 auto;
                        margin-bottom: 20px;
                    }

                    .text {
                        margin-top: 40px;
                    }
                `}
            </style>
            <div className="gd-tabs">
                {subRoutes.map(({ path, title }: any) => (
                    <Link key={path} to={path} className={`gd-tab${path === pathname ? " is-active" : ""}`}>
                        {title}
                    </Link>
                ))}
            </div>
        </div>
    );
};
