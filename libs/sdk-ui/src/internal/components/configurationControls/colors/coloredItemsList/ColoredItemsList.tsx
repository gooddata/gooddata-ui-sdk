// (C) 2019 GoodData Corporation
import * as React from "react";
import * as CustomEvent from "custom-event";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { DropdownBody } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { IColor, IColorPalette } from "@gooddata/sdk-model";

import ColoredItem from "./ColoredItem";
import { getSearchedItems } from "../../../../utils/colors";
import { IColoredItem } from "../../../../interfaces/Colors";

const VISIBLE_ITEMS_COUNT = 5;
const SEARCHFIELD_VISIBILITY_THRESHOLD = 7;
const DROPDOWN_BODY_WIDTH = 218;

export interface IColoredItemsListOwnProps {
    colorPalette: IColorPalette;
    inputItems: IColoredItem[];
    onSelect: (selectedColorItem: IColoredItem, color: IColor) => void;
    showCustomPicker?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}

export interface IColoredItemsListState {
    searchString?: string;
}

export type IColoredItemsListProps = IColoredItemsListOwnProps & WrappedComponentProps;

class ColoredItemsList extends React.PureComponent<IColoredItemsListProps, IColoredItemsListState> {
    public static defaultProps: Partial<IColoredItemsListProps> = {
        disabled: false,
        isLoading: false,
    };

    private listRef: any;

    constructor(props: IColoredItemsListProps) {
        super(props);

        this.state = {
            searchString: "",
        };

        this.listRef = (React as any).createRef();
    }

    public render() {
        const searchString = this.isSearchFieldVisible() ? this.state.searchString : "";
        const items: IColoredItem[] = getSearchedItems(this.props.inputItems, searchString);

        return (
            <div ref={this.listRef}>
                <DropdownBody
                    width={DROPDOWN_BODY_WIDTH}
                    isSearchFieldVisible={this.isSearchFieldVisible()}
                    searchString={searchString}
                    onSearch={this.onSearch}
                    onScrollStart={this.onScroll}
                    items={items}
                    rowItem={
                        <ColoredItem
                            colorPalette={this.props.colorPalette}
                            onSelect={this.onSelect}
                            showCustomPicker={this.props.showCustomPicker}
                            disabled={this.props.disabled}
                        />
                    }
                    className="gd-colored-items-list"
                    maxVisibleItemsCount={VISIBLE_ITEMS_COUNT}
                    disabled={this.props.disabled}
                    isLoading={this.props.isLoading}
                />
            </div>
        );
    }

    private onScroll = () => {
        if (this.listRef && this.listRef.current) {
            const node = this.listRef.current;
            node.dispatchEvent(new CustomEvent("goodstrap.scrolled", { bubbles: true }));
        }
    };

    private closeOpenDropdownOnSearch() {
        // we have to close all dropdown ONE-3526
        // (IE has bug onClick on ClearIcon in Input doesn't fire click event and dropdown will not close)
        // so we can close it by onScroll event
        this.onScroll();
    }

    private onSearch = (searchString: string) => {
        this.setState({ searchString });
        this.closeOpenDropdownOnSearch();
    };

    private isSearchFieldVisible = () => {
        return this.props.inputItems.length > SEARCHFIELD_VISIBILITY_THRESHOLD && !this.props.isLoading;
    };

    private onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        this.props.onSelect(selectedColorItem, color);
    };
}

export default injectIntl(ColoredItemsList);
