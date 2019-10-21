// (C) 2007-2019 GoodData Corporation

import React from "react";

interface ICustomErrorProps {
    message: string;
    height?: string | number;
}

export const CustomError: React.FC<ICustomErrorProps> = ({ message, height }) => (
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
