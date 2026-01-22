// (C) 2007-2025 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import ReactContentLoader from "react-content-loader";

import { type IRenderListItemProps, List } from "./List.js";
import { LoadingMask } from "../LoadingMask/LoadingMask.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const ContentLoader = defaultImport(ReactContentLoader);

/**
 * @internal
 */
export interface IAsyncListProps<T> {
    className?: string;

    width?: number;
    height?: number;

    items: T[];
    itemHeight?: number;
    renderItem: (props: IRenderListItemProps<T>) => ReactElement;
    renderLoadingItem?: (props: IRenderListItemProps<T>) => ReactElement;

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
        renderLoadingItem,

        isLoading,

        nextPageItemPlaceholdersCount = 0,
        isLoadingNextPage,
        onLoadNextPage,
    } = props;

    const itemRenderer = useCallback(
        (renderItemProps: IRenderListItemProps<T>): ReactElement => {
            if (renderItemProps.rowIndex + 1 > items.length) {
                return renderLoadingItem?.(renderItemProps) ?? <LoadingPlaceholder />;
            }

            return renderItem(renderItemProps);
        },
        [items, renderItem, renderLoadingItem],
    );

    const handleScrollEnd = useCallback(
        (_: unknown, endRowIndex: number) => {
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
            className={cx("gd-async-list", className || "")}
            width={width}
            height={height}
            items={items}
            itemHeight={itemHeight}
            itemsCount={items.length + nextPageItemPlaceholdersCount}
            renderItem={itemRenderer}
            onScrollEnd={handleScrollEnd}
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
