// (C) 2024-2025 GoodData Corporation

import { SVGAttributes, useMemo } from "react";
import cx from "classnames";

let INSTANCE_COUNTER = 0;

type AgentStateIconProps = SVGAttributes<SVGSVGElement> & {
    loading?: boolean;
    error?: boolean;
    cancelled?: boolean;
};

export function AgentIcon({
    loading = false,
    error = false,
    cancelled = false,
    className = "",
    ...rest
}: AgentStateIconProps) {
    // A precaution in case there are multiple instances of the component on the same page
    // In-line SVGs must obey the unique ID rule as any other HTML element
    const instanceId = useMemo(() => INSTANCE_COUNTER++, []);
    const isLoading = loading && !cancelled && !error;

    // We are adding only one modifier class at a time
    const cn = cx(
        "gd-gen-ai-chat__agent_icon",
        {
            // Error state has the top priority
            "gd-gen-ai-chat__agent_icon--error": error,
            // Cancelled state
            "gd-gen-ai-chat__agent_icon--cancelled": !error && cancelled,
            // Loading state
            "gd-gen-ai-chat__agent_icon--loading": isLoading,
            // The default state with animation on first appearance
            "gd-gen-ai-chat__agent_icon--appear": !loading && !error && !cancelled,
        },
        className,
    );

    return (
        <svg {...rest} className={cn} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath={`url(#clip_mask_${instanceId})`}>
                {isLoading ? (
                    <g className="gd-gen-ai-chat__agent_icon__circle">
                        <path d="M 0 -16 A 16 16 0 0 1 0 16" stroke={`url(#first_half_${instanceId})`} />
                        <path d="M 0 16 A 16 16 0 0 1 0 -16" stroke={`url(#second_half_${instanceId})`} />
                    </g>
                ) : (
                    <circle cx="16" cy="16" r="16" className="gd-gen-ai-chat__agent_icon__background" />
                )}
                <path
                    className="gd-gen-ai-chat__agent_icon__star"
                    d="M16.2317 7.76912C16.2737 7.51389 16.6407 7.5139 16.6827 7.76913L17.1108 10.368C17.493 12.6883 19.3116 14.507 21.632 14.8892L24.2308 15.3172C24.4861 15.3593 24.4861 15.7263 24.2308 15.7683L21.632 16.1964C19.3116 16.5786 17.493 18.3972 17.1108 20.7176L16.6827 23.3164C16.6407 23.5716 16.2737 23.5716 16.2317 23.3164L15.8036 20.7176C15.4214 18.3972 13.6027 16.5786 11.2824 16.1964L8.68355 15.7683C8.42832 15.7263 8.42832 15.3593 8.68355 15.3172L11.2824 14.8892C13.6027 14.507 15.4214 12.6883 15.8036 10.368L16.2317 7.76912Z"
                />
                <path
                    className="gd-gen-ai-chat__agent_icon__star gd-gen-ai-chat__agent_icon__star--flickr"
                    d="M9.87936 20.2796C9.91251 20.0783 10.2019 20.0783 10.235 20.2796C10.3606 21.0419 10.9581 21.6394 11.7204 21.765C11.9217 21.7981 11.9217 22.0875 11.7204 22.1206C10.9581 22.2462 10.3606 22.8437 10.235 23.606C10.2019 23.8073 9.91251 23.8073 9.87936 23.606C9.75379 22.8437 9.15629 22.2462 8.39396 22.1206C8.19271 22.0875 8.19271 21.7981 8.39396 21.765C9.15629 21.6394 9.75379 21.0419 9.87936 20.2796Z"
                />
                <path
                    className="gd-gen-ai-chat__agent_icon__star gd-gen-ai-chat__agent_icon__star--flickr gd-gen-ai-chat__agent_icon__star--flickr--delay"
                    d="M22.6793 7.47953C22.7124 7.27828 23.0018 7.27828 23.0349 7.47953C23.1605 8.24186 23.758 8.83936 24.5203 8.96493C24.7216 8.99808 24.7216 9.28744 24.5203 9.32059C23.758 9.44616 23.1605 10.0437 23.0349 10.806C23.0018 11.0072 22.7124 11.0072 22.6793 10.806C22.5537 10.0437 21.9562 9.44616 21.1939 9.32059C20.9926 9.28744 20.9926 8.99808 21.1939 8.96493C21.9562 8.83936 22.5537 8.24186 22.6793 7.47953Z"
                />
            </g>
            <defs>
                <linearGradient
                    id={`first_half_${instanceId}`}
                    gradientUnits="objectBoundingBox"
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                >
                    <stop offset="0%" className="gd-gen-ai-chat__agent_icon__grad--from" />
                    <stop offset="100%" className="gd-gen-ai-chat__agent_icon__grad--mid" />
                </linearGradient>
                <linearGradient
                    className="gd-gen-ai-chat__agent_icon__grad2"
                    id={`second_half_${instanceId}`}
                    gradientUnits="objectBoundingBox"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop offset="0%" className="gd-gen-ai-chat__agent_icon__grad--mid" />
                    <stop offset="100%" className="gd-gen-ai-chat__agent_icon__grad--to" />
                </linearGradient>
                <clipPath id={`clip_mask_${instanceId}`}>
                    <rect width="32" height="32" rx="16" />
                </clipPath>
            </defs>
        </svg>
    );
}
