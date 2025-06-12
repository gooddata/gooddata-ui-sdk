// (C) 2007-2022 GoodData Corporation
import React, { ReactNode, createRef, RefObject } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { IFilterLabelProps, IFilterLabelState } from "./typings.js";

class WrappedFilterLabel extends React.PureComponent<
    IFilterLabelProps & WrappedComponentProps,
    IFilterLabelState
> {
    static defaultProps: Pick<IFilterLabelProps, "isAllSelected" | "isDate" | "selection" | "noData"> = {
        isAllSelected: false,
        isDate: false,
        selection: "",
        noData: false,
    };
    private readonly labelRef: RefObject<HTMLSpanElement>;

    constructor(props: IFilterLabelProps & WrappedComponentProps) {
        super(props);

        this.state = { hasEllipsis: false };
        this.labelRef = createRef<HTMLSpanElement>();
    }

    componentDidMount(): void {
        this.checkEllipsis();
    }

    componentDidUpdate(): void {
        this.checkEllipsis();
    }

    getIsDate(): boolean {
        return this.props.isDate;
    }

    isAllSelected(): boolean {
        return this.props.isAllSelected;
    }

    checkEllipsis(): void {
        const { offsetWidth, scrollWidth } = this.labelRef.current;
        // for some reason, IE11 returns offsetWidth = scrollWidth - 1 even when there is no ellipsis
        const hasEllipsis = offsetWidth < scrollWidth - 1;
        if (hasEllipsis !== this.state.hasEllipsis) {
            this.setState({ hasEllipsis });
        }
    }

    renderSelectionLabel(content: ReactNode): ReactNode {
        return <span className="count s-total-count">{content}</span>;
    }

    renderSelection(): ReactNode {
        if (!this.getIsDate() && !this.props.noData) {
            const { selectionSize, intl } = this.props;

            if (this.isAllSelected()) {
                return this.renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.all" }));
            }

            if (selectionSize === 0) {
                return this.renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.none" }));
            }

            if (this.state.hasEllipsis && selectionSize > 0) {
                return this.renderSelectionLabel(`(${selectionSize})`);
            }
        }

        return false;
    }

    renderTitle(): ReactNode {
        return [
            <span className="filter-label-title" key="title" title={this.props.title}>
                {this.props.title}
            </span>,
            this.isAllSelected() && !this.getIsDate() && !this.props.noData ? (
                <span key="title-colon">: </span>
            ) : (
                false
            ),
        ];
    }

    renderSelectedElements(): ReactNode {
        if (!this.props.selection || this.isAllSelected()) {
            return false;
        }

        return [
            <span key="selection-colon">: </span>,
            <span className="filter-label-selection" key="selection">
                {this.props.selection}
            </span>,
        ];
    }

    render(): ReactNode {
        return (
            <div
                role="attribute-filter-label"
                className="adi-attribute-filter-label s-attribute-filter-label"
            >
                <span className="label" ref={this.labelRef}>
                    {this.renderTitle()}
                    {this.renderSelectedElements()}
                </span>
                {this.renderSelection()}
            </div>
        );
    }
}

/**
 * @internal
 */
export const FilterLabel = injectIntl(WrappedFilterLabel);
