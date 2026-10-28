// (C) 2026 GoodData Corporation

import { type IIconProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export function BulletComparative({ color, className, width = 16, height = 16, ariaHidden }: IIconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={ariaHidden}
        >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <path
                    d="M11.0355781,6 L11.0355781,10 L0.00395124613,10 L0.00395124613,6 L11.0355781,6 Z M12.0355781,6 L14.0039512,6 L14.0039512,10 L12.0355781,10 L12.0355781,6 Z M6.03557807,12 L6.03557807,16 L0.00395124613,16 L0.00395124613,12 L6.03557807,12 Z M7.03557807,12 L8.00395125,12 L8.00395125,16 L7.03557807,16 L7.03557807,12 Z M0.00395124614,-1.77635684e-15 L11.0039512,-1.77635684e-15 L11.0039512,4 L0.00395124614,4 L0.00395124614,-1.77635684e-15 Z"
                    fill={color ?? "#94A1AD"}
                />
                <path
                    d="M11.0355781,5.98167694 L12.0355781,5.98167694 L12.0355781,9.98167694 L11.0355781,9.98167694 L11.0355781,5.98167694 Z M6.03557807,11.9816769 L7.03557807,11.9816769 L7.03557807,15.9816769 L6.03557807,15.9816769 L6.03557807,11.9816769 Z M13.0355781,-0.0183230582 L14.0355781,-0.0183230582 L14.0355781,3.98167694 L13.0355781,3.98167694 L13.0355781,-0.0183230582 Z"
                    fillOpacity="0.45"
                    fill={color ?? "#B0BECA"}
                />
            </g>
        </svg>
    );
}
