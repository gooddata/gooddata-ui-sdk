// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import * as classNames from "classnames";
import noop = require("lodash/noop");

import List from "@gooddata/goodstrap/lib/List/List";
import Dropdown, { DropdownBody } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";

import { DropdownItem } from "./DropdownItem";
import { IAddTotalButtonProps, AddTotalButton } from "./AddTotalButton";
import { getAddTotalDropdownAlignPoints, shouldShowAddTotalButton } from "./utils";
import { IIndexedTotalItem } from "../../../../interfaces/Totals";
import { TOTALS_TYPES_DROPDOWN_WIDTH } from "../constants/layout";

export interface IAddTotalProps {
    dataSource: object;
    header: IMappingHeader;
    columnIndex: number;
    headersCount: number;
    addingMoreTotalsEnabled: boolean;
    onDropdownOpenStateChanged?: (columnIndex: number, isOpened: boolean) => void;
    onWrapperHover?: (columnIndex: number, isHovering: boolean) => void;
    onButtonHover?: (columnIndex: number, isHovering: boolean) => void;
    onAddTotalsRow?: (columnIndex: number, type: string) => void;
}

export interface IAddTotalState {
    dropdownOpened: boolean;
}

export class AddTotal extends React.Component<IAddTotalProps, IAddTotalState> {
    public static defaultProps: Partial<IAddTotalProps> = {
        onDropdownOpenStateChanged: noop,
        onWrapperHover: noop,
        onButtonHover: noop,
        onAddTotalsRow: noop,
    };

    constructor(props: IAddTotalProps) {
        super(props);

        this.state = {
            dropdownOpened: false,
        };
    }

    public componentWillUnmount() {
        if (this.state.dropdownOpened) {
            this.onOpenStateChanged(this.props.columnIndex, false);
        }
    }

    public render() {
        const {
            dataSource,
            header,
            columnIndex,
            headersCount,
            onAddTotalsRow,
            onWrapperHover,
            onButtonHover,
            addingMoreTotalsEnabled,
        } = this.props;

        const isFirstColumn = columnIndex === 0;
        const isLastColumn = columnIndex === headersCount - 1;

        const showAddTotalButton = shouldShowAddTotalButton(header, isFirstColumn, addingMoreTotalsEnabled);
        const dropdownAlignPoint = getAddTotalDropdownAlignPoints(isLastColumn);

        const wrapperClassNames = classNames("indigo-totals-add-wrapper", {
            "dropdown-active": this.state.dropdownOpened,
        });
        const bodyClassName = classNames("indigo-totals-select-type-list");

        const wrapperEvents = {
            onMouseEnter: () => {
                onWrapperHover(columnIndex, true);
            },
            onMouseLeave: () => {
                onWrapperHover(columnIndex, false);
            },
        };

        const addButtonProps: IAddTotalButtonProps = {
            hidden: !showAddTotalButton,
            onClick: () => {
                this.onOpenStateChanged(columnIndex, true);
            },
            onMouseEnter: () => {
                onButtonHover(columnIndex, true);
            },
            onMouseLeave: () => {
                onButtonHover(columnIndex, false);
            },
        };

        const onOpenStateChanged = (opened: boolean) => this.onOpenStateChanged(columnIndex, opened);
        const onRowItemSelect = (item: IIndexedTotalItem) => onAddTotalsRow(columnIndex, item.type);

        return (
            <div className={wrapperClassNames} {...wrapperEvents}>
                <Dropdown
                    onOpenStateChanged={onOpenStateChanged}
                    alignPoints={dropdownAlignPoint}
                    button={<AddTotalButton {...addButtonProps} />}
                    body={
                        <DropdownBody
                            List={List}
                            dataSource={dataSource}
                            width={TOTALS_TYPES_DROPDOWN_WIDTH}
                            className={bodyClassName}
                            rowItem={<DropdownItem onSelect={onRowItemSelect} />}
                        />
                    }
                />
            </div>
        );
    }

    public onOpenStateChanged(columnIndex: number, isOpened: boolean) {
        this.setState({
            dropdownOpened: isOpened,
        });

        this.props.onDropdownOpenStateChanged(columnIndex, isOpened);
    }
}
