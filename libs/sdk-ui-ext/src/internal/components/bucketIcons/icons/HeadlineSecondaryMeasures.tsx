// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function HeadlineSecondaryMeasures({
    color,
    className,
    width = 16,
    height = 16,
    ariaHidden,
}: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <path
                d="M6.84087649 8.55611628L3.52824859 3.5h2.41597674l1.86802326 3.30017442L9.79235324 3.5h2.30389535L8.78362068 8.55611628v3.76095349H6.84087649z"
                fill={color ?? "#B0BECA"}
                fillRule="evenodd"
            />
        </svg>
    );
}
