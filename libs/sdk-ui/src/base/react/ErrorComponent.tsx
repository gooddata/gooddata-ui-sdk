// (C) 2007-2022 GoodData Corporation
import React from "react";

/**
 * With custom size layouting enable it needs to be aware of the widget size to update
 * its content accordingly.
 */
const SMALL_CLIENT_HEIGHT = 140;
const MEDIUM_CLIENT_HEIGHT = 160;
const NORMAL_CLIENT_HEIGHT = 180;
const LARGE_CLIENT_HEIGHT = 200;
const LARGEST_CLIENT_HEIGHT = 220;

const SMALL_CUSTOM_HEIGHT = 44;
const NORMAL_CUSTOM_HEIGHT = 64;

const getCustomHeight = (clientHeight?: number) => {
    if (clientHeight) {
        if (clientHeight <= SMALL_CLIENT_HEIGHT) {
            return SMALL_CUSTOM_HEIGHT;
        } else if (clientHeight < NORMAL_CLIENT_HEIGHT) {
            return NORMAL_CUSTOM_HEIGHT;
        } else {
            return undefined;
        }
    }

    return undefined;
};

/**
 * Props of the {@link ErrorComponent}.
 * @public
 */
export interface IErrorProps {
    code?: string;
    icon?: string;
    message: string;
    description?: string;
    className?: string;
    style?: object;
    width?: any;
    /**
     * Size of the error component.
     */
    height?: any;
    /**
     * Size of the visualisation content when custom size layouting is enabled.
     */
    clientHeight?: any;
}

/**
 * Component that renders a default error message.
 *
 * @remarks
 * See {@link https://sdk.gooddata.com/gooddata-ui/docs/error_component.html | ErrorComponent}
 *
 * @public
 */
export class ErrorComponent extends React.Component<IErrorProps> {
    public static defaultProps: Partial<IErrorProps> = {
        icon: "gd-icon-warning",
        className: "Error s-error",
        width: undefined,
        height: "100%",
        style: {
            display: "flex",
            flex: "1 0 auto",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "normal",
            lineHeight: "normal",
            fontFamily: "gdcustomfont, avenir, Helvetica Neue, arial, sans-serif",
        },
    };

    public render() {
        const { className, style, width, height, message, description, icon, clientHeight } = this.props;

        const customHeight = getCustomHeight(clientHeight);
        const wrapperStyle = {
            ...style,
            width,
            height,
        };

        return (
            <div className={className} style={wrapperStyle}>
                <div
                    className="info-label"
                    style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "normal",
                        color: "var(--gd-palette-complementary-6, #94a1ad)",
                        textAlign: "center",
                        height: customHeight,
                        width: "100%",
                        overflow: "hidden",
                    }}
                >
                    {icon ? (
                        <div
                            className={`info-label-icon ${icon}`}
                            style={
                                clientHeight && clientHeight < LARGEST_CLIENT_HEIGHT
                                    ? undefined
                                    : { fontSize: "40px" }
                            }
                        />
                    ) : null}

                    <div
                        style={{
                            fontWeight: 400,
                            fontSize:
                                clientHeight && clientHeight < MEDIUM_CLIENT_HEIGHT ? undefined : "20px",
                            textTransform: "uppercase",
                        }}
                    >
                        {message}
                    </div>
                    <div
                        style={{
                            margin: "3px 0",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace:
                                clientHeight && clientHeight < LARGE_CLIENT_HEIGHT ? "nowrap" : undefined,
                        }}
                    >
                        {description}
                    </div>
                </div>
            </div>
        );
    }
}
