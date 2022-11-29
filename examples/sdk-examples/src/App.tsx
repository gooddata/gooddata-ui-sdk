// (C) 2019-2022 GoodData Corporation
import React, { useEffect } from "react";
import ReactGA from "react-ga";
import { Route, Router } from "react-router-dom";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { Header } from "./components/Header";
import { Menu } from "./components/Menu";
import { routes, sideNavigationRoutes } from "./constants/routes";
import { workspace } from "./constants/fixtures";
import { history } from "./history";
import { backend } from "./backend";

export const App: React.FC = () => {
    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <Router history={history}>
                    <div className="mainWrapper">
                        <style jsx>{`
                            // globals from goodstrap
                            :global(html),
                            :global(body) {
                                margin: 0;
                                padding: 0;
                                line-height: 1.4rem;
                                color: var(--gd-palette-complementary-8, #464e56);
                                font-size: 14px;
                                font-weight: 400;
                                font-family: gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif;
                                font-weight: 400;
                            }

                            :global(button),
                            :global(input),
                            :global(optgroup),
                            :global(select),
                            :global(textarea) {
                                outline: 0;
                                font: inherit;
                                color: inherit;
                            }

                            :global(a) {
                                color: #14b2e2;
                                text-decoration: none;
                            }
                            :global(a:hover),
                            :global(a:focus),
                            :global(a:active) {
                                color: var(--gd-palette-complementary-8, #464e56);
                                text-decoration: underline;
                            }
                            :global(a.link-dimmed) {
                                color: var(--gd-palette-complementary-7, #6d7680);
                                text-decoration: underline;
                            }
                            :global(a.link-dimmed:hover) {
                                color: #000;
                            }
                            // end globals from goodstrap

                            :global(html),
                            :global(body),
                            :global(.root) {
                                height: 100%;
                            }

                            :global(html),
                            :global(body) {
                                background: #fafafa;
                            }

                            :global(*),
                            :global(::before),
                            :global(::after) {
                                box-sizing: border-box;
                            }

                            :global(hr.separator-inner) {
                                border: 0;
                                margin: 5px 0;
                            }

                            :global(hr.separator) {
                                border: 1px solid #eee;
                                border-width: 1px 0 0 0;
                                margin: 20px 0;
                            }

                            :global(.mainWrapper) {
                                display: flex;
                                height: 100%;
                                flex-direction: column;
                                justify-content: flex-start;
                                align-items: center;
                                padding-top: 139px;
                            }

                            :global(h1),
                            :global(h2),
                            :global(h3) {
                                color: black;
                            }

                            :global(h1) {
                                margin: 0 0 48px;
                                font-weight: bold;
                                font-size: 50px;
                                line-height: 50px;
                            }

                            :global(h2) {
                                font-weight: normal;
                                font-size: 40px;
                                line-height: 55px;
                            }

                            :global(h3) {
                                font-weight: bold;
                                font-size: 24px;
                            }

                            :global(p) {
                                max-width: 800px;
                            }

                            // some p tags must not be affected by the previous rule...
                            :global(.gd-typography--p) {
                                max-width: initial;
                            }

                            .pageWrapper {
                                display: flex;
                                width: 100%;
                                max-width: 1440px;
                            }

                            .flexWrapper {
                                flex: 1 0 auto;
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-start;
                                align-items: stretch;
                            }

                            .flexWrapper--center {
                                justify-content: center;
                            }

                            main {
                                flex: 1 1 auto;
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-start;
                                align-items: stretch;
                                overflow: hidden;
                                padding: 20px 40px;
                            }
                        `}</style>
                        <Header routes={routes} />
                        <div className="pageWrapper">
                            <Menu
                                // @ts-expect-error the sideNavigationRoutes typings are behaving strange here
                                sideNavigationRoutes={sideNavigationRoutes}
                                routes={routes}
                            />

                            <main>
                                <div className="flexWrapper">
                                    {routes.map(({ title: _, path, Component, ...routeProps }) => (
                                        <Route key={path} path={path} component={Component} {...routeProps} />
                                    ))}
                                </div>
                            </main>
                        </div>
                    </div>
                </Router>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
