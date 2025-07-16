// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { ITheme } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ListItem, ListItemProps } from "./types.js";
import classnames from "classnames";

export type SearchListItemProps<T, R> = ListItemProps<T, R> & {
    className?: string;
    getAreaLabel?: (item: ListItem<T, R> | ListItem<R, undefined>) => string;
    renderIcon: (item: ListItem<T, R> | ListItem<R, undefined>, theme?: ITheme) => React.ReactElement;
    renderDetails?: (
        item: ListItem<T, R> | ListItem<R, undefined>,
        theme?: ITheme,
        isActive?: boolean,
        isOpened?: boolean,
    ) => React.ReactElement;
    renderItem: (item: ListItem<T, R>) => React.ReactElement;
    renderSubItem?: (item: ListItem<R, undefined>) => React.ReactElement;
};

/**
 * A single result item in the search results.
 * @internal
 */
export const SearchListItem = <T, R>({
    listItem,
    isActive,
    isOpened,
    onSelect,
    onHover,
    setOpened,
    renderIcon,
    renderDetails,
    getAreaLabel,
    className,
    renderItem,
    renderSubItem,
}: SearchListItemProps<T, R>) => {
    const theme = useTheme();
    const [activeSubItem, setActiveSubItem] = React.useState<ListItem<R, undefined>>();

    const onClick = (item: ListItem<T, R> | ListItem<R, undefined>, e: React.MouseEvent) => {
        const parents = item.parents?.length ?? 0;
        // Only report left and middle clicks
        if (e.button < 2 && parents === 0) {
            onSelect(item, e);
        }
        if (e.button < 2 && parents > 0) {
            setOpened?.(listItem.data, !isOpened);
            e.stopPropagation();
            e.preventDefault();
        }
    };
    const Tag = listItem.data.url ? "a" : "span";
    const wrapperClassName = classnames(className, {
        "gd-semantic-search__results-item": true,
        "gd-semantic-search__results-item--active": isActive,
    });

    const areaLabel = getAreaLabel?.(listItem.data);

    return (
        <span
            className={wrapperClassName}
            onMouseEnter={() => onHover(listItem.data, true)}
            onMouseLeave={() => onHover(listItem.data, false)}
        >
            <div className="gd-semantic-search__results-item__main">
                <Tag
                    aria-label={areaLabel}
                    href={listItem.data.url}
                    tabIndex={-1}
                    className="gd-semantic-search__results-item__content"
                    onClick={(e) => {
                        onClick(listItem.data, e);
                    }}
                    onAuxClick={(e) => {
                        onClick(listItem.data, e);
                    }}
                >
                    <span className="gd-semantic-search__results-item__icon">
                        {renderIcon(listItem.data, theme)}
                    </span>
                    <span className="gd-semantic-search__results-item__text">
                        {renderItem(listItem.data)}
                    </span>
                    {renderDetails ? renderDetails(listItem.data, theme, isActive, isOpened) : null}
                </Tag>
            </div>
            {isOpened && listItem.data.parents ? (
                <>
                    {listItem.data.parents.map((item, i) => {
                        return (
                            <SearchListSubItem
                                key={i}
                                subItem={item}
                                isActive={item === activeSubItem}
                                onHover={setActiveSubItem}
                                onSelect={(e) => {
                                    onClick(item, e);
                                }}
                                renderIcon={renderIcon}
                                getAreaLabel={getAreaLabel}
                            >
                                <span className="gd-semantic-search__results-subitem__text__ellipsis">
                                    {renderSubItem?.(item)}
                                </span>
                            </SearchListSubItem>
                        );
                    })}
                </>
            ) : null}
        </span>
    );
};

type SearchListSubItemProps<R> = React.PropsWithChildren<{
    className?: string;
    isActive: boolean;
    subItem: ListItem<R, undefined>;
    onHover: (item: ListItem<R, undefined>, state: boolean) => void;
    onSelect: (e: React.MouseEvent) => void;
    renderIcon: (item: ListItem<R, undefined>, theme?: ITheme) => React.ReactElement;
    getAreaLabel?: (item: ListItem<R, undefined>) => string;
}>;

const SearchListSubItem = <R,>({
    subItem,
    isActive,
    onSelect,
    onHover,
    renderIcon,
    getAreaLabel,
    className,
    children,
}: SearchListSubItemProps<R>) => {
    const theme = useTheme();
    const onClick = (e: React.MouseEvent) => {
        // Only report left and middle clicks
        if (e.button < 2) {
            onSelect(e);
        }
    };
    const Tag = subItem.url ? "a" : "span";
    const wrapperClassName = classnames(className, {
        "gd-semantic-search__results-subitem": true,
        "gd-semantic-search__results-subitem--active": isActive,
    });

    const areaLabel = getAreaLabel?.(subItem);

    return (
        <span
            className={wrapperClassName}
            onMouseEnter={() => onHover(subItem, true)}
            onMouseLeave={() => onHover(subItem, false)}
        >
            <div className="gd-semantic-search__results-subitem__main">
                <Tag
                    aria-label={areaLabel}
                    href={subItem.url}
                    tabIndex={0}
                    className="gd-semantic-search__results-subitem__content"
                    onClick={onClick}
                    onAuxClick={onClick}
                >
                    <span className="gd-semantic-search__results-subitem__icon">
                        {renderIcon(subItem, theme)}
                    </span>
                    <span className="gd-semantic-search__results-subitem__text">{children}</span>
                </Tag>
            </div>
        </span>
    );
};
