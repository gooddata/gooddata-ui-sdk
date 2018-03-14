// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

export const Layout = ({ sidebar, children }) => (
    <div className="wrapper">
        {/* language=CSS */}
        <style jsx>{`
            .wrapper {
                display: grid;
                grid-template-columns: 200px auto;
                grid-template-rows: auto;
                justify-content: stretch;
                justify-items: stretch;
                flex: 1;
            }

            .sidebar {
                padding: 20px;
                padding-right: 19px;
                border-right: 1px solid #dde4eb;
            }

            .content {
                padding: 20px;
            }
        `}</style>
        {sidebar ? <div className="sidebar">{sidebar}</div> : null}
        <div className="content">{children}</div>
    </div>
);
Layout.propTypes = {
    sidebar: PropTypes.element,
    children: PropTypes.element
};
Layout.defaultProps = {
    sidebar: null,
    children: null
};

export default Layout;
