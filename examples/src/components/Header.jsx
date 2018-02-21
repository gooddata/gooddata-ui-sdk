import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { NavLink, Link, withRouter } from 'react-router-dom';

const favicon = require('../static/favicon.ico');

class Header extends React.Component {
    render() {
        const { match, navigation, title } = this.props;
        const href = match.path;
        const navItem = href !== undefined ? navigation.find(link => link.href === href) : {};
        const pageTitle = title !== undefined ? title : navItem.title;

        const navigationElements = navigation.map(link => (
            <li key={link.href}>
                <NavLink to={link.href} className="gd-header-menu-item s-menu-dashboards" activeClassName="active" exact>
                    <span>{link.title}</span>
                </NavLink>
            </li>
        ));

        return (
            <div className="page">
                <Helmet>
                    <title>{title}</title>
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
    match: PropTypes.object.isRequired,
    navigation: PropTypes.array,
    title: PropTypes.string,
    isUserLoggedIn: PropTypes.bool.isRequired,
    logoutAction: PropTypes.func.isRequired
};
Header.defaultProps = {
    navigation: [],
    title: undefined
};

export default withRouter(Header);
