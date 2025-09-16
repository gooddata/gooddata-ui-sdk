// (C) 2021-2025 GoodData Corporation

import { IIconProps } from "../typings.js";
import { combineIconClasses } from "../utils.js";

/**
 * @internal
 */
export function DrillToDashboard({ color, className, width, height }: IIconProps) {
    return (
        <svg
            className={combineIconClasses(className)}
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 16 16"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <polygon
                    fill={color ?? "#94A1AD"}
                    points="3.32421875 2.17578125 3.32421875 7.42578125 11.609375 7.42578125 8.3828125 4.19921875 9.203125 3.37890625 13.8242188 8 9.203125 12.6210938 8.3828125 11.8007812 11.609375 8.57421875 3.32421875 8.57421875 3.32421875 13.8242188 2.17578125 13.8242188 2.17578125 2.17578125"
                ></polygon>
            </g>
        </svg>
    );
}
