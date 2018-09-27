// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const LoadingPropTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    speed: PropTypes.number,
    inline: PropTypes.bool,
    height: PropTypes.any,
    width: PropTypes.any,
    imageHeight: PropTypes.any,
    imageWidth: PropTypes.any
};

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
 * [LoadingComponent](http://sdk.gooddata.com/gooddata-ui/docs/loading_component.html)
 * is a component that renders a default loading indicator
 */
export class LoadingComponent extends React.Component<ILoadingProps, null> {
    public static defaultProps: Partial<ILoadingProps> = {
        className: 's-loading',
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
        const { inline, width, height, imageWidth, imageHeight, color, speed, className } = this.props;
        const duration = baseAnimationDuration / speed;
        const delay = duration / -5;

        const dotStyles = {
            transformOrigin: '4px 4px',
            animation: `GDC-pop ${duration}s infinite`,
            animationDelay: `${delay * 2}s`,
            fill: color
        };

        const wrapperStyles = {
            textAlign: 'center',
            display: inline ? 'inline-flex' : 'flex',
            verticalAlign: 'middle',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            flex: '1 0 auto',
            height,
            width
        };
        const svgStyles = {
            maxHeight: '100%',
            maxWidth: '100%',
            flex: '0 1 auto',
            width: imageWidth,
            height: imageHeight
        };
        const dot1Styles = dotStyles;
        const dot2Styles = {
            ...dotStyles,
            transformOrigin: '18px 4px',
            animationDelay: `${delay}s`
        };
        const dot3Styles = {
            ...dotStyles,
            transformOrigin: '32px 4px',
            animationDelay: 0
        };

        return (
            <div
                className={className}
                // this is intentional. Typescript complains about exact matching of css string values to enum.
                style={wrapperStyles as any}
            >
                <svg
                    style={svgStyles}
                    version="1.1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 36 8"
                >
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
                    <g style={dot1Styles}><circle cx="4" cy="4" r="4" /></g>
                    <g style={dot2Styles}><circle cx="18" cy="4" r="4" /></g>
                    <g style={dot3Styles}><circle cx="32" cy="4" r="4" /></g>
                </svg>
            </div>
        );
    }
}
