// (C) 2007-2022 GoodData Corporation
import React, { PureComponent } from "react";
import cx from "classnames";

import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Bubble } from "../Bubble/Bubble.js";
import { IAlignPoint } from "../typings/positioning.js";

// ShortenText adds ellipsis (…) in the middle of the string.
// SIDE_SCALE_RATIO is a constant which tells the percentage of
// of the string characters to be taken from both sides to produce
// final shortened string
const SIDE_SCALE_RATIO = 0.42;

function getElementWidth(element: Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">): number {
    return Math.ceil(element.getBoundingClientRect().width);
}

export function getShortenedTitle(
    title: string,
    element: Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">,
): string {
    const elementWidth = getElementWidth(element);
    const { scrollWidth } = element;

    if (elementWidth >= scrollWidth) {
        return title;
    }

    const titleLength = title.length;
    const numChars = titleLength * (elementWidth / scrollWidth);

    const numCharsSideStrip = Math.floor(numChars * SIDE_SCALE_RATIO);

    const pre = title.substr(0, numCharsSideStrip);
    const post = title.substr(titleLength - numCharsSideStrip, titleLength);

    return `${pre}…${post}`;
}

/**
 * @internal
 */
export interface IShortenedTextProps {
    children: string;
    className?: string;
    tagName?: React.ElementType;
    tooltipAlignPoints?: IAlignPoint[];
    tooltipVisibleOnMouseOver?: boolean;
    getElement?: (context: any) => Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect">;
    displayTooltip?: boolean;
}

/**
 * @internal
 */
export interface IShortenedTextState {
    title: string;
    customTitle: boolean;
}

/**
 * To make this component work, parent container needs this:
 *      max-width: Xpx;
 *      white-space: nowrap;
 *
 * and the component itself needs:
 *      display: inline-block;
 *      width: 100%;
 *      white-space: nowrap;
 */

/**
 * @internal
 */
export class ShortenedText extends PureComponent<IShortenedTextProps, IShortenedTextState> {
    static defaultProps: Pick<
        IShortenedTextProps,
        | "className"
        | "tagName"
        | "tooltipAlignPoints"
        | "tooltipVisibleOnMouseOver"
        | "getElement"
        | "displayTooltip"
    > = {
        className: "",
        tagName: "span",
        tooltipAlignPoints: [{ align: "cr cl" }],
        tooltipVisibleOnMouseOver: false,
        getElement(context) {
            // Necessary for testing width in JSDOM env.
            return context.textRef.current;
        },
        displayTooltip: true,
    };

    textRef = React.createRef<HTMLElement>();

    constructor(props: IShortenedTextProps) {
        super(props);

        this.state = {
            title: props.children,
            customTitle: false,
        };
    }

    componentDidMount(): void {
        this.checkTitle();
    }

    UNSAFE_componentWillReceiveProps(nextProps: IShortenedTextProps): void {
        if (this.props.children !== nextProps.children) {
            this.setState({
                title: nextProps.children,
                customTitle: false,
            });
        }
    }

    componentDidUpdate(): void {
        if (this.state.customTitle) {
            return;
        }

        this.checkTitle();
    }

    checkTitle(): void {
        const element = this.props.getElement(this);
        const title = this.props.children;
        const elementWidth = getElementWidth(element);

        if (elementWidth > 0 && elementWidth < element.scrollWidth) {
            this.setState({ title: getShortenedTitle(title, element), customTitle: true });
        }
    }

    recomputeShortening(): void {
        // causes repaint & checkTitle to be called
        this.setState({
            title: this.props.children,
            customTitle: false,
        });
    }

    renderTextWithBubble(): React.ReactNode {
        return (
            <BubbleHoverTrigger
                showDelay={0}
                hideDelay={0}
                eventsOnBubble={this.props.tooltipVisibleOnMouseOver}
            >
                <Bubble alignPoints={this.props.tooltipAlignPoints}>
                    {this.state.customTitle ? this.props.children : ""}
                </Bubble>
                {this.renderText()}
            </BubbleHoverTrigger>
        );
    }

    renderText(): React.ReactNode {
        const TagName = this.props.tagName;
        return (
            <TagName
                ref={this.textRef}
                className={cx(this.props.className, "shortened", {
                    "is-shortened": this.state.customTitle,
                    "is-whole": !this.state.customTitle,
                })}
            >
                {this.state.title}
            </TagName>
        );
    }

    render() {
        if (this.state.customTitle && this.props.displayTooltip) {
            return this.renderTextWithBubble();
        }

        return this.renderText();
    }
}
