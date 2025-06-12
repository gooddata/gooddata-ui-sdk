// (C) 2022 GoodData Corporation
import { useEffect, useState, useCallback } from "react";

/**
 * Properties of the {@link useAttributeFilterSearch} hook.
 *
 * @beta
 */
export interface IUseAttributeFilterSearchProps {
    /**
     * Current search string.
     */
    searchString: string;
    /**
     * Callback to change the current search string.
     */
    onSearch: (search: string) => void;
}

/**
 * Use this hook if you want to implement your custom attribute filter search bar component.
 *
 * @beta
 */
export const useAttributeFilterSearch = (props: IUseAttributeFilterSearchProps) => {
    const { onSearch, searchString } = props;
    const [search, setSearch] = useState(searchString);

    useEffect(() => {
        setSearch(searchString);
    }, [searchString]);

    const onSearchCallback = useCallback(
        (search: string) => {
            setSearch(search);
            onSearch(search);
        },
        [onSearch],
    );

    return {
        onSearch: onSearchCallback,
        search,
    };
};
