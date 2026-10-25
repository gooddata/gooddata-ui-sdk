// (C) 2007-2026 GoodData Corporation

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type CatalogItem, type ICatalogAttributeHierarchy, idRef } from "@gooddata/sdk-model";

import { CatalogUiActions } from "../../../sagas/catalog/catalog_ui_actions.js";
import { getCatalogBubbleItemCacheKey } from "../../../sagas/catalog/catalog_utils.js";
import { type IAppState } from "../../../store/types.js";
import { getCatalogMeasureWithPermissions } from "../../../tests/catalog.test.helpers.js";
import { buildAttributeHierarchyMock } from "../../../tests/catalog_attribute_hierarchy.test.helpers.js";
import { withRouteQuery } from "../../../tests/route.test.helpers.js";
import { withData, withMeta, withRoot } from "../../../tests/state_builder.test.helpers.js";
import {
    type IOrganizedCatalogItem,
    type IOrganizedCatalogTooltipDetails,
} from "../../../typings/catalog.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { CatalogDetailsBubble, type ICatalogDetailsBubbleProps } from "./CatalogDetailsBubble.js";

vi.hoisted(() => {
    vi.resetModules();
});

const dispatchMock = vi.hoisted(() => vi.fn());
const canManageMetadataMock = vi.hoisted(() => vi.fn(() => false));

// the component dispatches through useDispatch; the tests assert on the dispatched actions
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");

    return {
        ...actual,
        useDispatch: () => dispatchMock,
    };
});

// canManageMetadata is a backend capability, not a part of the store state, so it is driven directly
vi.mock("../../../selectors/backend_capabilities_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>(
        "../../../selectors/backend_capabilities_selector.js",
    );

    return {
        ...actual,
        canManageMetadata: canManageMetadataMock,
    };
});

vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");

    return {
        ...actual,
        RichText: vi.fn(({ value }: { value?: string }) => <div className="s-rich-text-mock">{value}</div>),
    };
});

/**
 * Delay the component waits out before requesting details of an attribute item
 * (see DETAILS_LOADING_TIMEOUT_MS in CatalogDetailsBubble).
 */
const DETAILS_LOADING_DELAY = 500;

/**
 * Fakes only the timer the details request is delayed with. requestAnimationFrame is deliberately
 * left alone — the suite installs its own spy on it, and faking it too would fight that spy.
 */
function installFakeClock() {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
}

/**
 * Waits out the attribute details delay on the fake clock and lets React commit whatever settled
 * meanwhile, so the wait is instant instead of half a second of real time.
 */
async function advanceDetailsDelay() {
    await act(() => vi.advanceTimersByTimeAsync(DETAILS_LOADING_DELAY));
}

