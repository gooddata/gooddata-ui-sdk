// (C) 2007-2019 GoodData Corporation
import React from "react";
import PropTypes from "prop-types";
import "@gooddata/react-components/styles/css/main.css";
import { Link, Redirect } from "react-router-dom";

export const WithSubRoutes = ({ subRoutes, match, location: { pathname } }) => {
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
                {subRoutes.map(({ path, title }) => (
                    <Link key={path} to={path} className={`gd-tab${path === pathname ? " is-active" : ""}`}>
                        {title}
                    </Link>
                ))}
            </div>
        </div>
    );
};

WithSubRoutes.propTypes = {
    subRoutes: PropTypes.array.isRequired,
    match: PropTypes.shape({
        isExact: PropTypes.bool.isRequired,
        path: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
};

export default WithSubRoutes;
