// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ICatalogAttribute,
    type IDrillDownReference,
    type ObjRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { type Matcher, suppressConsole } from "@gooddata/util";

import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors.js";
import { selectIgnoredDrillDownHierarchiesByWidgetRef } from "../tabs/layout/layoutSelectors.js";

import {
    selectDrillableItemsByAvailableDrillTargets,
    selectGlobalDrillsDownAttributeHierarchyByWidgetRef,
    selectRestrictedDrillDownsByWidgetRef,
} from "./widgetDrillSelectors.js";
import {
    availableDrillTargets,
    catalogAttributeHierarchies,
    ignoredHierarchies,
    widgetRef,
    widgetRefWithoutAvailableDrillTargets,
} from "./widgetDrillSelectors.test.helpers.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../drillTargets/drillTargetsSelectors.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        selectDrillTargetsByWidgetRef: vi.fn(),
    };
});

vi.mock("../tabs/layout/layoutSelectors.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        selectIgnoredDrillDownHierarchiesByWidgetRef: vi.fn(),
    };
});

let isDisableDrillDown = false;
vi.mock("../insights/insightsSelectors.js", () => ({
    selectInsightByWidgetRef: () => () => ({
        insight: {
            properties: {
                controls: {
                    disableDrillDown: isDisableDrillDown,
                },
            },
        },
    }),
}));

