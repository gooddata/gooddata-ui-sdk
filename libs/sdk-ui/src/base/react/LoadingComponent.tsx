// (C) 2007-2022 GoodData Corporation
import React, { CSSProperties } from "react";

/**
 * Props of the {@link LoadingComponent}.
 * @public
 */
export interface ILoadingProps {
    className?: string;
    color?: string;
    speed?: number;
    inline?: boolean;
    height?: any;
    width?: any;
    imageHeight?: any;
    imageWidth?: any;
}

const baseAnimationDuration = 1.4;

/**
 * Component that renders a default loading indicator.
 *
 * @remarks
 * See {@link https://sdk.gooddata.com/gooddata-ui/docs/loading_component.html | LoadingComponent }
 *
 * @public
 */
export class LoadingComponent extends React.Component<ILoadingProps> {
    public static defaultProps: Partial<ILoadingProps> = {
        className: "s-loading",
        color: "var(--gd-palette-complementary-6, #94a1ad)",
        speed: 1,
        inline: false,
        height: "100%",
        width: undefined,
        imageHeight: 8,
        imageWidth: undefined,
    };

    public render(): React.ReactNode {
        const { inline, width, height, imageWidth, imageHeight, color, speed = 1, className } = this.props;
        const duration = baseAnimationDuration / speed;
        const delay = duration / -5;

        const dotStyles: CSSProperties = {
            transformOrigin: "4px 4px",
            animation: `GDC-pop ${duration}s infinite`,
            animationDelay: `${delay * 2}s`,
            fill: color,
        };

        const wrapperStyles: CSSProperties = {
            textAlign: "center",
            display: inline ? "inline-flex" : "flex",
            verticalAlign: "middle",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            flex: "1 0 auto",
            height,
            width,
        };
        const svgStyles: CSSProperties = {
            maxHeight: "100%",
            maxWidth: "100%",
            flex: "0 1 auto",
            width: imageWidth,
            height: imageHeight,
        };
        const dot1Styles: CSSProperties = dotStyles;
        const dot2Styles: CSSProperties = {
            ...dotStyles,
            transformOrigin: "18px 4px",
            animationDelay: `${delay}s`,
        };
        const dot3Styles: CSSProperties = {
            ...dotStyles,
            transformOrigin: "32px 4px",
            animationDelay: "0",
        };

        return (
            <div className={className} style={wrapperStyles}>
                <svg style={svgStyles} version="1.1" x="0px" y="0px" viewBox="0 0 36 8">
                    <style scoped={true}>{`
                        @keyframes GDC-pop {
                            0%,
                            80%,
                            100% {
                                transform: scale(0);
                            }
                            40% {
                                transform: scale(1);
                            }
                        }
                    `}</style>
                    <g style={dot1Styles}>
                        <circle cx="4" cy="4" r="4" />
                    </g>
                    <g style={dot2Styles}>
                        <circle cx="18" cy="4" r="4" />
                    </g>
                    <g style={dot3Styles}>
                        <circle cx="32" cy="4" r="4" />
                    </g>
                </svg>
            </div>
        );
    }
}
