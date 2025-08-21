// (C) 2024-2025 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export function ColumnContainer({ color = "#94A1AD", className, width, height }: IIconProps) {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width ?? 24}
            height={height ?? 24}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.2 22.7598C1.2 23.058 1.442 23.3 1.74023 23.3H4.8V24.5H1.74023C0.779259 24.5 4.20059e-08 23.7207 0 22.7598V19.7H1.2V22.7598Z"
                fill={color}
            />
            <path d="M14.4 24.5H9.6V23.3H14.4V24.5Z" fill={color} />
            <path
                d="M24 22.7598C24 23.7207 23.2207 24.5 22.2598 24.5H19.2V23.3H22.2598C22.558 23.3 22.8 23.058 22.8 22.7598V19.7H24V22.7598Z"
                fill={color}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.323 13.7059C19.8876 13.7633 20.3367 14.2124 20.3941 14.777L20.4 14.9V19.7L20.3941 19.823C20.3367 20.3876 19.8876 20.8367 19.323 20.8941L19.2 20.9H4.8C4.13726 20.9 3.6 20.3627 3.6 19.7V14.9L3.60586 14.777C3.66746 14.172 4.17879 13.7 4.8 13.7H19.2L19.323 13.7059ZM4.8 19.7H19.2V14.9H4.8V19.7Z"
                fill={color}
            />
            <path d="M1.2 14.9H0V10.1H1.2V14.9Z" fill={color} />
            <path d="M24 14.9H22.8V10.1H24V14.9Z" fill={color} />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.323 4.10586C19.8876 4.16334 20.3367 4.61244 20.3941 5.17695L20.4 5.3V10.1L20.3941 10.223C20.3367 10.7876 19.8876 11.2367 19.323 11.2941L19.2 11.3H4.8C4.13726 11.3 3.6 10.7627 3.6 10.1V5.3L3.60586 5.17695C3.66746 4.572 4.17879 4.1 4.8 4.1H19.2L19.323 4.10586ZM4.8 10.1H19.2V5.3H4.8V10.1Z"
                fill={color}
            />
            <path
                d="M4.8 1.7H1.74023C1.442 1.7 1.2 1.942 1.2 2.24023V5.3H0V2.24023C-4.20053e-08 1.27926 0.779259 0.5 1.74023 0.5H4.8V1.7Z"
                fill={color}
            />
            <path
                d="M22.2598 0.5C23.2207 0.500001 24 1.27926 24 2.24023V5.3H22.8V2.24023C22.8 1.942 22.558 1.7 22.2598 1.7H19.2V0.5H22.2598Z"
                fill={color}
            />
            <path d="M14.4 1.7H9.6V0.5H14.4V1.7Z" fill={color} />
        </svg>
    );
}
