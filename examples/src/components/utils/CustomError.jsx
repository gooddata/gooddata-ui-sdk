// (C) 2007-2019 GoodData Corporation

import React from "react";
import PropTypes from "prop-types";

import "@gooddata/react-components/styles/css/main.css";

export const CustomError = ({ message, height }) => (
    <div
        className="s-error"
        style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            whiteSpace: "normal",
            lineHeight: "normal",
            height,
        }}
    >
        <div
            className="gd-message error"
            style={{
                margin: 0,
                padding: 20,
                display: "block",
            }}
        >
            <div className="gd-message-text">
                <strong>{message}</strong>
            </div>
        </div>
    </div>
);
CustomError.propTypes = {
    message: PropTypes.string.isRequired,
    height: PropTypes.any,
};
CustomError.defaultProps = {
    height: undefined,
};

export default CustomError;
