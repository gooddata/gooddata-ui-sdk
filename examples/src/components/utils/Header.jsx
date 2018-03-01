/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { NavLink, Link, withRouter } from 'react-router-dom';

const favicon = require('../../static/favicon.ico');

const appName = 'GoodData SDK Examples';

class Header extends React.Component {
    render() {
        const { location: { pathname }, mainRoutes, routes } = this.props;
        const href = pathname;
        const currentRoute = (href !== undefined && routes.find(link => (link.path === BASEPATH + href))) || null;
        const pageTitle = currentRoute !== null ? `${currentRoute.title} | ${appName}` : appName;

        const navigationElements = mainRoutes.map(({ path, title, exact = false }) => (
            <li key={path}>
                <NavLink to={path} className="gd-header-menu-item s-menu-dashboards" activeClassName="active" exact={exact}>
                    <span>{title}</span>
                </NavLink>
            </li>
        ));

        return (
            <div className="page">
                {/* language=CSS */}
                <style jsx>{`
                    .gd-header {
                        flex: 0;
                    }
                `}</style>
                <Helmet>
                    <title>{pageTitle}</title>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <link rel="shortcut icon" type="image/x-icon" href={favicon} />
                </Helmet>
                <div className="gd-header header-6 is-loaded">
                    <Link to="/" className="gd-header-logo gd-header-measure">
                        <img src="https://secure.gooddata.com/images/header/logo.png" alt={pageTitle} />
                    </Link>
                    <div className="gd-header-stretch gd-header-menu-wrapper">
                        <div className="gd-header-menu gd-header-menu-horizontal">
                            <ul className="gd-header-menu-section gd-header-measure">
                                {navigationElements}
                            </ul>
                        </div>
                    </div>
                    {this.props.isUserLoggedIn && (<div className="gd-header-account gd-header-measure logout" onClick={this.props.logoutAction}>Logout</div>)}
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    location: PropTypes.object.isRequired,
    mainRoutes: PropTypes.array,
    routes: PropTypes.array,
    isUserLoggedIn: PropTypes.bool.isRequired,
    logoutAction: PropTypes.func.isRequired
};
Header.defaultProps = {
    mainRoutes: [],
    routes: []
};

export default withRouter(Header);
