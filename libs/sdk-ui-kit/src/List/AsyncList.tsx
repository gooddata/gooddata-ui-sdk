// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import ContentLoader from "react-content-loader";

import { useMediaQuery } from "../responsive/useMediaQuery";
import { LoadingMask } from "../LoadingMask";
import { IRenderListItemProps, List } from "./List";

/**
 * @internal
 */
export interface IAsyncListProps<T> {
    className?: string;

    width?: number;
    height?: number;

    items: T[];
    itemHeight?: number;
    renderItem: (props: IRenderListItemProps<T>) => JSX.Element;

    /**
     * Set to true to render the loading indicator instead of the list.
     * Usually, you want to use this property during initialization / loading first page of the items.
     */
    isLoading?: boolean;

    /**
     * Number of loading item placeholders to render at the end of the list.
     * When the user scrolls to the placeholders, the onLoadNextPage() callback will be called.
     * You should set this value to 0 when all items are loaded and there is no other page to load.
     */
    nextPageItemPlaceholdersCount?: number;

    /**
     * When true, onLoadNextPage callback will be disabled.
     */
    isLoadingNextPage?: boolean;

    /**
     * Callback that is called when the user scrolls to the loading item placeholders.
     * It won't be called, if isLoadingNextPage is set to true.
     */
    onLoadNextPage?: () => void;
}

/**
 * @internal
 */
export function AsyncList<T>(props: IAsyncListProps<T>) {
    const {
        className,

        width,
        height,

        items,
        itemHeight,
        renderItem,

        isLoading,

        nextPageItemPlaceholdersCount = 0,
        isLoadingNextPage,
        onLoadNextPage,
    } = props;

    const isMobile = useMediaQuery("mobileDevice");

    const itemRenderer = useCallback(
        (renderItemProps: IRenderListItemProps<T>): JSX.Element => {
            if (renderItemProps.rowIndex + 1 > items.length) {
                return <LoadingPlaceholder />;
            }

            return renderItem(renderItemProps);
        },
        [items, renderItem],
    );

    const handleScrollEnd = useCallback(
        (_, endRowIndex) => {
            if (endRowIndex > items.length && !isLoadingNextPage) {
                onLoadNextPage?.();
            }
        },
        [items, isLoadingNextPage, onLoadNextPage],
    );

    return isLoading ? (
        <LoadingMask height={props.height} />
    ) : (
        <List
            className={cx("gd-async-list", className ? className : "")}
            width={width}
            height={height}
            items={items}
            itemHeight={itemHeight}
            itemsCount={items.length + nextPageItemPlaceholdersCount}
            renderItem={itemRenderer}
            onScrollEnd={handleScrollEnd}
            compensateBorder={!isMobile}
        />
    );
}

function LoadingPlaceholder() {
    return (
        <div className="gd-list-item gd-list-item-not-loaded">
            <ContentLoader viewBox="0 0 250 28">
                {/* Only SVG shapes */}
                <rect x="0" y="7" rx="3" ry="3" width="13" height="13" />
                <rect x="22" y="7" rx="3" ry="3" width="250" height="13" />
            </ContentLoader>
        </div>
    );
}
