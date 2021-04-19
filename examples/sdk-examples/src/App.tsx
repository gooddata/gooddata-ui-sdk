// (C) 2019 GoodData Corporation
import React, { useEffect } from "react";
import ReactGA from "react-ga";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { CustomLoading } from "./components/CustomLoading";
import { Header } from "./components/Header";
import { Menu } from "./components/Menu";
import { useAuth, AuthStatus } from "./context/auth";
import { routes, sideNavigationRoutes, userRoutes } from "./constants/routes";
import { workspace } from "./constants/fixtures";
import { history } from "./history";

export const App: React.FC = () => {
    const { authStatus, logout, backend } = useAuth();

    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <Router history={history}>
                    <div className="mainWrapper">
                        <style jsx>{`
                            :global(html),
                            :global(body),
                            :global(.root) {
                                height: 100%;
                            }

                            :global(body) {
                                background-color: #fafafa;
                            }

                            :global(*),
                            :global(::before),
                            :global(::after) {
                                box-sizing: border-box;
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
                                padding-top: 124px;
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
                                height: 100%;
                            }
                        `}</style>
                        <Header
                            routes={routes}
                            isUserLoggedIn={authStatus === AuthStatus.AUTHORIZED}
                            logoutAction={logout}
                        />
                        <div className="pageWrapper">
                            {(authStatus === AuthStatus.AUTHORIZED) === true && (
                                // @ts-expect-error the sideNavigationRoutes typings are behaving strange here
                                <Menu sideNavigationRoutes={sideNavigationRoutes} routes={routes} />
                            )}
                            <main>
                                {authStatus === AuthStatus.AUTHORIZING && (
                                    <div className="flexWrapper flexWrapper--center">
                                        <CustomLoading
                                            height={undefined}
                                            label="Checking if user is already logged in&hellip;"
                                        />
                                    </div>
                                )}
                                {authStatus === AuthStatus.LOGGING_OUT && (
                                    <div className="flexWrapper flexWrapper--center">
                                        <CustomLoading height={undefined} label="Logging out&hellip;" />
                                    </div>
                                )}
                                {authStatus !== AuthStatus.AUTHORIZING && (
                                    <div className="flexWrapper">
                                        <Switch>
                                            {userRoutes.map(
                                                ({ title: _, path, Component, ...routeProps }) => (
                                                    <Route
                                                        key={path}
                                                        path={path}
                                                        component={Component}
                                                        {...routeProps}
                                                    />
                                                ),
                                            )}
                                            {authStatus === AuthStatus.UNAUTHORIZED && (
                                                <Redirect
                                                    to={{
                                                        pathname: "/login",
                                                        state: {
                                                            redirectUriAfterLogin: "/",
                                                            defaultRoute: true,
                                                        },
                                                    }}
                                                />
                                            )}
                                        </Switch>
                                        {authStatus === AuthStatus.AUTHORIZED &&
                                            routes.map(({ title: _, path, Component, ...routeProps }) => (
                                                <Route
                                                    key={path}
                                                    path={path}
                                                    component={Component}
                                                    {...routeProps}
                                                />
                                            ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                </Router>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
