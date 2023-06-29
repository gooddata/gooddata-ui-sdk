// (C) 2007-2022 GoodData Corporation
import React, { Component, createRef } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";

const BUBBLE_OFFSET_X = 16;

/**
 * @internal
 */
export type SingleSelectListItemType = "header" | "separator";

/**
 * @internal
 */
export interface ISingleSelectListItemProps {
    title?: string;
    icon?: string;
    type?: SingleSelectListItemType;
    className?: string;
    info?: string;

    isSelected?: boolean;

    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseOut?: (e: React.MouseEvent<HTMLElement>) => void;
}
/**
 * @internal
 */
export interface ISingleSelectListItemState {
    isOverflowed: boolean;
}
/**
 * @internal
 */
export class SingleSelectListItem extends Component<ISingleSelectListItemProps, ISingleSelectListItemState> {
    private titleRef = createRef<HTMLSpanElement>();

    constructor(props: ISingleSelectListItemProps) {
        super(props);
        this.state = { isOverflowed: false };
    }

    public componentDidMount(): void {
        this.checkOverflow();
    }

    public componentDidUpdate(): void {
        this.checkOverflow();
    }

    private checkOverflow(): void {
        if (this.titleRef.current) {
            // Checks if ellipsis has been applied on title span
            const isOverflowed = this.titleRef.current.offsetWidth < this.titleRef.current.scrollWidth;
            if (isOverflowed !== this.state.isOverflowed) {
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({
                    isOverflowed,
                });
            }
        }
    }

    private getClassNames = () => {
        const { title, isSelected, className } = this.props;
        const generatedSeleniumClass = `s-${stringUtils.simplifyText(title)}`;

        return cx("gd-list-item", className, generatedSeleniumClass, { "is-selected": isSelected });
    };

    public render(): JSX.Element {
        const { icon, onClick, onMouseOver, onMouseOut, type } = this.props;

        if (type === "separator") {
            return this.renderSeparatorItem();
        }

        if (type === "header") {
            return this.renderHeaderItem();
        }

        return (
            <div
                className={this.getClassNames()}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                {this.renderIcon(icon)}
                {this.renderTitle()}
                {this.renderInfo()}
            </div>
        );
    }

    private renderTitle = () => {
        const { title } = this.props;

        const titleElement = <span ref={this.titleRef}>{title}</span>;

        if (this.state.isOverflowed) {
            return (
                <BubbleHoverTrigger>
                    {titleElement}
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                        arrowOffsets={{
                            "cr cl": [BUBBLE_OFFSET_X, 0],
                            "cl cr": [-BUBBLE_OFFSET_X, 0],
                        }}
                    >
                        {title}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        return titleElement;
    };

    private renderIcon = (icon: string) => {
        if (icon) {
            const iconClasses = cx("gd-list-icon", icon);
            return <span role="icon" className={iconClasses} />;
        }

        return null;
    };

    private renderSeparatorItem = () => {
        return (
            <div
                role="item-separator"
                className={cx(
                    "gd-list-item",
                    "gd-list-item-separator",
                    "s-list-separator",
                    this.props.className,
                )}
            />
        );
    };

    private renderHeaderItem = () => {
        return (
            <div
                role="item-header"
                className={cx("gd-list-item", "gd-list-item-header", "s-list-header", this.props.className)}
            >
                {this.props.title}
            </div>
        );
    };

    private renderInfo = () => {
        if (!this.props.info) {
            return null;
        }

        return (
            <div role="item-info" className="gd-list-item-bubble s-list-item-info">
                <BubbleHoverTrigger tagName="div" showDelay={200} hideDelay={0}>
                    <div className="inlineBubbleHelp" />
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl" }]}
                        arrowOffsets={{ "cr cl": [15, 0] }}
                    >
                        {this.props.info}
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        );
    };
}
