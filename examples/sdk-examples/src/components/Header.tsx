// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { CustomLoading } from "./CustomLoading";
import { workspace, backendUrlForInfo } from "../constants/fixtures";
import favicon from "../static/favicon.ico";
import logo from "../static/gooddata.svg";
import icon from "../static/icon-gdui.svg";
import chevron from "../static/chevron.svg";
import { ANONYMOUS_ACCESS } from "../constants/env";

const appName = "GoodData.UI Examples Gallery";

interface IHeaderProps extends RouteComponentProps {
    location: any;
    routes?: any[];
    isUserLoggedIn?: boolean;
    logoutAction: () => void;
}

const CoreHeader: React.FC<IHeaderProps> = ({ location, routes = [], isUserLoggedIn, logoutAction }) => {
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
                    <Link to="/about-this-workspace">
                        <span>About This Workspace</span>
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

    return (
        <div className="page">
            {/* language=CSS */}
            <style jsx>{`
                .page {
                    width: 100%;
                    text-align: center;
                }

                .page .gd-docs-header {
                    text-align: left;
                }

                .gd-header-links {
                    position: fixed;
                    top: 63px;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 100;
                    max-width: 100%;
                    display: none;
                    margin: 0;
                    padding: 0 10%;
                    flex-direction: column;
                    list-style-type: none;
                    background-color: #fff;
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-links {
                        position: static;
                        display: flex;
                        flex-direction: row;
                        width: auto;
                        max-width: none;
                        padding: 0;
                        background-color: transparent;
                    }
                }

                .gd-header-link,
                .gd-header a.gd-header-link {
                    display: block;
                    padding: 15px !important;
                    line-height: 29px;
                    font-size: 20px;
                    font-weight: bold;
                    text-align: left;
                    white-space: nowrap;
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-link,
                    .gd-header a.gd-header-link {
                        padding: 20px 20px 16px !important;
                        line-height: 24px;
                        font-size: 14px;
                        text-align: center;
                    }
                }

                .gd-header-link,
                .gd-header-link:link,
                .gd-header-link:visited,
                .gd-header-link:hover,
                .gd-header-link:focus,
                .gd-header-link:active,
                .gd-header a.gd-header-link,
                .gd-header a.gd-header-link:link,
                .gd-header a.gd-header-link:visited,
                .gd-header a.gd-header-link:hover,
                .gd-header a.gd-header-link:focus,
                .gd-header a.gd-header-link:active {
                    text-decoration: none;
                }

                .gd-header-link,
                .gd-header-link:link,
                .gd-header-link:visited,
                .gd-header a.gd-header-link,
                .gd-header a.gd-header-link:link,
                .gd-header a.gd-header-link:visited {
                    color: rgba(0, 0, 0, 0.7);
                }

                .gd-header-link:hover,
                .gd-header-link:focus,
                .gd-header-link:active,
                .gd-header a.gd-header-link:hover,
                .gd-header a.gd-header-link:focus,
                .gd-header a.gd-header-link:active {
                    color: #000;
                }

                .gd-header-link-item,
                .gd-header a.gd-header-link-item {
                    padding: 0;
                    border-top: 1px solid rgba(0, 0, 0, 0.4);
                }

                .gd-header-link-item:first-child,
                .gd-header a.gd-header-link-item:first-child {
                    border-top: none;
                }

                .gd-header-link-item:last-child,
                .gd-header a.gd-header-link-item:last-child {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.4);
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-link-item,
                    .gd-header-link-item:first-child,
                    .gd-header a.gd-header-link-item,
                    .gd-header a.gd-header-link-item:first-child {
                        border-top: none;
                    }

                    .gd-header-link-item,
                    .gd-header-link-item:last-child,
                    .gd-header a.gd-header-link-item,
                    .gd-header a.gd-header-link-item:last-child {
                        border-bottom: 4px solid transparent;
                    }

                    .gd-header-link-item-mobile-only,
                    .gd-header a.gd-header-link-item-mobile-only {
                        display: none;
                    }
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-link-hub a.gd-header-link,
                    .gd-header a.gd-header-link-hub a.gd-header-link {
                        position: relative;
                        margin-right: 20px !important;
                        padding-left: 25px !important;
                    }

                    .gd-header-link-hub a.gd-header-link:before,
                    .gd-header a.gd-header-link-hub a.gd-header-link:before {
                        content: "";
                        display: inline-block;
                        position: absolute;
                        left: 0;
                        top: 19px;
                        width: 24px;
                        height: 24px;
                        background: url("https://www.gooddata.com/learn-assets/img/navicon-learn.svg") center
                            no-repeat;
                        background-size: contain;
                    }

                    .gd-header-link-hub a.gd-header-link:after,
                    .gd-header a.gd-header-link-hub a.gd-header-link:after {
                        content: "";
                        display: inline-block;
                        position: absolute;
                        right: -9px;
                        top: 24px;
                        width: 2px;
                        height: 18px;
                        background: #000;
                    }
                }

                .gd-header-link-active,
                .gd-header a.gd-header-link-active {
                    color: #000;
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-link-active,
                    .gd-header-link-active:last-child,
                    .gd-header a.gd-header-link-active,
                    .gd-header a.gd-header-link-active:last-child {
                        border-bottom-color: #000;
                    }
                }

                .gd-header-mobile-icon {
                    display: inline-block;
                    width: 20px;
                }

                .gd-header-mobile-title {
                    margin-left: 5px;
                    margin-right: 7px;
                    font-weight: bold;
                    font-size: 14px;
                    color: #94a1ae;
                }

                .gd-header-mobile-menu-trigger {
                    position: relative;
                    display: block;
                    width: 40px;
                    height: 40px;
                    padding: 8px;
                    font-size: 0;
                    margin-right: -8px;
                }

                .gd-header-mobile-menu-trigger::before,
                .gd-header-mobile-menu-trigger::after {
                    content: "";
                    display: block;
                }

                .gd-header-mobile-menu-trigger::before,
                .gd-header-mobile-menu-trigger::after,
                .gd-header-mobile-menu-trigger span:first-child {
                    position: absolute;
                    top: 50%;
                    right: 8px;
                    left: 8px;
                    height: 0;
                    border-top: 2px solid #000;
                    transition: all 0.5s;
                }

                .gd-header-mobile-menu-trigger::before {
                    margin-top: -7px;
                }

                .gd-header-mobile-menu-trigger::after {
                    margin-top: 5px;
                }

                .gd-header-mobile-menu-trigger span:first-child {
                    margin-top: -1px;
                    opacity: 1;
                }

                .gd-header-mobile-menu-trigger > span {
                    display: none;
                }

                .gd-header-mobile-menu-trigger > span:first-child {
                    display: block;
                }

                .gd-header-mobile-menu-trigger-input {
                    visibility: hidden;
                    position: absolute;
                }

                @media only screen and (min-width: 1025px) {
                    .gd-header-mobile {
                        display: none !important;
                    }
                }

                .gd-header-mobile-menu-trigger-input:checked ~ .gd-header-links {
                    display: flex;
                }

                .gd-header-mobile-menu-trigger-input:checked ~ .gd-header-mobile-menu-trigger::before,
                .gd-header-mobile-menu-trigger-input:checked ~ .gd-header-mobile-menu-trigger::after {
                    margin-top: -1px;
                }

                .gd-header-mobile-menu-trigger-input:checked ~ .gd-header-mobile-menu-trigger::before {
                    transform: rotate(45deg);
                }

                .gd-header-mobile-menu-trigger-input:checked ~ .gd-header-mobile-menu-trigger::after {
                    transform: rotate(-45deg);
                }

                .gd-header-mobile-menu-trigger-input:checked
                    ~ .gd-header-mobile-menu-trigger
                    span:first-child {
                    opacity: 0;
                }

                .gd-docs-header-nav {
                    position: fixed;
                    right: 0;
                    left: 0;
                    z-index: 132;
                    display: flex;
                    flex-wrap: nowrap;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                }

                .gd-docs-header-nav__first {
                    top: 0;
                    min-height: 65px;
                    background-color: #fff;
                    z-index: 133;
                }

                .gd-docs-header-nav__second {
                    top: 65px;
                    height: 59px;
                    background: #fafafa;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                    border-top: 1px solid rgba(0, 0, 0, 0.2);
                }

                .gd-docs-header-nav__left {
                    display: flex;
                    align-items: center;
                }

                @media screen and (min-width: 1600px) {
                    .gd-docs-header-nav__first .gd-docs-header-nav__left,
                    .gd-docs-header-nav__first .gd-docs-header-nav__right {
                        min-width: 380px;
                    }
                }

                .gd-docs-header-nav__second .gd-docs-header-nav__left,
                .gd-docs-header-nav__second .gd-docs-header-nav__right {
                    flex: 1 0 0;
                }

                .gd-docs-header-nav__first .gd-docs-header-nav__center {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    flex: 1 1 auto;
                }

                @media screen and (min-width: 1025px) {
                    .gd-docs-header-nav__first .gd-docs-header-nav__center {
                        justify-content: center;
                    }
                }

                .gd-docs-header-nav__second .gd-docs-header-nav__center {
                    flex: 1 0 13%;
                }

                .gd-docs-header-nav__right {
                    display: none;
                    text-align: right;
                }

                @media screen and (min-width: 1200px) {
                    .gd-docs-header-nav__right {
                        display: block;
                    }
                }

                .gd-docs-header-nav__second .gd-docs-header-nav__right {
                    display: block;
                }

                .gd-docs-header-nav__logo img {
                    width: 127px;
                    height: 35px;
                    margin-left: -4px;
                }

                .gd-docs-header-nav__title {
                    display: none;
                    font-size: 14px;
                }

                .gd-docs-header-nav__breadcrumb {
                    color: #94a1ad;
                }

                @media screen and (min-width: 768px) {
                    .gd-docs-header-nav__title {
                        display: block;
                    }
                }

                .gd-docs-header-nav__title img {
                    width: 24px;
                    height: 24px;
                    margin-right: 10px;
                    vertical-align: middle;
                }

                .gd-docs-header-nav__breadcrumb img {
                    width: 8px;
                    height: 14px;
                    margin: 1px 5px 0;
                    vertical-align: top;
                }

                .gd-docs-header-nav__cta {
                    display: inline-block;
                    height: 30px;
                    padding: 5px 18px;
                    border: 2px solid #000;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: bold;
                    line-height: 18px;
                    color: #000;
                    transition: 0.15s ease-in-out;
                }

                .gd-docs-header-nav__cta,
                .gd-docs-header-nav__cta:hover,
                .gd-docs-header-nav__cta:focus,
                .gd-docs-header-nav__cta:active {
                    text-decoration: none;
                }

                .gd-docs-header-nav__cta:hover,
                .gd-docs-header-nav__cta:focus,
                .gd-docs-header-nav__cta:active {
                    color: #fff;
                    background-color: #000;
                }

                .button-header {
                    height: 1.75rem;
                    margin: 0;
                    padding: 5px 10px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                    border-radius: 100px;
                    color: #000;
                    font-size: 0.75rem;
                    line-height: 1.75rem;
                }

                .button-header,
                .button-header:hover,
                .button-header:focus,
                .button-header:active {
                    text-decoration: none;
                }

                .button-header:hover,
                .button-header:focus,
                .button-header:active {
                    border-color: #000;
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
            <div className="gd-docs-header header-6 is-loaded">
                <nav className="gd-docs-header-nav gd-docs-header-nav__first">
                    <div className="gd-docs-header-nav__left">
                        <a className="gd-docs-header-nav__logo" href="https://www.gooddata.com/">
                            <img src={logo} alt={appName} />
                        </a>
                    </div>
                    <div className="gd-docs-header-nav__center">
                        <img
                            className="gd-header-mobile gd-header-mobile-icon"
                            src="https://www.gooddata.com/learn-assets/img/navicon-documentation-gray.svg"
                            alt="Documentation"
                        />
                        <span className="gd-header-mobile gd-header-mobile-title">Docs APIs</span>
                        <input
                            type="checkbox"
                            id="gd-header-mobile-menu-trigger-input"
                            name="gd-header-mobile-menu-trigger-input"
                            className="gd-header-mobile gd-header-mobile-menu-trigger-input"
                        />
                        <label
                            htmlFor="gd-header-mobile-menu-trigger-input"
                            className="gd-header-mobile gd-header-mobile-menu-trigger"
                        >
                            <span></span>
                        </label>
                        <ul className="gd-docs-header-nav__menu gd-header-links">
                            <li className="gd-docs-header-nav__menuitem gd-docs-header-nav__menuhome gd-header-link-item gd-header-link-hub">
                                <a
                                    href="https://www.gooddata.com/developers/"
                                    className="gd-docs-header-nav__menulink gd-header-link"
                                >
                                    Developers
                                </a>
                            </li>
                            <li className="gd-docs-header-nav__menuitem gd-header-link-item">
                                <a
                                    href="https://www.gooddata.com/developers/cloud-native/"
                                    className="gd-docs-header-nav__menulink gd-header-link"
                                >
                                    GoodData.CN
                                </a>
                            </li>
                            <li className="gd-docs-header-nav__menuitem gd-header-link-item">
                                <a
                                    href="https://sdk.gooddata.com/gooddata-ui/"
                                    className="gd-docs-header-nav__menulink gd-header-link"
                                >
                                    GoodData.UI
                                </a>
                            </li>
                            <li className="gd-docs-header-nav__menuitem gd-header-link-item gd-header-link-active">
                                <a
                                    href="https://www.gooddata.com/developers/cloud-native/doc/"
                                    className="gd-docs-header-nav__menulink gd-header-link"
                                >
                                    Docs &amp; APIs
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="gd-docs-header-nav__right">
                        <a
                            href="https://www.gooddata.com/developers/cloud-native-community-edition/"
                            className="gd-docs-header-nav__cta"
                        >
                            Get GoodData.CN Community Edition
                        </a>
                    </div>
                </nav>

                <nav className="gd-docs-header-nav gd-docs-header-nav__second">
                    <div className="gd-docs-header-nav__left">
                        <a
                            className="gd-docs-header-nav__title"
                            href="https://www.gooddata.com/developers/cloud-native/doc/"
                        >
                            <img src={icon} alt={appName} />
                            Docs APIs
                        </a>
                        <span className="gd-docs-header-nav__title gd-docs-header-nav__breadcrumb">
                            <img src={chevron} />
                            GoodData.UI
                        </span>
                    </div>
                    <div className="gd-docs-header-nav__center"></div>
                    <div className="gd-docs-header-nav__right">
                        <a
                            href="https://github.com/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-examples#getting-started"
                            className="button-header button-header-border"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Run Locally
                        </a>
                        {!ANONYMOUS_ACCESS ? renderLoggingBlock() : null}
                    </div>
                </nav>
            </div>
            {renderBackendInfo()}
        </div>
    );
};

export const Header = withRouter(CoreHeader);
