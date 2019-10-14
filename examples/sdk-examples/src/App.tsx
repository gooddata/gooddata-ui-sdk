// (C) 2019 GoodData Corporation
import React, { useEffect } from "react";
import ReactGA from "react-ga";
import { Redirect, Route, Router, Switch } from "react-router-dom";

import { CustomError } from "./components/utils/CustomError";
import CustomLoading from "./components/utils/CustomLoading";
import Header from "./components/utils/Header";
import Menu from "./components/utils/Menu";

import { routes, sideNavigationRoutes, topNavigationRoutes, userRoutes } from "./routes/_list";

import { useAuth, AuthStatus } from "./context/auth";

import { BackendProvider } from "./backend";
import { BASEPATH } from "./constants";
import { history } from "./history";

export const App: React.FC = () => {
    const { authError, authStatus, logout, login } = useAuth();

    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <BackendProvider>
            <Router basepath={BASEPATH} history={history}>
                <div className="mainWrapper">
                    <style jsx={true}>{`
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
                            padding-top: 64px;
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
                            width: 100%;
                            padding: 20px 40px;
                        }
                    `}</style>
                    <Header
                        topNavigationRoutes={topNavigationRoutes}
                        routes={routes}
                        isUserLoggedIn={authStatus === AuthStatus.AUTHORIZED}
                        logoutAction={logout}
                    />
                    <div className="pageWrapper">
                        {(authStatus === AuthStatus.AUTHORIZED) === true && (
                            <Menu sideNavigationRoutes={sideNavigationRoutes} routes={routes} />
                        )}
                        {authError ? <CustomError message={authError} /> : null}
                        <main>
                            {authStatus === AuthStatus.AUTHORIZING && (
                                <div className="flexWrapper flexWrapper--center">
                                    <CustomLoading
                                        height={null}
                                        label="Checking if user is already logged in&hellip;"
                                    />
                                </div>
                            )}
                            {authStatus === AuthStatus.LOGGING_OUT && (
                                <div className="flexWrapper flexWrapper--center">
                                    <CustomLoading height={null} label="Logging out&hellip;" />
                                </div>
                            )}
                            {authStatus !== AuthStatus.AUTHORIZING && (
                                <div className="flexWrapper">
                                    <Switch>
                                        {userRoutes.map(({ title, path, Component, ...routeProps }) => (
                                            <Route
                                                key={path}
                                                path={path}
                                                // tslint:disable-next-line:jsx-no-lambda
                                                component={() => (
                                                    <Component
                                                        isLoggedIn={authStatus === AuthStatus.AUTHORIZED}
                                                        onLogin={login}
                                                    />
                                                )}
                                                {...routeProps}
                                            />
                                        ))}
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
                                        routes.map(({ title, path, Component, ...routeProps }) => (
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
        </BackendProvider>
    );
};
