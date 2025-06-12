// (C) 2022 GoodData Corporation

import { renderHook } from "@testing-library/react";
import {
    IUseInvertableSelectProps,
    SelectionStatusType,
    useInvertableSelect,
} from "../useInvertableSelect.js";
import { describe, it, expect } from "vitest";

const defaultProps: IUseInvertableSelectProps<number> = {
    items: [],
    totalItemsCount: 0,
    getItemKey: (item: number) => item.toString(),
    searchString: "",
    isInverted: true,
    selectedItems: [],
};

const render = (props: Partial<IUseInvertableSelectProps<number>>) => {
    const { result } = renderHook(() => useInvertableSelect<number>({ ...defaultProps, ...props }));
    return result;
};

describe("useInvertableSelect", () => {
    describe("selectionState", () => {
        const Scenarios: Array<
            [
                result: SelectionStatusType,
                desc: string,
                items: number[],
                selectedItems: number[],
                isInverted: boolean,
                totalItemsCount: number,
                searchString: string,
            ]
        > = [
            //empty search string
            [
                "all",
                "is inverted and selection is empty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [],
                true,
                5,
                "",
            ],
            [
                "all",
                "is inverted and selection is empty and empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [],
                true,
                10,
                "",
            ],
            [
                "all",
                "is not Inverted and selection is equal to items and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                false,
                5,
                "",
            ],

            [
                "none",
                "not inverted and selection is empty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [],
                false,
                5,
                "",
            ],
            [
                "none",
                "not inverted and selection is empty and empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [],
                false,
                10,
                "",
            ],
            [
                "none",
                "isInverted and not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                true,
                5,
                "",
            ],

            [
                "partial",
                "isInverted not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1],
                true,
                5,
                "",
            ],
            [
                "partial",
                "isInverted not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [9],
                true,
                10,
                "",
            ],
            [
                "partial",
                "not isInverted not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1],
                false,
                5,
                "",
            ],
            [
                "partial",
                "not isInverted not isSelectionEmpty and empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [1],
                false,
                10,
                "",
            ],
            //non empty search string
            [
                "all",
                "is inverted and selection is empty and not empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [],
                true,
                5,
                "abc",
            ],
            [
                "all",
                "is inverted and selection is empty and not empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [],
                true,
                10,
                "abc",
            ],
            [
                "all",
                "is inverted and selection is not empty and not empty search and all items not loaded",
                [6, 7, 8, 9, 10],
                [1, 2, 3, 4, 5],
                true,
                5,
                "abc",
            ],
            [
                "all",
                "is inverted and selection is not empty and not empty search and all items loaded",
                [6, 7, 8, 9, 10],
                [5],
                true,
                10,
                "abc",
            ],
            [
                "none",
                "is inverted and selection is equal to items and not empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                true,
                5,
                "abc",
            ],

            [
                "none",
                "is inverted and selection is equal to items and not empty search and all items loaded",
                [6, 7, 8, 9, 10],
                [5, 6, 7, 8, 9, 10],
                true,
                5,
                "abc",
            ],
            [
                "all",
                "isInverted and not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                false,
                5,
                "abc",
            ],
            [
                "partial",
                "isInverted and not isSelectionEmpty and empty search and all items not loaded",
                [6, 7, 8, 9, 10],
                [1, 6, 7, 8, 9, 10],
                false,
                10,
                "abc",
            ],
            [
                "all",
                "is not Inverted and selection is equal to items and not empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                false,
                5,
                "abc",
            ],
            [
                "none",
                "is not inverted and selection is empty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [],
                false,
                5,
                "abc",
            ],
            [
                "none",
                "not inverted and selection is empty and empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [],
                false,
                10,
                "abc",
            ],
            [
                "none",
                "isInverted and not isSelectionEmpty and empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5],
                true,
                5,
                "abc",
            ],
            [
                "none",
                "isInverted and not isSelectionEmpty and non empty search and all items loaded",
                [6, 7, 8, 9, 10],
                [1, 6, 7, 8, 9, 10],
                true,
                5,
                "abc",
            ],
            [
                "partial",
                "isInverted and not isSelectionEmpty and non empty search and all items not loaded",
                [6, 7, 8, 9, 10],
                [6, 7, 8, 9, 10],
                true,
                10,
                "abc",
            ],
            [
                "partial",
                "isInverted and not isSelectionEmpty and empty search and all items loaded",
                [6, 7, 8, 9, 10],
                [6, 7, 8, 9, 10],
                true,
                15,
                "abc",
            ],

            [
                "partial",
                "isInverted not isSelectionEmpty and non search and all items loaded",
                [1, 2, 3, 4, 5],
                [1],
                true,
                5,
                "abc",
            ],
            [
                "partial",
                "isInverted not isSelectionEmpty and non search and all items not loaded",
                [1, 2, 3, 4, 5],
                [4],
                true,
                10,
                "abc",
            ],
            [
                "partial",
                "not isInverted not isSelectionEmpty and non empty search and all items loaded",
                [1, 2, 3, 4, 5],
                [1],
                false,
                5,
                "abc",
            ],
            [
                "partial",
                "not isInverted not isSelectionEmpty and non empty search and all items not loaded",
                [1, 2, 3, 4, 5],
                [1],
                false,
                10,
                "abc",
            ],
            [
                "partial",
                "isInverted and not isSelectionEmpty and empty search and all items not loaded",
                [6, 7, 8, 9, 10],
                [1, 6, 7, 8, 9, 10],
                false,
                10,
                "abc",
            ],
        ];

        it.each(Scenarios)(
            "should return %s when %s",
            (result, _desc, items, selectedItems, isInverted, totalItemsCount, searchString) => {
                const props: Partial<IUseInvertableSelectProps<number>> = {
                    items,
                    selectedItems,
                    totalItemsCount,
                    searchString,
                    isInverted,
                };

                const hook = render(props);
                expect(hook.current.selectionState).toEqual(result);
            },
        );
    });
});
