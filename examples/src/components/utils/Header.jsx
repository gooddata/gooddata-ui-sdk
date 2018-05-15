// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { NavLink, Link, withRouter } from 'react-router-dom';
import CustomLoading from './CustomLoading';

const favicon = require('../../static/favicon.ico');
const logo = require('../../static/gooddata.svg');

const appName = 'GoodData.UI Examples';

class Header extends React.Component {
    renderLoggingBlock = () => {
        const { isUserLoggedIn } = this.props;
        const redirectUri = typeof window !== 'undefined' && !window.location.pathname.match('/login') ? window.location.pathname : '/';
        if (isUserLoggedIn === null) {
            return <div className="gd-header-menu-item" ><CustomLoading color="white" imageHeight={19} /></div>;
        }
        if (isUserLoggedIn === false) {
            return (<div>
                <Link
                    className="gd-header-menu-item button-login"
                    to={{
                        pathname: '/login',
                        state: {
                            redirectUri
                        }
                    }}
                ><span>Login</span></Link>
            </div>);
        }
        return <div className="gd-header-menu-item button-logout" onClick={this.props.logoutAction}>Logout</div>;
    }
    render() {
        const { location: { pathname }, mainRoutes, routes } = this.props;
        const href = pathname;
        const currentRoute = (href !== undefined && routes.find(link => (link.path === BASEPATH + href))) || null;
        const pageTitle = currentRoute === null || currentRoute.title === appName
            ? appName
            : `${currentRoute.title} | ${appName}`;

        const navigationElements = mainRoutes.map(({ path, title, exact = false }) => (
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
                    }

                    .gd-header {
                        z-index: 1;
                        flex: 1 1 100%;
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
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        max-width: 1400px;
                    }

                    .gd-header-menu-wrapper {
                        height: 100%;
                    }

                    .gd-header-logo-img {
                        max-height: none;
                    }

                    .gd-header-inner :global(.gd-header-logo) {
                        opacity: 0.9;
                    }

                    .gd-header-inner :global(.gd-header-logo:hover),
                    .gd-header-inner :global(.gd-header-logo:focus),
                    .gd-header-inner :global(.gd-header-logo:active) {
                        opacity: 1;
                    }

                    .gd-header-inner :global(.gd-header-menu-item) {
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        height: 100%;
                        border-bottom: 2px solid transparent;
                        color: rgba(0, 0, 0, 0.7);
                        font-size: 15px;
                        font-weight: normal;
                        white-space: nowrap;
                        line-height: 19px;
                    }

                    .gd-header-inner :global(.gd-header-menu-item:hover),
                    .gd-header-inner :global(.gd-header-menu-item:focus),
                    .gd-header-inner :global(.gd-header-menu-item:active) {
                        border-color: #464e56;
                    }

                    .gd-header-inner :global(.gd-header-menu-item.active) {
                        border-color: #14b2e2;
                    }

                    .gd-header-inner :global(.button-login),
                    .gd-header-inner :global(.button-logout) {
                        height: 30px;
                        margin: 0;
                        padding: 0 22px;
                        border: 1px solid rgba(0, 0, 0, 0.5);
                        border-radius: 100px;
                        color: black;
                        font-size: 12px;
                        line-height: 28px;
                    }

                    .gd-header-menu,
                    .gd-header-menu-section {
                        flex: 1 1 auto;
                    }

                    .gd-header-menu-section {
                        flex-wrap: wrap;
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
                        <Link to="/" className="gd-header-logo gd-header-measure">
                            <img src={logo} alt={appName} className="gd-header-logo-img" />
                        </Link>
                        <div className="gd-header-stretch gd-header-menu-wrapper">
                            <div className="gd-header-menu gd-header-menu-horizontal">
                                <ul className="gd-header-menu-section gd-header-measure">
                                    {navigationElements}
                                </ul>
                            </div>
                        </div>
                        {this.renderLoggingBlock()}
                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    location: PropTypes.object.isRequired,
    mainRoutes: PropTypes.array,
    routes: PropTypes.array,
    isUserLoggedIn: PropTypes.bool,
    logoutAction: PropTypes.func.isRequired
};
Header.defaultProps = {
    isUserLoggedIn: null,
    mainRoutes: [],
    routes: []
};

export default withRouter(Header);