describe("Catalog Details Bubble", () => {
    const item: ICatalogEntry = {
        type: "fact",
        title: "My Fact",
        summary: "My summary",
        identifier: "foobar",
    };

    // an organized attribute item keys its tooltip details by the display form ref
    // (see getCatalogBubbleItemCacheKey), so it must carry one
    const asAttribute = (identifier = "foobar"): ICatalogEntry => ({
        ...item,
        type: "attribute",
        identifier,
        dfRef: idRef(`${identifier}.df`, "displayForm"),
    });

    let spyGetComputedStyle: ReturnType<typeof vi.spyOn>;
    let spyRequestAnimationFrame: ReturnType<typeof vi.spyOn>;

    const attributeHierarchies: ICatalogAttributeHierarchy[] = [buildAttributeHierarchyMock()];

    interface IStoreValues {
        projectId: string;
        isEmbeddedMode: boolean;
        isEmbeddedModeFromKD: boolean;
        canUserManageMetric: boolean;
        canUserManageProject: boolean;
        canBackendManageMetadata: boolean;
        bubbleDetails: IOrganizedCatalogTooltipDetails | null;
        attributeHierarchies: ICatalogAttributeHierarchy[];
        catalogItems: CatalogItem[];
        enableMetricPermissions: boolean;
    }

    const defaultStoreValues: IStoreValues = {
        projectId: "projectId",
        isEmbeddedMode: false,
        isEmbeddedModeFromKD: false,
        canUserManageMetric: true,
        canUserManageProject: true,
        canBackendManageMetadata: true,
        bubbleDetails: null,
        attributeHierarchies,
        catalogItems: [],
        enableMetricPermissions: false,
    };

    function seedState(renderedItem: ICatalogEntry, values: IStoreValues) {
        return (state: IAppState): IAppState => {
            let seeded = withRoot(state, { projectId: values.projectId });
            seeded = withMeta(seeded, { isEmbedded: values.isEmbeddedMode });
            seeded = withRouteQuery(seeded, {
                isEmbeddedFromKD: values.isEmbeddedModeFromKD ? "true" : "false",
            });
            seeded = withRoot(seeded, {
                workspacePermissions: {
                    ...seeded.workspacePermissions,
                    canManageMetric: values.canUserManageMetric,
                    canManageProject: values.canUserManageProject,
                },
            });
            seeded = withRoot(seeded, {
                featureFlags: {
                    ...seeded.featureFlags,
                    enableMetricPermissions: values.enableMetricPermissions,
                },
            });
            seeded = withData(seeded, {
                catalog: {
                    ...seeded.data.catalog,
                    attributeHierarchies: values.attributeHierarchies,
                    items: values.catalogItems,
                },
            });
            seeded = withData(seeded, {
                catalog: {
                    ...seeded.data.catalog,
                    tooltipDetails: values.bubbleDetails
                        ? {
                              [getCatalogBubbleItemCacheKey(renderedItem as IOrganizedCatalogItem)]:
                                  values.bubbleDetails,
                          }
                        : {},
                },
            });

            return seeded;
        };
    }

    function renderComponent(customProps: Partial<ICatalogDetailsBubbleProps> & Partial<IStoreValues> = {}) {
        const { item: customItem, offsetX = 200, offsetY = 10, ...customStoreValues } = customProps;
        const storeValues: IStoreValues = { ...defaultStoreValues, ...customStoreValues };
        const renderedItem = customItem ?? item;

        canManageMetadataMock.mockReturnValue(storeValues.canBackendManageMetadata);

        const Wrapped = withRedux(withIntl(CatalogDetailsBubble), seedState(renderedItem, storeValues));

        return render(<Wrapped item={renderedItem} offsetX={offsetX} offsetY={offsetY} />);
    }

    function expectTooltipDetailsRequested(requestedItem: ICatalogEntry) {
        expect(dispatchMock).toHaveBeenCalledWith(
            CatalogUiActions.requestCatalogItemTooltipDetails(requestedItem as IOrganizedCatalogItem),
        );
    }

    function expectTooltipDetailsNotRequested() {
        expect(dispatchMock).not.toHaveBeenCalled();
    }

    beforeEach(() => {
        dispatchMock.mockReset();
        spyGetComputedStyle = vi
            .spyOn(window, "getComputedStyle")
            .mockReturnValue({ width: "0px" } as CSSStyleDeclaration);
        spyRequestAnimationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    });

    it("shows bubble when mouse hovers over icon", async () => {
        const { container } = renderComponent();
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);
        // React BubbleTrigger show/hide bubble is asynchronous

        await waitFor(() => {
            expect(document.querySelectorAll(".s-catalogue-bubble")).toHaveLength(1);
        });

        fireEvent.mouseLeave(hoverTrigger);

        await waitFor(() => {
            expect(container.querySelectorAll(".s-catalogue-bubble")).toHaveLength(0);
        });
    });

    it("load item details without delay when mouse hovers over icon for measure item", () => {
        const measureItem: ICatalogEntry = {
            type: "metric",
            title: "measure",
            summary: "summary",
            identifier: "1",
        };
        const { container } = renderComponent({ item: measureItem });
        const hoverTrigger = container.querySelector(".inlineBubbleHelp");
        fireEvent.mouseEnter(hoverTrigger);
        expectTooltipDetailsRequested(measureItem);
    });

    it("load item details with delay when mouse hovers over icon for attribute item", async () => {
        installFakeClock();
        const attribute = asAttribute();
        const { container } = renderComponent({ item: attribute });
        const hoverTrigger = container.querySelector(".inlineBubbleHelp");
        fireEvent.mouseEnter(hoverTrigger);

        expect(dispatchMock).not.toHaveBeenCalled();

        await advanceDetailsDelay();

        expectTooltipDetailsRequested(attribute);
    });

    it("re-requests details when a required part is still missing (e.g. failed value samples)", async () => {
        installFakeClock();
        const attribute = asAttribute();
        // dataset loaded but attrElements (value samples) missing — e.g. that part failed to load
        const partialDetails = { dataset: { title: "My dataset" } };
        const { container } = renderComponent({
            item: attribute,
            bubbleDetails: partialDetails,
        });
        const hoverTrigger = container.querySelector(".inlineBubbleHelp");
        fireEvent.mouseEnter(hoverTrigger);
        await advanceDetailsDelay();

        expectTooltipDetailsRequested(attribute);
    });

    it("don't load item details for date items", () => {
        const dateItem: ICatalogEntry = {
            type: "date",
            title: "date",
            summary: "summary",
            identifier: "1",
        };
        const { container } = renderComponent({ item: dateItem });
        const hoverTrigger = container.querySelector(".inlineBubbleHelp");
        fireEvent.mouseEnter(hoverTrigger);
        expect(dispatchMock).not.toHaveBeenCalled();
    });

    const computedAttributeItem: ICatalogEntry = {
        type: "computedAttribute",
        title: "Rep performance",
        summary: "Reps bucketed by won activities",
        identifier: "rep_performance",
    };

    it("shows the definition of a computed attribute with references resolved to titles", async () => {
        // as delivered by the details loader: referenced objects arrive as resolved segments, not
        // as raw {type/id} references
        const bubbleDetails: IOrganizedCatalogTooltipDetails = {
            metricMaql: [
                { title: "SELECT CASE WHEN ", category: "text" },
                { title: "Won activities", category: "metric", id: "won" },
                { title: ' > 100 THEN "High" ELSE "Low" END', category: "text" },
            ],
        };

        const { container } = renderComponent({ item: computedAttributeItem, bubbleDetails });
        fireEvent.mouseEnter(container.querySelector(".gd-bubble-trigger"));

        await waitFor(() => {
            const bubble = document.querySelector(".s-catalogue-bubble");
            const bubbleText = bubble.textContent;
            expect(bubbleText).toContain(computedAttributeItem.title);
            expect(bubbleText).toContain(computedAttributeItem.summary);
            // the type line resolves to a real translation, not a raw message id
            expect(bubbleText).toContain("computed attribute");
            expect(bubbleText).not.toContain("bucket_item_types");
            // the definition takes the place an attribute's value samples would have, with the
            // referenced metric shown by title
            const definition = bubble.querySelector(".s-adi-catalog-tooltip-measure-expression");
            expect(definition.textContent).toEqual(
                'SELECT CASE WHEN Won activities > 100 THEN "High" ELSE "Low" END',
            );
            expect(definition.textContent).not.toContain("{metric/won}");
        });
    });

    it("requests the details of a computed attribute only after the hover delay", async () => {
        installFakeClock();
        const { container } = renderComponent({ item: computedAttributeItem });
        fireEvent.mouseEnter(container.querySelector(".inlineBubbleHelp"));

        // a computed attribute's details include a value-elements query, so it gets the same
        // hover debounce as a plain attribute - no request before the delay elapses
        expectTooltipDetailsNotRequested();

        await advanceDetailsDelay();

        expectTooltipDetailsRequested(computedAttributeItem);
    });

    it("renders basic item info", async () => {
        const { container } = renderComponent();
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            const bubbleText = document.querySelector(".s-catalogue-bubble").textContent;
            expect(bubbleText).toContain(item.title);
            expect(bubbleText).toContain(item.summary);
        });
    });

    it("renders correct bubble style when loading", async () => {
        const { container } = renderComponent();
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            const bubble = document.querySelector(".s-catalogue-bubble");
            expect(bubble.className).toContain("s-catalogue-bubble-loading");
            expect(bubble.className).not.toContain("s-catalogue-bubble-loaded");
        });
    });

    it("renders correct bubble style when loaded", async () => {
        const { container } = renderComponent({
            bubbleDetails: {},
        });
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            const bubble = document.querySelector(".s-catalogue-bubble");
            expect(bubble.className).not.toContain("s-catalogue-bubble-loading");
            expect(bubble.className).toContain("s-catalogue-bubble-loaded");
        });
    });

    it("renders metric", async () => {
        const metric = { ...item, type: "metric" };
        const metricBubbleDetails = { metricMaql: [{ title: "maql" }] };
        const { container } = renderComponent({
            item: metric,
            bubbleDetails: metricBubbleDetails,
        });
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            expect(document.querySelectorAll(".adi-metric-maql")).toHaveLength(1);
        });
    });

    it("renders attribute", async () => {
        const attribute = asAttribute();
        const attributeBubbleDetails = {
            attrElements: [{ title: "attr1" }],
            dataset: {
                title: "My dataset",
            },
        };
        const { container } = renderComponent({
            item: attribute,
            bubbleDetails: attributeBubbleDetails,
        });
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            expect(document.querySelectorAll(".s-attribute-element")).toHaveLength(1);
            expect(document.querySelector(".s-dataset-name").textContent).toEqual("My dataset");
        });
    });

    it("renders fact", async () => {
        const fact = { ...item, type: "fact" };
        const factBubbleDetails = { dataset: { title: "datasetTitle" } };
        const { container } = renderComponent({
            item: fact,
            bubbleDetails: factBubbleDetails,
        });
        const hoverTrigger = container.querySelector(".gd-bubble-trigger");
        fireEvent.mouseEnter(hoverTrigger);

        await waitFor(() => {
            expect(document.querySelectorAll(".s-dataset-name")).toHaveLength(1);
        });
    });

    describe("attribute hierarchy", () => {
        it("should note renders attribute hierarchy if the attribute doesn't include in the attribute hierarchy", async () => {
            const attribute = asAttribute();
            const attributeBubbleDetails = {
                attrElements: [{ title: "attr1" }],
                dataset: {
                    title: "My dataset",
                },
            };
            const { container } = renderComponent({
                item: attribute,
                bubbleDetails: attributeBubbleDetails,
            });

            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(document.querySelector(".s-attribute-hierarchy-wrapper")).not.toBeInTheDocument();
            });
        });

        it("should renders attribute hierarchy", async () => {
            const attribute = asAttribute("county_name");

            const attributeBubbleDetails = {
                attrElements: [{ title: "attr1" }],
                dataset: {
                    title: "My dataset",
                },
            };
            const { container } = renderComponent({
                item: attribute,
                bubbleDetails: attributeBubbleDetails,
                attributeHierarchies,
            });

            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(document.querySelector(".s-attribute-hierarchy-name")).toBeInTheDocument();
                expect(document.querySelectorAll(".s-attribute-hierarchy-name")).toHaveLength(
                    attributeHierarchies.length,
                );
            });
        });
    });

    describe("Measure detail redirect", () => {
        let windowSpy: ReturnType<typeof vi.spyOn>;
        beforeEach(() => {
            windowSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        });

        afterEach(() => {
            windowSpy.mockClear();
        });

        const catalogItemWithUri = { ...item, uri: "/itemUri" };
        const redirectAllowedProps = {
            item: catalogItemWithUri,
            isEmbeddedMode: false,
            canUserManageMetric: true,
        };

        it("should not render title and button redirects when uri is missing", async () => {
            const { container } = renderComponent({ isEmbeddedMode: false, canUserManageMetric: true });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-title-redirect")).toHaveLength(0);
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-button-redirect")).toHaveLength(0);
            });
        });

        it("should not render title and button redirects when in embedded mode", async () => {
            const { container } = renderComponent({ ...redirectAllowedProps, isEmbeddedMode: true });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-title-redirect")).toHaveLength(0);
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-button-redirect")).toHaveLength(0);
            });
        });

        it("should not render title and button redirects when user is not permitted to manage metric", async () => {
            const { container } = renderComponent({ ...redirectAllowedProps, canUserManageMetric: false });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-title-redirect")).toHaveLength(0);
                expect(container.querySelectorAll(".s-adi-catalog-tooltip-button-redirect")).toHaveLength(0);
            });
        });

        it("should render title and button redirects", async () => {
            const { container } = renderComponent({ ...redirectAllowedProps });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);

            await waitFor(() => {
                expect(document.querySelectorAll(".s-adi-catalog-tooltip-title-redirect")).toHaveLength(1);
                expect(document.querySelectorAll(".s-adi-catalog-tooltip-button-redirect")).toHaveLength(1);
            });
        });

        it("should render title redirect with correct href property", async () => {
            const { container } = renderComponent({ ...redirectAllowedProps });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);
            await waitFor(() => {
                expect(
                    document.querySelectorAll("a[href='/#s=/gdc/workspaces/projectId|objectPage|/itemUri']"),
                ).toHaveLength(1);
            });
        });

        it("should call window.open with correct arguments after click on button redirect", async () => {
            const { container } = renderComponent({ ...redirectAllowedProps });
            const hoverTrigger = container.querySelector(".gd-bubble-trigger");
            fireEvent.mouseEnter(hoverTrigger);
            await waitFor(() => {
                const button = document.querySelector(".s-adi-catalog-tooltip-button-redirect");
                fireEvent.click(button);
            });

            await waitFor(() => {
                expect(windowSpy).toHaveBeenCalled();
                expect(windowSpy.mock.calls[0]).toEqual([
                    "http://localhost:3000/#s=/gdc/workspaces/projectId|objectPage|/itemUri",
                    "_blank",
                ]);
            });
        });
    });

    describe("metric action button", () => {
        const metricRef = idRef("measure1.identifier");

        const metricItem: ICatalogEntry = {
            type: "metric",
            title: "measure 1",
            summary: "summary",
            identifier: "measure1.identifier",
            ref: metricRef,
        };

        async function renderActionButton(customProps: Partial<IStoreValues>) {
            const { container } = renderComponent({ item: metricItem, ...customProps });
            fireEvent.mouseEnter(container.querySelector(".gd-bubble-trigger"));

            return waitFor(() => {
                const button = document.querySelector(".s-adi-catalog-tooltip-metric-editor-edit");
                expect(button).not.toBeNull();
                return button;
            });
        }

        it("lets an admin edit with the flag off, even when the metric is not in the catalog", async () => {
            const button = await renderActionButton({ canUserManageProject: true, catalogItems: [] });

            expect(button.textContent).toEqual("Edit");
            expect(button.className).toContain("gd-icon-pencil");
        });

        it("ignores the metric own EDIT with the flag off", async () => {
            const button = await renderActionButton({
                canUserManageProject: false,
                catalogItems: [getCatalogMeasureWithPermissions(1, ["VIEW", "EDIT"])],
            });

            expect(button.textContent).toEqual("View");
            expect(button.className).not.toContain("gd-icon-pencil");
        });

        it("lets a non-admin edit a metric with EDIT with the flag on", async () => {
            const button = await renderActionButton({
                enableMetricPermissions: true,
                canUserManageProject: false,
                catalogItems: [getCatalogMeasureWithPermissions(1, ["VIEW", "EDIT"])],
            });

            expect(button.textContent).toEqual("Edit");
            expect(button.className).toContain("gd-icon-pencil");
        });

        it("keeps a non-admin on view for a metric without EDIT with the flag on", async () => {
            const button = await renderActionButton({
                enableMetricPermissions: true,
                canUserManageProject: false,
                catalogItems: [getCatalogMeasureWithPermissions(1, ["VIEW"])],
            });

            expect(button.textContent).toEqual("View");
            expect(button.className).not.toContain("gd-icon-pencil");
        });

        it("keeps a non-admin on view when the metric is not in the catalog", async () => {
            const button = await renderActionButton({
                enableMetricPermissions: true,
                canUserManageProject: false,
                catalogItems: [],
            });

            expect(button.textContent).toEqual("View");
            expect(button.className).not.toContain("gd-icon-pencil");
        });
    });

    afterEach(() => {
        // before the spies, so a fake clock is uninstalled while what it replaced is still in place;
        // a no-op for the tests that never installed one
        vi.useRealTimers();
        spyGetComputedStyle.mockRestore();
        spyRequestAnimationFrame.mockRestore();
    });
});
