// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import PropTypes from "prop-types";

import "@gooddata/react-components/styles/css/main.css";

export const Layout = ({ sidebar, sidebarWidth, contentWidth, children }) => (
    <div className="wrapper">
        {/* language=CSS */}
        <style jsx>{`
            .wrapper {
                display: grid;
                grid-template-columns: ${sidebarWidth} ${contentWidth};
                justify-content: stretch;
                justify-items: stretch;
                flex: 1;
            }

            .sidebar {
                padding: 20px 19px 20px 0;
                border-right: 1px solid #dde4eb;
            }

            .content {
                padding: 20px 0 20px 20px;
            }
        `}</style>
        {sidebar ? <div className="sidebar">{sidebar}</div> : null}
        {children ? <div className="content">{children}</div> : null}
    </div>
);
Layout.propTypes = {
    sidebar: PropTypes.element,
    sidebarWidth: PropTypes.string,
    children: PropTypes.element,
    contentWidth: PropTypes.string,
};
Layout.defaultProps = {
    sidebar: null,
    sidebarWidth: "200px",
    children: null,
    contentWidth: "auto",
};

export default Layout;
