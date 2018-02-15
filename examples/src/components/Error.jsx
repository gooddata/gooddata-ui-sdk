
import React from 'react';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

export const Error = ({ error }) => (
    <div
        className="s-error"
        style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            height: '100%'
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
    }).isRequired
};

export default Error;
