
import React from 'react';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

export const Error = ({ error, height }) => (
    <div
        className="s-error"
        style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            whiteSpace: 'normal',
            lineHeight: 'normal',
            height
        }}
    >
        <div
            className="gd-message error"
            style={{
                margin: 0,
                padding: 20,
                display: 'block'
            }}
        >
            <div className="gd-message-text">
                <strong>{JSON.stringify(error)}</strong>
            </div>
        </div>
    </div>
);
Error.propTypes = {
    error: PropTypes.shape({
        status: PropTypes.string.isRequired,
        message: PropTypes.string
    }).isRequired,
    height: PropTypes.any
};
Error.defaultProps = {
    height: undefined
};

export default Error;
