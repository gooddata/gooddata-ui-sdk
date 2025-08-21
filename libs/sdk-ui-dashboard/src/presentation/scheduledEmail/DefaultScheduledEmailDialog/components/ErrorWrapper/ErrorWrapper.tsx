// (C) 2025 GoodData Corporation

import React from "react";

interface IErrorWrapperProps {
    errorId: string;
    errorMessage: string | null;
    label: string;
    labelId: string;
    children: React.ReactNode;
    className: string;
    labelWrapperClassName: string;
    errorClassName: string;
}

export function ErrorWrapper({
    errorId,
    errorMessage,
    label,
    labelId,
    children,
    className,
    labelWrapperClassName,
    errorClassName,
}: IErrorWrapperProps) {
    return (
        <div className={className}>
            <label htmlFor={labelId} className="gd-label">
                {label}
            </label>
            <div className={labelWrapperClassName}>
                {children}
                {errorMessage ? (
                    <span id={errorId} className={errorClassName}>
                        {errorMessage}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
