// (C) 2007-2020 GoodData Corporation
import React from "react";
import debounce from "lodash/debounce";
import isNumber from "lodash/isNumber";

/**
 * @internal
 */
export interface IResponsiveTextProps {
    tagName?: "div" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "dt";
    tagClassName?: string;
    windowResizeRefreshDelay?: number;
    title?: string;
    window?: {
        addEventListener: Window["addEventListener"];
        getComputedStyle: Window["getComputedStyle"];
        removeEventListener: Window["removeEventListener"];
    };
    children?: React.ReactNode;
}

/**
 * @internal
 */
export interface IResponsiveTextState {
    fontSize: number | null;
}

/**
 * @internal
 */
export class ResponsiveText extends React.PureComponent<IResponsiveTextProps, IResponsiveTextState> {
    static defaultProps: Partial<IResponsiveTextProps> = {
        tagName: "div",
        tagClassName: null,
        windowResizeRefreshDelay: 50,
        title: null,
        children: null,
        window,
    };

    state: IResponsiveTextState = {
        fontSize: null,
    };

    containerRef = React.createRef<HTMLDivElement>();
    handleWindowResize: () => void;

    constructor(props: IResponsiveTextProps) {
        super(props);

        this.handleWindowResize = debounce(this.resetFontSize, props.windowResizeRefreshDelay);
    }

    resetFontSize = (): void => {
        this.setState({
            fontSize: null,
        });
    };

    componentDidMount(): void {
        const { window } = this.props;

        window.addEventListener("resize", this.handleWindowResize);

        this.adjustTextSize();
    }

    UNSAFE_componentWillReceiveProps(): void {
        this.resetFontSize();
    }

    componentDidUpdate(): void {
        this.adjustTextSize();
    }

    componentWillUnmount(): void {
        const { window } = this.props;

        window.removeEventListener("resize", this.handleWindowResize);
    }

    adjustTextSize(): void {
        const currentStyle = this.props.window.getComputedStyle(this.containerRef.current, null);
        const currentFontSize = parseFloat(currentStyle.fontSize);

        if (!this.state.fontSize && isNumber(currentFontSize)) {
            const { scrollWidth } = this.containerRef.current;
            const width = this.containerRef.current
                ? this.containerRef.current.getBoundingClientRect().width
                : 0;

            const ratio = width / scrollWidth;
            const size = Math.floor(currentFontSize * ratio);

            this.setState({
                fontSize: size,
            });
        }
    }

    render(): React.ReactNode {
        const { tagName: Tag, tagClassName, title, children } = this.props;
        const { fontSize } = this.state;

        return (
            <Tag
                className={tagClassName}
                ref={this.containerRef}
                style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
                title={title}
            >
                {children}
            </Tag>
        );
    }
}
