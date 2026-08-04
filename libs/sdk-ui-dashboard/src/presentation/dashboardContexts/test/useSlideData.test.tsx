// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ILayoutItemPath } from "../../../types.js";
import { DEFAULT_SLIDE_HEIGHT, DEFAULT_SLIDE_WIDTH, useSlideSizeStyle } from "../useSlideData.js";

const ROOT_PATH: ILayoutItemPath | undefined = undefined;
const NESTED_PATH: ILayoutItemPath = [{ sectionIndex: 0, itemIndex: 0 }];

describe("useSlideSizeStyle", () => {
    it("should return no styles outside of the export render mode", () => {
        const { result } = renderHook(() => useSlideSizeStyle("view", "section", NESTED_PATH, true));
        expect(result.current).toEqual({});
    });

    it("should size the root layout to the slide width", () => {
        const { result } = renderHook(() => useSlideSizeStyle("export", "root"));
        expect(result.current).toEqual({ width: `${DEFAULT_SLIDE_WIDTH}px` });
    });

    it("should stretch items to the full height of their row", () => {
        const { result } = renderHook(() => useSlideSizeStyle("export", "leaf-item", NESTED_PATH));
        expect(result.current).toEqual({ height: "100%" });
    });

    describe("sections", () => {
        it("should size a top level section to the slide height and split it between the item rows", () => {
            const { result } = renderHook(() => useSlideSizeStyle("export", "section", ROOT_PATH));
            expect(result.current).toEqual({
                gridAutoRows: "minmax(0, 1fr)",
                height: `${DEFAULT_SLIDE_HEIGHT}px`,
                overflow: "hidden",
            });
        });

        // sections whose rows are sized from content collapse to the widget titles, as the
        // visualizations are absolutely positioned and have no intrinsic height in export mode
        it("should give a section nested in a container definite row tracks", () => {
            const { result } = renderHook(() => useSlideSizeStyle("export", "section", NESTED_PATH));
            expect(result.current).toEqual({
                gridAutoRows: "minmax(0, 1fr)",
                height: "100%",
            });
        });

        it.each([
            ["top level", ROOT_PATH],
            ["nested", NESTED_PATH],
        ])(
            "should let the header row of a %s section take only the space it needs",
            (_name, parentLayoutPath) => {
                const { result } = renderHook(() =>
                    useSlideSizeStyle("export", "section", parentLayoutPath, true),
                );
                expect(result.current).toMatchObject({
                    gridTemplateRows: "max-content",
                    gridAutoRows: "minmax(0, 1fr)",
                });
            },
        );

        it("should not reserve a header row when the section has no header", () => {
            const { result } = renderHook(() => useSlideSizeStyle("export", "section", ROOT_PATH, false));
            expect(result.current).not.toHaveProperty("gridTemplateRows");
        });
    });
});
