import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const LoadingPropTypes = {
    color: PropTypes.string,
    speed: PropTypes.number,
    inline: PropTypes.bool,
    height: PropTypes.any,
    width: PropTypes.any,
    imageHeight: PropTypes.any,
    imageWidth: PropTypes.any
};

export interface ILoadingProps {
    color?: string;
    speed?: number;
    inline?: boolean;
    height?: any;
    width?: any;
    imageHeight?: any;
    imageWidth?: any;
}

const baseAnimationDuration = 1.4;

export class LoadingComponent extends React.Component<ILoadingProps, null> {
    public static defaultProps: Partial<ILoadingProps> = {
        color: '#94a1ad',
        speed: 1,
        inline: false,
        height: '100%',
        width: undefined,
        imageHeight: 8,
        imageWidth: undefined
    };

    public static propTypes = LoadingPropTypes;

    public render() {
        const { inline, width, height, imageWidth, imageHeight, color, speed } = this.props;
        const duration = baseAnimationDuration / speed;
        const delay = duration / -5;
        return (
            <div
                className="s-loading"
                style={{
                    textAlign: 'center',
                    display: inline ? 'inline-flex' : 'flex',
                    verticalAlign: 'middle',
                    flexDirection: 'column',
                    alignContent: 'center',
                    justifyContent: 'center',
                    flex: '1 0 auto',
                    height,
                    width
                }}
            >
                <img
                    alt="loading…"
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        flex: '0 1 auto',
                        width: imageWidth,
                        height: imageHeight
                    }}
                    src={`
                        data:image/svg+xml;utf8,<svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            version="1.1"
                            x="0px"
                            y="0px"
                            viewBox="0 0 36 8"
                            xml:space="preserve"
                            height="8"
                            width="36"
                        >
                        <style>
                            .GDC-dot-1,
                            .GDC-dot-2,
                            .GDC-dot-3 {
                                transform-origin: 4px 4px;
                                animation: GDC-pop ${duration}s infinite;
                                animation-delay: ${delay * 2}s;
                                fill: ${color};
                            }
                            .GDC-dot-2 {
                                transform-origin: 18px 4px;
                                animation-delay: ${delay}s;
                            }
                            .GDC-dot-3 {
                                transform-origin: 32px 4px;
                                animation-delay: 0s;
                            }
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
                        </style>
                        <g class="GDC-dot-1" ><circle cx="4" cy="4" r="4" /></g>
                        <g class="GDC-dot-2" ><circle cx="18" cy="4" r="4" /></g>
                        <g class="GDC-dot-3" ><circle cx="32" cy="4" r="4" /></g>
                    </svg>`}
                />
            </div>
        );
    }
}
