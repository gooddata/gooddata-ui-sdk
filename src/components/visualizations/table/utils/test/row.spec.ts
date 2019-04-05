// (C) 2007-2018 GoodData Corporation
import { IPositions } from "../../../../../interfaces/Table";
import { getHiddenRowsOffset, updatePosition } from "../row";

describe("Table utils - Row", () => {
    describe("updatePosition", () => {
        const positions: IPositions = {
            defaultTop: 1,
            edgeTop: 2,
            fixedTop: 3,
            absoluteTop: 4,
        };

        let element: HTMLElement;

        beforeEach(() => {
            element = document.createElement("div");
        });

        it("should set default position and proper class to given element", () => {
            const isDefaultPosition: boolean = true;
            const isEdgePosition: boolean = false;
            const isScrollingStopped: boolean = false;

            updatePosition(element, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);

            expect(element.classList.contains("sticking")).toEqual(false);
            expect(element.style.position).toEqual("absolute");
            expect(element.style.top).toEqual(`${positions.defaultTop}px`);
        });

        it("should set edge position and proper class to given element", () => {
            const isDefaultPosition: boolean = false;
            const isEdgePosition: boolean = true;
            const isScrollingStopped: boolean = false;

            updatePosition(element, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);

            expect(element.classList.contains("sticking")).toEqual(true);
            expect(element.style.position).toEqual("absolute");
            expect(element.style.top).toEqual(`${positions.edgeTop}px`);
        });

        it("should set fixed position and proper class to given element", () => {
            const isDefaultPosition: boolean = false;
            const isEdgePosition: boolean = false;
            const isScrollingStopped: boolean = false;

            updatePosition(element, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);

            expect(element.classList.contains("sticking")).toEqual(true);
            expect(element.style.position).toEqual("fixed");
            expect(element.style.top).toEqual(`${positions.fixedTop}px`);
        });

        it("should set absolute position and proper class to given element", () => {
            const isDefaultPosition: boolean = false;
            const isEdgePosition: boolean = false;
            const isScrollingStopped: boolean = true;

            updatePosition(element, positions, isDefaultPosition, isEdgePosition, isScrollingStopped);

            expect(element.classList.contains("sticking")).toEqual(true);
            expect(element.style.position).toEqual("absolute");
            expect(element.style.top).toEqual(`${positions.absoluteTop}px`);
        });
    });

    describe("getHiddenRowsOffset", () => {
        it("should return proper hidden rows offset", () => {
            const hasHiddenRows: boolean = true;
            expect(getHiddenRowsOffset(hasHiddenRows)).toEqual(15);
        });

        it("should return zero hidden rows offset when table has no hidden rows", () => {
            const hasHiddenRows: boolean = false;
            expect(getHiddenRowsOffset(hasHiddenRows)).toEqual(0);
        });
    });
});
