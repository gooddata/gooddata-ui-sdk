// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { NavLink, Link, withRouter, RouteComponentProps } from "react-router-dom";
import { CustomLoading } from "./CustomLoading";
import { workspace, backendUrlForInfo } from "../constants/fixtures";
import favicon from "../static/favicon.ico";
import logo from "../static/gooddata.svg";
import { ANONYMOUS_ACCESS } from "../constants/env";

const appName = "GoodData.UI Examples Gallery";

interface IHeaderProps extends RouteComponentProps {
    location: any;
    topNavigationRoutes: any[];
    routes?: any[];
    isUserLoggedIn?: boolean;
    logoutAction: () => void;
}

const CoreHeader: React.FC<IHeaderProps> = ({
    location,
    topNavigationRoutes = [],
    routes = [],
    isUserLoggedIn,
    logoutAction,
}) => {
    const [state, setState] = useState({
        displayBackendInfo: true,
    });

    const toggleBackendInfo = () => {
        setState(({ displayBackendInfo }) => ({ displayBackendInfo: !displayBackendInfo }));
    };

    const renderBackendInfo = () => {
        const { displayBackendInfo } = state;

        if (!isUserLoggedIn || !displayBackendInfo) {
            return null;
        }

        return (
            <div className="backendInfo">
                {!ANONYMOUS_ACCESS ? (
                    <>
                        <span className="backendInfoItem">
                            Connected to:
                            <span className="backendInfoValue">{backendUrlForInfo}</span>
                        </span>
                        <span className="backendInfoItem">
                            Project ID:
                            <span className="backendInfoValue">{workspace}</span>
                        </span>
                    </>
                ) : null}
                <span className="backendInfoItem">
                    <span className="backendInfoValue">
                        <a
                            rel="noopener noreferrer"
                            target="_blank"
                            href="https://github.com/gooddata/gooddata-ui-sdk/blob/master/examples/sdk-examples/src/ldm/full.ts"
                        >
                            Data Used
                        </a>
                    </span>
                </span>
                <span className="backendInfoItem">
                    <Link to="/about-this-project">
                        <span>About This Project</span>
                    </Link>
                </span>
                <span className="backendInfoClose" onClick={toggleBackendInfo} />
            </div>
        );
    };

    const renderLoggingBlock = () => {
        const redirectUri =
            typeof window !== "undefined" && !window.location.pathname.match("/login")
                ? window.location.pathname
                : "/";
        if (isUserLoggedIn === null) {
            // s-isWaitingForLoggedInStatus is used to check if we are still waiting to determine logged in status
            return (
                <div className="gd-header-menu-item s-isWaitingForLoggedInStatus">
                    <CustomLoading color="white" imageHeight={19} />
                </div>
            );
        }
        if (isUserLoggedIn === false) {
            return (
                <div>
                    <Link
                        className="gd-header-menu-item button-login button-header"
                        to={{
                            pathname: "/login",
                            state: {
                                redirectUri,
                            },
                        }}
                    >
                        <span>Login</span>
                    </Link>
                </div>
            );
        }
        // s-isLoggedIn is used to check the site is logged in
        return (
            <div
                className="gd-header-menu-item button-logout button-header s-isLoggedIn"
                onClick={logoutAction}
            >
                Logout
            </div>
        );
    };

    const { pathname } = location;
    const href = pathname;
    const currentRoute = (href !== undefined && routes.find((link) => link.path === BASEPATH + href)) || null;
    const pageTitle =
        currentRoute === null || currentRoute.title === appName
            ? appName
            : `${currentRoute.title} | ${appName}`;

    const navigationElements = topNavigationRoutes.map(({ path, title, exact = false }) => (
        <li key={path}>
            <NavLink to={path} className="gd-header-menu-item" activeClassName="active" exact={exact}>
                <span>{title}</span>
            </NavLink>
        </li>
    ));

    return (
        <div className="page">
            {/* language=CSS */}
            <style jsx>{`
                .page {
                    width: 100%;
                    text-align: center;
                }

                .gd-header {
                    position: fixed;
                    top: 0;
                    right: 0;
                    left: 0;
                    /* Table component scrollbar has 99 */
                    z-index: 100;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 64px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
                    color: rgba(0, 0, 0, 0.7);
                    background: #fdfdfd;
                }

                .gd-header-inner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    max-width: 1400px;
                }

                .gd-header-logo-img {
                    max-height: none;
                }

                .gd-header-inner :global(.gd-header-logo) {
                    margin-right: 0;
                    opacity: 0.9;
                }

                .gd-header-inner :global(.gd-header-logo:hover),
                .gd-header-inner :global(.gd-header-logo:focus),
                .gd-header-inner :global(.gd-header-logo:active) {
                    opacity: 1;
                }

                .gd-header-menu-section {
                    padding: 0 32px;
                }

                .gd-header-inner :global(.gd-header-menu-item) {
                    height: 62px;
                    margin: 0;
                    padding: 0 16px;
                    border-bottom: 2px solid transparent;
                    opacity: 1;
                    color: rgba(0, 0, 0, 0.7);
                    font-size: 15px;
                    line-height: 62px;
                    transition: all 0.2s;
                }

                @media screen and (min-width: 1025px) {
                    .gd-header-inner :global(.gd-header-menu-item) {
                        margin: 0 16px;
                    }
                }

                .gd-header-inner :global(.gd-header-menu-item:hover),
                .gd-header-inner :global(.gd-header-menu-item:focus),
                .gd-header-inner :global(.gd-header-menu-item:active) {
                    border-color: #464e56;
                    color: rgba(0, 0, 0, 0.9);
                }

                .gd-header-inner :global(.gd-header-menu-item.active) {
                    color: rgba(0, 0, 0, 0.9);
                    border-color: #14b2e2;
                    font-weight: normal;
                }

                .gd-header-inner :global(.button-header) {
                    height: 28px;
                    margin: 0 0 0 20px;
                    padding: 0 10px;
                    border: none;
                    color: rgba(0, 0, 0, 0.7);
                    font-size: 12px;
                    line-height: 28px;
                }

                .gd-header-inner :global(.button-header-border) {
                    padding: 0 22px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                    border-radius: 100px;
                    line-height: 26px;
                }

                .gd-header-inner :global(.button-header:hover),
                .gd-header-inner :global(.button-header:focus),
                .gd-header-inner :global(.button-header:active) {
                    color: rgba(0, 0, 0, 0.9);
                    border-color: rgba(0, 0, 0, 0.9);
                }

                .page :global(.backendInfo) {
                    position: relative;
                    display: inline-block;
                    max-width: 1400px;
                    margin: 40px 20px 20px;
                    padding: 15px 60px 15px 30px;
                    border-radius: 50px;
                    color: #94a1ad;
                    font-size: 13px;
                    text-align: center;
                    background: #f0f0f0;
                }

                .page :global(.backendInfoItem) {
                    display: inline-block;
                    margin-left: 20px;
                    padding-left: 20px;
                    border-left: 1px solid #94a1ad;
                }

                .page :global(.backendInfoItem:first-child) {
                    border-left: none;
                    margin: 0;
                    padding: 0;
                }

                .page :global(.backendInfoValue) {
                    display: inline-block;
                    margin-left: 4px;
                    color: #333;
                }

                .page :global(.backendInfoClose) {
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    width: 20px;
                    height: 20px;
                    margin-top: -10px;
                    color: #94a1ad;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .page :global(.backendInfoClose:hover),
                .page :global(.backendInfoClose:focus),
                .page :global(.backendInfoClose:active) {
                    color: #000;
                }

                .page :global(.backendInfoClose::before),
                .page :global(.backendInfoClose::after) {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 20px;
                    height: 0;
                    border-bottom: 1px solid currentColor;
                }

                .page :global(.backendInfoClose::before) {
                    transform: rotate(45deg);
                }

                .page :global(.backendInfoClose::after) {
                    transform: rotate(-45deg);
                }
            `}</style>
            <Helmet>
                <title>{pageTitle}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="shortcut icon" type="image/x-icon" href={favicon} />
            </Helmet>
            <div className="gd-header header-6 is-loaded">
                <div className="gd-header-inner">
                    <a
                        href="https://sdk.gooddata.com/gooddata-ui/"
                        className="gd-header-logo gd-header-measure"
                    >
                        <img src={logo} alt={appName} className="gd-header-logo-img" />
                    </a>
                    <div className="gd-header-stretch gd-header-menu-wrapper">
                        <div className="gd-header-menu gd-header-menu-horizontal">
                            <ul className="gd-header-menu-section gd-header-measure">
                                <li>
                                    <a
                                        href="https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html"
                                        className="gd-header-menu-item"
                                    >
                                        Docs
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://sdk.gooddata.com/gooddata-ui/docs/support_options.html"
                                        className="gd-header-menu-item"
                                    >
                                        Support
                                    </a>
                                </li>
                                {navigationElements}
                            </ul>
                        </div>
                    </div>
                    <a
                        href="https://github.com/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-examples#getting-started"
                        className="gd-header-menu-item button-header button-header-border"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Run Locally
                    </a>
                    {!ANONYMOUS_ACCESS ? renderLoggingBlock() : null}
                </div>
            </div>
            {renderBackendInfo()}
        </div>
    );
};

export const Header = withRouter(CoreHeader);
