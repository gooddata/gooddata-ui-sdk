// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop.js";

import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Bubble } from "../Bubble/Bubble.js";

const BUBBLE_OFFSET_X = 16;

/**
 * @internal
 */
export interface ILegacySingleSelectListItemProps {
    source: any;
    selected: boolean;
    onSelect: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onMouseOut?: (source: any) => void;
}

/**
 * @internal
 */
export interface ILegacySingleSelectListItemState {
    isOverflowed: boolean;
}

/**
 * @internal
 * @deprecated This component is deprecated use SingleSelectListItem instead
 */
export class LegacySingleSelectListItem extends Component<
    ILegacySingleSelectListItemProps,
    ILegacySingleSelectListItemState
> {
    static defaultProps = {
        onMouseOver: noop,
        onMouseOut: noop,
    };

    readonly state = { isOverflowed: false };
    node: HTMLSpanElement = null;

    public componentDidMount(): void {
        this.checkOverflow();
    }

    public componentDidUpdate(): void {
        this.checkOverflow();
    }

    private getClassNames(): string {
        const { source, selected } = this.props;
        const generatedSeleniumClass = `s-${stringUtils.simplifyText(source.title)}`;

        return cx("gd-list-item", generatedSeleniumClass, { "is-selected": selected });
    }

    private checkOverflow(): void {
        if (this.node) {
            // Checks if ellipsis has been applicated on title span
            const isOverflowed = this.node.offsetWidth < this.node.scrollWidth;
            if (isOverflowed !== this.state.isOverflowed) {
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({
                    isOverflowed,
                });
            }
        }
    }

    private handleSelect = (): void => {
        this.props.onSelect(this.props.source);
    };

    private handleMouseOver = (): void => {
        this.props.onMouseOver(this.props.source);
    };

    private handleMouseOut = (): void => {
        this.props.onMouseOut(this.props.source);
    };

    private renderTitle() {
        const { title } = this.props.source;
        const titleElement = (
            <span
                ref={(node) => {
                    this.node = node;
                }}
            >
                {title}
            </span>
        );

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
    }

    private renderIcon(icon: string) {
        if (icon) {
            const iconClasses = cx("gd-list-icon", icon);
            return <span className={iconClasses} />;
        }

        return null;
    }

    public render(): JSX.Element {
        const icon = this.props.source?.icon;
        return (
            <div
                className={this.getClassNames()}
                onClick={this.handleSelect}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            >
                {this.renderIcon(icon)}
                {this.renderTitle()}
            </div>
        );
    }
}
