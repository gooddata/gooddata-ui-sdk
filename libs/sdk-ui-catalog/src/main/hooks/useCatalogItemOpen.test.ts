// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ICatalogItemParameter, ICatalogItemRef } from "../../catalogItem/types.js";
import { useCatalogItemOpen } from "./useCatalogItemOpen.js";

const parameterRefA: ICatalogItemRef = {
    identifier: "param.a",
    type: "parameter",
};

const parameterRefB: ICatalogItemRef = {
    identifier: "param.b",
    type: "parameter",
};

const parameterItemB: ICatalogItemParameter = {
    identifier: parameterRefB.identifier,
    type: "parameter",
    title: "Param B",
    description: "Description B",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 20 },
};

const noOpenCatalogItemRef: { openCatalogItemRef?: ICatalogItemRef } = {};

type HookProps = { openCatalogItemRef?: ICatalogItemRef };

function renderUseCatalogItemOpen(initialProps: HookProps = {}) {
    return renderHook(
        ({ openCatalogItemRef }: HookProps) =>
            useCatalogItemOpen(undefined, undefined, undefined, openCatalogItemRef),
        { initialProps },
    );
}

describe("useCatalogItemOpen", () => {
    it("does not reopen the previous externally requested item after closing a locally replaced detail", () => {
        const { result, rerender } = renderUseCatalogItemOpen({ openCatalogItemRef: parameterRefA });

        expect(result.current.open).toBe(true);
        expect(result.current.openedItem).toEqual(parameterRefA);

        act(() => {
            result.current.setItemOpened(parameterItemB);
        });

        expect(result.current.openedItem).toEqual(parameterItemB);

        act(() => {
            result.current.onCloseDetail();
        });

        rerender({ openCatalogItemRef: parameterRefA });

        expect(result.current.open).toBe(false);
        expect(result.current.openedItem).toEqual(parameterItemB);
    });

    it("opens the detail again when the external ref actually changes", () => {
        const { result, rerender } = renderUseCatalogItemOpen(noOpenCatalogItemRef);

        expect(result.current.open).toBe(false);
        expect(result.current.openedItem).toBeNull();

        rerender({ openCatalogItemRef: parameterRefA });

        expect(result.current.open).toBe(true);
        expect(result.current.openedItem).toEqual(parameterRefA);

        act(() => {
            result.current.onCloseDetail();
        });

        expect(result.current.open).toBe(false);

        rerender({ openCatalogItemRef: parameterRefB });

        expect(result.current.open).toBe(true);
        expect(result.current.openedItem).toEqual(parameterRefB);
    });

    it("reopens the same external ref after the prop is cleared", () => {
        const { result, rerender } = renderUseCatalogItemOpen({ openCatalogItemRef: parameterRefA });

        expect(result.current.open).toBe(true);
        expect(result.current.openedItem).toEqual(parameterRefA);

        act(() => {
            result.current.onCloseDetail();
        });

        expect(result.current.open).toBe(false);

        rerender(noOpenCatalogItemRef);
        rerender({ openCatalogItemRef: parameterRefA });

        expect(result.current.open).toBe(true);
        expect(result.current.openedItem).toEqual(parameterRefA);
    });

    it("does not replace a loaded item with a bare ref when the URL ref appears after opening from the list", () => {
        const { result, rerender } = renderUseCatalogItemOpen(noOpenCatalogItemRef);

        act(() => {
            result.current.onOpenDetail(parameterItemB);
        });

        expect(result.current.openedItem).toEqual(parameterItemB);

        rerender({ openCatalogItemRef: parameterRefB });

        expect(result.current.openedItem).toEqual(parameterItemB);
        expect(result.current.open).toBe(true);
    });
});
