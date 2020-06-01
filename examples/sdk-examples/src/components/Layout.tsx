// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";

interface ILayoutProps {
    sidebar?: React.ReactNode;
    sidebarWidth?: string | number;
    children?: React.ReactNode;
    contentWidth?: string | number;
}

export const Layout: React.FC<ILayoutProps> = ({
    sidebar,
    sidebarWidth = "200px",
    contentWidth = "auto",
    children,
}) => (
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
