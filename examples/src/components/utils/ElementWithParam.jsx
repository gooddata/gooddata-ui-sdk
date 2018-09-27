// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import PropTypes from 'prop-types';

export class ElementWithParam extends React.Component {
    static propTypes = {
        component: PropTypes.any,
        onClick: PropTypes.func,
        params: PropTypes.array
    };

    static defaultProps = {
        component: props => <button {...props} />,
        onClick: f => f,
        params: []
    };

    onClick = () => {
        return this.props.onClick(...this.props.params);
    };

    render() {
        const { component: Elem, ...otherProps } = this.props;
        delete otherProps.params;
        return <Elem {...otherProps} onClick={this.onClick} />;
    }
}
