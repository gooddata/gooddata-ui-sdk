import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as GD from 'gooddata';

const favicon = require('../static/favicon.ico');

export const logout = () => {
    GD.user.logout().then(() => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    });
};

export const markActive = (navigation, href) => navigation.map(link => ({
    ...link,
    active: link.href === href
}));

export const Layout = ({ match, navigation = [], children, title }) => {
    const href = match.path;
    const navItem = href !== undefined ? navigation.find(link => link.href === href) : {};
    const pageTitle = title !== undefined ? title : navItem.title;

    const navigationElements = markActive(navigation, href).map(link => (
        <li key={link.href}>
            <Link to={link.href} className={`gd-header-menu-item s-menu-dashboards${link.active ? ' active' : ''}`}>
                <span>{link.title}</span>
            </Link>
        </li>
    ));

    return (<div className="page">
        <Helmet>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link rel="shortcut icon" type="image/x-icon" href={favicon} />
        </Helmet>
        <style jsx>{`
            main {
                padding: 20px;
            }
            .user {
                cursor: auto;
            }
        `}</style>
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
            <div className="gd-header-account gd-header-measure logout" onClick={logout}>
                Logout
            </div>
        </div>

        <main>
            {children}
        </main>
    </div>);
};

Layout.propTypes = {
    match: PropTypes.object.isRequired,
    navigation: PropTypes.array,
    children: PropTypes.any.isRequired,
    title: PropTypes.string
};
Layout.defaultProps = {
    navigation: [],
    title: undefined
};

export default Layout;
