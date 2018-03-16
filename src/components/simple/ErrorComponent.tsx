
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export { Requireable };

export const ErrorPropTypes = {
    icon: PropTypes.string,
    message: PropTypes.string.isRequired,
    cause: PropTypes.instanceOf(Error),
    className: PropTypes.string,
    style: PropTypes.object,
    width: PropTypes.any,
    height: PropTypes.any
};

export interface IErrorProps {
    code?: string;
    icon?: string;
    message: string;
    description?: string;
    cause?: Error;
    className?: string;
    style?: object;
    width?: any;
    height?: any;
}

export class ErrorComponent extends React.Component<IErrorProps, null> {
    public static defaultProps: Partial<IErrorProps> = {
        icon: 'icon-warning',
        cause: null,
        className: 'Error s-error',
        width: undefined,
        height: '100%',
        style: {
            display: 'flex',
            flex: '1 0 auto',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'normal',
            lineHeight: 'normal',
            fontFamily: 'avenir, Helvetica Neue, arial, sans-serif'
        }
    };

    public static propTypes = ErrorPropTypes;

    public render() {
        const { className, style, width, height, message, description, icon } = this.props;

        const wrapperStyle = {
            ...style,
            width,
            height
        };

        return (
            <div
                className={className}
                style={wrapperStyle}
            >
                <div
                    className="info-label"
                    style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: 'normal',
                        color: '#94a1ad',
                        textAlign: 'center'
                    }}
                >
                    {icon ? <div className={`info-label-icon ${icon}`} style={{ fontSize: '40px' }}/> : null}

                    <div
                        style={{
                            fontWeight: 400,
                            fontSize: '20px',
                            textTransform: 'uppercase'
                        }}
                    >
                        {message}
                    </div>
                    <div style={{ margin: '3px 0' }}>
                        {description}
                    </div>
                </div>
            </div>
        );
    }
}
