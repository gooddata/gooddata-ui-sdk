// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import { type IElement } from "../typings/measure_filters.js";

import {
    type IDecoratedAttributeElement,
    decoratedAttributeElement,
} from "./decorated_attribute_elements.js";

describe("Attribute Element", () => {
    describe("decorated element", () => {
        let element: IElement;
        let decorated: IDecoratedAttributeElement;

        beforeEach(() => {
            element = { uri: "/abc/?id=123", title: "my title" };
            decorated = decoratedAttributeElement(element);
        });

        it("should have correct id", () => {
            expect(decorated.id).toEqual(123);
        });

        it("should set title", () => {
            expect(decorated.title).toEqual("my title");
        });

        it("should be available by default", () => {
            expect(decorated.available).toEqual(true);
        });

        it("should not be available when available is false", () => {
            element = { uri: "/abc/?id=123", available: false } as IElement;
            decorated = decoratedAttributeElement(element);

            expect(decorated.available).toEqual(false);
        });
    });
});