describe("widgetDrillSelectors", () => {
    describe("selectGlobalDrillsDownAttributeHierarchyByWidgetRef", () => {
        const createInitialState = (
            params: {
                supportsAttributeHierarchies?: boolean;
            } = {},
        ): any => {
            return {
                catalog: {
                    attributeHierarchies: catalogAttributeHierarchies,
                },
                config: { config: {} },
                backendCapabilities: {
                    backendCapabilities: {
                        supportsAttributeHierarchies: params?.supportsAttributeHierarchies ?? false,
                    },
                },
            };
        };

        beforeEach(() => {
            vi.mocked(selectDrillTargetsByWidgetRef).mockImplementation((widget: ObjRef) => {
                if (objRefToString(widget) === objRefToString(widgetRef)) {
                    return () => availableDrillTargets;
                }

                return () => undefined;
            });

            vi.mocked(selectIgnoredDrillDownHierarchiesByWidgetRef).mockImplementation((widget: ObjRef) => {
                if (objRefToString(widget) === objRefToString(widgetRef)) {
                    return () => ignoredHierarchies;
                }

                return () => [];
            });
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        const commonWarnOutput: Matcher[] = [
            {
                type: "startsWith",
                value: "An input selector returned a different result when passed same arguments",
            },
        ];

        it("should return empty array if supportsAttributeHierarchies is off", async () => {
            const initialState = createInitialState({
                supportsAttributeHierarchies: false,
            });
            const result = await suppressConsole(
                () => selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState),
                "warn",
                commonWarnOutput,
            );
            expect(result).toEqual([]);
        });

        it("should return expected result if all conditions are met", () => {
            const initialState = createInitialState({
                supportsAttributeHierarchies: true,
            });

            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState),
            ).toMatchSnapshot();
        });

        it("should return empty array if no drill targets are available", async () => {
            const initialState = createInitialState({
                supportsAttributeHierarchies: true,
            });
            const result = await suppressConsole(
                () =>
                    selectGlobalDrillsDownAttributeHierarchyByWidgetRef(
                        widgetRefWithoutAvailableDrillTargets,
                    )(initialState),
                "warn",
                commonWarnOutput,
            );
            expect(result).toEqual([]);
        });

        it("should return empty array if the disableDrillDown is true", () => {
            isDisableDrillDown = true;
            const initialState = createInitialState({
                supportsAttributeHierarchies: true,
            });
            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRefWithoutAvailableDrillTargets)(
                    initialState,
                ),
            ).toEqual([]);
        });
    });

    describe("selectRestrictedDrillDownsByWidgetRef", () => {
        const hierarchyRefs = catalogAttributeHierarchies.map(
            ({ attributeHierarchy }) => attributeHierarchy.ref,
        );
        // every hierarchy of the fixture is restricted for the user; its levels are readable attributes
        const catalogAttribute = (identifier: string): ICatalogAttribute =>
            ({
                type: "attribute",
                attribute: {
                    type: "attribute",
                    id: identifier,
                    uri: "",
                    ref: idRef(identifier, "attribute"),
                },
                displayForms: [],
                geoPinDisplayForms: [],
                unavailable: hierarchyRefs.map((ref) => ({
                    ref,
                    type: "attributeHierarchy",
                    reason: "forbidden",
                })),
            }) as unknown as ICatalogAttribute;
        const stateWith = (enableDashboardPartialRendering: boolean): any => ({
            catalog: {
                attributes: ["f_owner.region_id", "f_owner.department_id", "attr.f_product.product"].map(
                    catalogAttribute,
                ),
                dateDatasets: [],
            },
            config: { config: { settings: { enableDashboardPartialRendering } } },
            backendCapabilities: { backendCapabilities: { supportsAttributeHierarchies: true } },
        });
        const state = stateWith(true);
        let ignored: IDrillDownReference[] = [];

        beforeEach(() => {
            isDisableDrillDown = false;
            vi.mocked(selectDrillTargetsByWidgetRef).mockImplementation(() => () => availableDrillTargets);
            vi.mocked(selectIgnoredDrillDownHierarchiesByWidgetRef).mockImplementation(() => () => ignored);
        });

        afterEach(() => {
            ignored = [];
            vi.clearAllMocks();
        });

        const drillAttributes = availableDrillTargets.availableDrillTargets?.attributes ?? [];
        const originOf = (attributeId: string) =>
            drillAttributes.find(
                ({ attribute }) => attribute.attributeHeader.formOf.identifier === attributeId,
            )!.attribute.attributeHeader.localIdentifier;
        // the mocked insight selector returns a new object per call, which reselect warns about
        const select = async (selectState = state) =>
            (
                await suppressConsole(
                    () => selectRestrictedDrillDownsByWidgetRef(widgetRef)({ ...selectState }),
                    "warn",
                    [
                        {
                            type: "startsWith",
                            value: "An input selector returned a different result when passed same arguments",
                        },
                    ],
                )
            ).map(({ originLocalIdentifier, hierarchyRef }) => [
                originLocalIdentifier,
                objRefToString(hierarchyRef),
            ]);
        const [hierarchy2, hierarchy1] = hierarchyRefs.map(objRefToString);

        it("lists every restricted hierarchy a drill attribute belongs to", async () => {
            expect(await select()).toEqual(
                expect.arrayContaining([
                    [originOf("f_owner.region_id"), hierarchy2],
                    [originOf("f_owner.region_id"), hierarchy1],
                ]),
            );
        });

        it("respects hierarchies the widget ignores for that attribute", async () => {
            ignored = ignoredHierarchies;
            const drillDowns = await select();
            expect(drillDowns).toContainEqual([originOf("f_owner.department_id"), hierarchy2]);
            expect(drillDowns).not.toContainEqual([originOf("f_owner.department_id"), hierarchy1]);
        });

        it("makes the attributes of restricted drill downs clickable in the drill dialog", () => {
            const dialogState: any = { ...state, catalog: { attributes: [], dateDatasets: [] } };
            const readableOnly = selectDrillableItemsByAvailableDrillTargets(
                availableDrillTargets.availableDrillTargets,
                [],
                true,
            )(dialogState);
            const withRestricted = selectDrillableItemsByAvailableDrillTargets(
                availableDrillTargets.availableDrillTargets,
                [],
                true,
            )({ ...state });
            expect(withRestricted.length).toBeGreaterThan(readableOnly.length);
        });

        it("keeps restricted drill downs unclickable in the drill dialog when drilling down is disabled", () => {
            const dialogState: any = { ...state, catalog: { attributes: [], dateDatasets: [] } };
            const readableOnly = selectDrillableItemsByAvailableDrillTargets(
                availableDrillTargets.availableDrillTargets,
                [],
                true,
            )(dialogState);
            const disabled = selectDrillableItemsByAvailableDrillTargets(
                availableDrillTargets.availableDrillTargets,
                [],
                true,
                true,
            )({ ...state });
            expect(disabled).toHaveLength(readableOnly.length);
        });

        it("lists nothing with partial rendering off", async () => {
            expect(await select(stateWith(false))).toEqual([]);
        });

        it("lists nothing when the visualization disables drilling down", async () => {
            isDisableDrillDown = true;
            expect(await select()).toEqual([]);
        });
    });
});
