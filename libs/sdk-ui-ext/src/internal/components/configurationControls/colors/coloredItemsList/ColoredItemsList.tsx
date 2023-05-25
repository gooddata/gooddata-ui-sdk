// (C) 2019-2023 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { DropdownList } from "@gooddata/sdk-ui-kit";
import { IColor, IColorPalette } from "@gooddata/sdk-model";

import ColoredItem from "./ColoredItem.js";
import { getSearchedItems } from "../../../../utils/colors.js";
import { IColoredItem } from "../../../../interfaces/Colors.js";

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
    public static defaultProps: Pick<IColoredItemsListProps, "disabled" | "isLoading"> = {
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
                <DropdownList
                    width={DROPDOWN_BODY_WIDTH}
                    showSearch={this.isSearchFieldVisible()}
                    searchString={searchString}
                    onSearch={this.onSearch}
                    onScrollStart={this.onScroll}
                    items={items}
                    className="gd-colored-items-list"
                    maxVisibleItemsCount={VISIBLE_ITEMS_COUNT}
                    isLoading={this.props.isLoading}
                    renderItem={({ item }) => (
                        <ColoredItem
                            colorPalette={this.props.colorPalette}
                            onSelect={this.onSelect}
                            showCustomPicker={this.props.showCustomPicker}
                            disabled={this.props.disabled}
                            item={item}
                        />
                    )}
                />
            </div>
        );
    }

    private onScroll = () => {
        if (this.listRef?.current) {
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
