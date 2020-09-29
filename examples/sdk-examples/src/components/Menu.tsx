// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import { RouteDefinition } from "../constants/routes";

interface IMenuProps {
    location: any;
    sideNavigationRoutes?: RouteDefinition[];
    routes?: any[];
}

const CoreMenu: React.FC<IMenuProps> = ({ sideNavigationRoutes = [], routes = [], location }) => {
    const { pathname } = location;
    const href = pathname;
    const currentRoute = (href !== undefined && routes.find((link) => link.path === BASEPATH + href)) || null;

    const navigationElements = sideNavigationRoutes
        .filter((r) => !r.inBuilds || r.inBuilds.includes(BUILD_TYPE))
        .map(({ path, title, exact = false }) => (
            <li key={path} className={`navListItem${path === currentRoute ? " navListItemActive" : ""}`}>
                <NavLink to={path} className="navItem" activeClassName="navItemActive" exact={exact}>
                    <span>{title}</span>
                </NavLink>
            </li>
        ));

    return (
        <div className="navWrapper">
            {/* language=CSS */}
            <style jsx>{`
                .navWrapper {
                    flex: 0 0 auto;
                    padding: 20px;
                }

                .navGroup {
                    width: 250px;
                    margin: 1px 0 20px;
                    padding: 0;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
                    background: #fff;
                }

                .navGroup ul {
                    display: block;
                    margin: 0;
                    padding: 10px 24px 10px 0;
                    list-style: none;
                }

                .navGroup :global(.navListItem) {
                    font-size: 16px;
                    line-height: 22px;
                }

                .navGroup :global(.navItem) {
                    position: relative;
                    display: inline-block;
                    margin: 8px 20px 3px;
                    padding: 0 0 5px;
                    color: #464e56;
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .navGroup :global(.navItem::before) {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    height: 0;
                    width: 0;
                    border-bottom: 2px solid transparent;
                    transition: 0.2s width;
                }

                .navGroup :global(.navItem:hover::before),
                .navGroup :global(.navItem:focus::before),
                .navGroup :global(.navItem:active::before),
                .navGroup :global(.navItemActive::before) {
                    width: 100%;
                    border-bottom-color: #14b2e2;
                }

                h3 {
                    margin: 0;
                    padding: 20px 20px 0;
                    font-size: 18px;
                }
            `}</style>
            <div className="navGroup">
                <ul>{navigationElements}</ul>
            </div>
        </div>
    );
};

export const Menu = withRouter(CoreMenu);
