// (C) 2025 GoodData Corporation

import React from "react";

export const HorizontalDirectionIcon: React.FC<{ color?: string; className?: string }> = ({
    color = "#6D7680",
    className,
}) => {
    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.00049 18.5498C1.00049 18.7983 1.20216 19 1.45068 19H4.00049V20H1.45068C0.649871 20 0.000488316 19.3506 0.000488281 18.5498V16H1.00049V18.5498Z"
                fill={color}
            />
            <path d="M12.0005 20H8.00049V19H12.0005V20Z" fill={color} />
            <path
                d="M20.0005 18.5498C20.0005 19.3505 19.351 19.9999 18.5503 20H16.0005V19H18.5503C18.7987 18.9999 19.0005 18.7983 19.0005 18.5498V16H20.0005V18.5498Z"
                fill={color}
            />
            <path
                d="M10.0005 5.5C10.2766 5.50003 10.5005 5.72388 10.5005 6V12.793L11.647 11.6465C11.8422 11.4513 12.1587 11.4513 12.354 11.6465C12.5492 11.8417 12.5492 12.1583 12.354 12.3535L10.354 14.3535C10.3199 14.3876 10.2809 14.4134 10.2407 14.4355C10.1965 14.46 10.1493 14.4801 10.0981 14.4902C10.0334 14.5031 9.96658 14.5032 9.90186 14.4902C9.85074 14.48 9.80347 14.4601 9.75928 14.4355C9.71942 14.4134 9.68081 14.3873 9.64697 14.3535L7.64697 12.3535C7.45174 12.1583 7.45173 11.8417 7.64697 11.6465C7.84223 11.4513 8.15875 11.4513 8.354 11.6465L9.50049 12.793V6C9.50049 5.72386 9.72435 5.5 10.0005 5.5Z"
                fill={color}
            />
            <path d="M1.00049 12H0.000488281V8H1.00049V12Z" fill={color} />
            <path d="M20.0005 12H19.0005V8H20.0005V12Z" fill={color} />
            <path
                d="M4.00049 1H1.45068C1.20216 1 1.00049 1.20167 1.00049 1.4502V4H0.000488281V1.4502C0.000488246 0.649383 0.649871 3.50046e-08 1.45068 0H4.00049V1Z"
                fill={color}
            />
            <path
                d="M18.5503 0C19.351 0.000132405 20.0005 0.649464 20.0005 1.4502V4H19.0005V1.4502C19.0005 1.20175 18.7987 1.00013 18.5503 1H16.0005V0H18.5503Z"
                fill={color}
            />
            <path d="M12.0005 1H8.00049V0H12.0005V1Z" fill={color} />
        </svg>
    );
};
