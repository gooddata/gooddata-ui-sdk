// (C) 2019-2026 GoodData Corporation

import { fireEvent, render, waitFor } from "@testing-library/react";
import { range } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { MEASURES } from "../../constants/bucket.js";
import { type IDecoratedAttributeElement } from "../../models/decorated_attribute_elements.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import {
    type IMeasureAttributeFilterOrganizedProps,
    MeasureAttributeFilterOrganized as MeasureAttributeFilter,
} from "./MeasureAttributeFilterOrganized.js";

describe("MeasureAttributeFilterOrganized", () => {
    const Wrapped = withRedux(withIntl(MeasureAttributeFilter));

    const defaultTestProjectID = "proj_id";
    const testDecoratedFilter = {
        attribute: {
            type: "attribute",
            dfUri: "filter/attr/dfuri",
            dfRef: uriRef("filter/attr/dfuri"),
            displayForms: [
                {
                    id: "dfuri",
                    ref: uriRef("filter/attr/dfuri"),
                    uri: "filter/attr/dfuri",
                    title: "dfuri",
                    isPrimary: true,
                },
            ],
        } as ICatalogEntry,
        original: {
            displayFormRef: uriRef("filter/attr/dfuri"),
        } as IBucketItemMetricFilter,
        selectedElements: [
            {
                uri: "filter/attr/selected/element1",
                title: "element1",
            },
        ] as IDecoratedAttributeElement[],
    } as IDecoratedMetricAttributeFilter;

    const defaultTestBucketItem: IDecoratedBucketItem = newDecoratedBucketItem({
        aggregation: "sum",
        isMeasure: true,
        attribute: {
            ref: uriRef("bucket/item/measure/uri"),
            uri: "bucket/item/measure/uri",
        },
        showInPercent: true,
        filters: [testDecoratedFilter],
    });

    const bucketItems = [
        {
            measure: {
                // the decorated model always carries measureAxisLabel (default ""), which
                // the MD conversion emits as the measure title
                title: "",
                definition: {
                    measureDefinition: {
                        aggregation: "sum",
                        filters: [
                            {
                                positiveAttributeFilter: {
                                    displayForm: {
                                        uri: "filter/attr/dfuri",
                                    },
                                    in: { values: ["filter/attr/selected/element1"] },
                                },
                            },
                        ],
                        item: {
                            uri: "bucket/item/measure/uri",
                        },
                    },
                },
            },
        },
    ];

    const defaultTestTagsConfiguration = {
        includeObjectsWithTags: [{ identifier: "zzz" }],
    };

    const defaultRenderProps: IMeasureAttributeFilterOrganizedProps = {
        projectId: defaultTestProjectID,
        bucketLocalIdentifier: MEASURES,
        bucketItem: defaultTestBucketItem,
        onSelect: vi.fn(),
        tagsConfiguration: defaultTestTagsConfiguration,
        isLocationIconEnabled: false,
    };

    function renderComponent(customProps: Partial<IMeasureAttributeFilterOrganizedProps> = {}) {
        return render(<Wrapped {...defaultRenderProps} {...customProps} />);
    }

    async function renderAndOpenWithResult(customProps: Partial<IMeasureAttributeFilterOrganizedProps> = {}) {
        const result = renderComponent(customProps);
        fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));
        await waitFor(() => {
            expect(document.querySelector(".adi-attr-filter-picker input")).toBeInTheDocument();
        });
        return result;
    }

    async function renderAndOpenBase(customProps: Partial<IMeasureAttributeFilterOrganizedProps> = {}) {
        renderComponent(customProps);
        fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));

        // the items are loaded asynchronously, the dropdown shows a loading placeholder until the
        // itemsLoader promise resolves; the search input (and the items) only render afterwards
        await waitFor(() => {
            expect(document.querySelector(".adi-attr-filter-picker input")).toBeInTheDocument();
        });
    }

    const renderAndOpen = renderAndOpenBase;

    function getMockLoader(result: CatalogItem[] = []) {
        return vi.fn().mockReturnValue(Promise.resolve(result));
    }

    function mockCatalogItems(length: number): CatalogItem[] {
        const titles: string[] = ["customer", "product", "between", "duct tape", "a duck", "order", "state"];
        return range(0, length).map((order: number): CatalogItem => {
            const defaultDisplayForm: IAttributeDisplayFormMetadataObject = {
                type: "displayForm",
                ref: {
                    identifier: `identifier${order}`,
                },
                attribute: {
                    identifier: `attrIdentifier${order}`,
                },
                id: `identifier${order}`,
                description: "",
                title: "",
                uri: `dfUri${order}`,
                production: true,
                deprecated: false,
                unlisted: false,
                isDefault: true,
                isPrimary: true,
            };

            return {
                defaultDisplayForm,
                displayForms: [defaultDisplayForm],
                attribute: {
                    title: `title${order} ${titles[order]}`,
                    description: "",
                    id: `attrIdentifier${order}`,
                    ref: {
                        identifier: `attrIdentifier${order}`,
                    },
                    type: "attribute",
                    uri: `uri${order}`,
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    displayForms: [defaultDisplayForm],
                },
                geoPinDisplayForms: [
                    {
                        type: "displayForm",
                        ref: idRef(`location.id${order}`),
                        attribute: {
                            identifier: `attrIdentifier${order}`,
                        },
                        id: `location.id${order}`,
                        description: "",
                        title: "",
                        uri: `localtionUri${order}`,
                        production: true,
                        deprecated: false,
                        unlisted: false,
                    },
                ],
                type: "attribute",
                groups: [],
            };
        });
    }

    function mockComputedAttributeCatalogItems(): CatalogItem[] {
        const defaultDisplayForm: IAttributeDisplayFormMetadataObject = {
            type: "displayForm",
            // a computed attribute has no labels; its single display form is fabricated client-side
            // and carries the computed attribute's own type on the ref
            ref: idRef("rep_performance", "computedAttribute"),
            attribute: idRef("rep_performance", "computedAttribute"),
            id: "rep_performance",
            description: "",
            title: "Rep performance",
            uri: "rep_performance",
            production: true,
            deprecated: false,
            unlisted: false,
            isDefault: true,
            isPrimary: true,
        };

        return [
            {
                type: "computedAttribute",
                computedAttribute: {
                    type: "computedAttribute",
                    ref: idRef("rep_performance", "computedAttribute"),
                    id: "rep_performance",
                    uri: "rep_performance",
                    title: "Rep performance",
                    description: "",
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    expression: "SELECT 1",
                    displayForms: [defaultDisplayForm],
                },
                defaultDisplayForm,
                displayForms: [defaultDisplayForm],
                groups: [],
            } as unknown as CatalogItem,
        ];
    }

    describe("initial render", () => {
        it("should render button", () => {
            renderComponent();

            const button = document.querySelector(".s-metric-attribute-filter-button");

            expect(button).toBeInTheDocument();
            expect(button).toHaveClass(
                "s-measures-bucket-id s-metric-attribute-filter-button gd-button-link gd-icon-plus button-dropdown gd-icon-right measures-bucket-id metric-attribute-filter-button",
            );
            expect(button.textContent).toBe("Add attribute filter");
        });

        it("should not render the dropdown", () => {
            renderComponent();
            expect(document.querySelector(".adi-attr-filter-picker")).not.toBeInTheDocument();
        });

        it("should not load the items", () => {
            const itemsLoader = vi.fn();
            renderComponent({ itemsLoader });

            expect(itemsLoader).not.toHaveBeenCalled();
        });
    });

    describe("dropdown updates", () => {
        it("should load the items with current tags configuration and the bucket item as params when clicked", async () => {
            const itemsLoader = getMockLoader();

            await renderAndOpen({ itemsLoader });

            const loadItemsCall = itemsLoader.mock.calls[0];
            const loadItemsCallProjectId = loadItemsCall[0];
            const loadItemsCallMdTagsConfig = loadItemsCall[1];
            const loadItemsCallItems = loadItemsCall[2];

            expect(loadItemsCallProjectId).toBe(defaultTestProjectID);
            expect(loadItemsCallMdTagsConfig).toEqual(defaultTestTagsConfiguration);
            expect(loadItemsCallItems).toEqual({
                items: bucketItems,
                enableComputedAttributes: false,
            });
        });

        it("should ask for computed attributes only when the feature flag is on", async () => {
            // the flag changes the catalog request AND the computeValidObjects body, so it must not
            // leak into the request while the feature is off
            const itemsLoader = getMockLoader();
            await renderAndOpen({ itemsLoader, computedAttributesEnabled: true });

            expect(itemsLoader.mock.calls[0][2]).toEqual({
                items: bucketItems,
                enableComputedAttributes: true,
            });
        });

        it("should open the dropdown when clicked the button", () => {
            const itemsLoader = getMockLoader();

            renderComponent({ itemsLoader });

            const button = document.querySelector(".s-metric-attribute-filter-button");
            fireEvent.click(button);

            expect(document.querySelector(".adi-attr-filter-picker")).toBeInTheDocument();
        });

        it("should closed the dropdown when clicked again", () => {
            const itemsLoader = getMockLoader();

            renderComponent({ itemsLoader });

            const button = document.querySelector(".s-metric-attribute-filter-button");
            fireEvent.click(button);
            fireEvent.click(button);

            expect(document.querySelector(".adi-attr-filter-picker")).not.toBeInTheDocument();
        });

        it("should render no results element when the loader returned no items", async () => {
            const itemsLoader = getMockLoader();

            await renderAndOpen({ itemsLoader });

            await waitFor(() => {
                expect(document.querySelector("input")).toBeInTheDocument();
                expect(document.querySelector(".s-no-results")).toBeInTheDocument();
            });
        });

        it("should render list of loaded elements", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(2));

            await renderAndOpen({ itemsLoader });

            expect(document.querySelector(".s-filter-item")).toBeInTheDocument();
        });

        it("should disable attributes that are already in measure filters", async () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: {
                    displayForm: { uri: "test" },
                },
                filters: [
                    { attribute: { identifier: "attrIdentifier1" } } as IDecoratedMetricAttributeFilter,
                ],
            });
            const itemsLoader = getMockLoader(mockCatalogItems(3));

            await renderAndOpen({ itemsLoader, bucketItem });

            const items = document.querySelectorAll(".s-filter-item");
            expect(items[0]).not.toHaveClass("is-disabled");
            expect(items[1]).toHaveClass("is-disabled");
            expect(items[2]).not.toHaveClass("is-disabled");
        });

        it("should update location icon when loaded items have location display form", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(2));
            await renderAndOpen({ itemsLoader, isLocationIconEnabled: true });
            const items = document.querySelectorAll(".s-filter-item");

            expect(items).toHaveLength(2);
            expect(items[0].querySelector(".geo-attr-field-icon")).toBeInTheDocument();
        });
    });

    describe("reloading", () => {
        it("should keep the loaded items across closing and reopening the dropdown", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(1));
            await renderAndOpenWithResult({ itemsLoader });
            expect(itemsLoader).toHaveBeenCalledTimes(1);

            fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));
            expect(document.querySelector(".adi-attr-filter-picker")).not.toBeInTheDocument();
            fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));

            expect(document.querySelector(".adi-attr-filter-picker input")).toBeInTheDocument();
            expect(itemsLoader).toHaveBeenCalledTimes(1);
        });

        it("should not reload the items for a bucket item rebuilt with the same content", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(1));
            const { rerender } = await renderAndOpenWithResult({ itemsLoader });
            expect(itemsLoader).toHaveBeenCalledTimes(1);

            rerender(
                <Wrapped
                    {...defaultRenderProps}
                    itemsLoader={itemsLoader}
                    bucketItem={{ ...defaultTestBucketItem }}
                />,
            );

            expect(itemsLoader).toHaveBeenCalledTimes(1);
        });
    });

    describe("computed attributes", () => {
        const renderAndOpen = (customProps: Partial<IMeasureAttributeFilterOrganizedProps> = {}) =>
            renderAndOpenBase({ computedAttributesEnabled: true, ...customProps });

        it("should list computed attributes alongside regular ones", async () => {
            const itemsLoader = getMockLoader([
                ...mockCatalogItems(2),
                ...mockComputedAttributeCatalogItems(),
            ]);

            await renderAndOpen({ itemsLoader });

            const items = document.querySelectorAll(".s-filter-item");
            expect(items).toHaveLength(3);
            expect(items[2].textContent).toBe("Rep performance");
        });

        it("should keep sibling keys distinct when an attribute and a computed attribute collide", async () => {
            // mockCatalogItems builds attrIdentifier0..n; line these up on one identifier so a
            // key of item.identifier alone would repeat across the two rendered rows
            const [regular] = mockCatalogItems(1);
            const colliding = {
                ...regular,
                attribute: { ...(regular as { attribute: object }).attribute, id: "rep_performance" },
            } as CatalogItem;
            const itemsLoader = getMockLoader([colliding, ...mockComputedAttributeCatalogItems()]);
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

            await renderAndOpen({ itemsLoader });

            expect(document.querySelectorAll(".s-filter-item")).toHaveLength(2);
            expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/same key|unique "key"/i);
            consoleError.mockRestore();
        });

        it("should not show the location icon for a computed attribute", async () => {
            const itemsLoader = getMockLoader(mockComputedAttributeCatalogItems());

            await renderAndOpen({ itemsLoader, isLocationIconEnabled: true });

            const [item] = document.querySelectorAll(".s-filter-item");
            expect(item.querySelector(".geo-attr-field-icon")).not.toBeInTheDocument();
            expect(item.querySelector(".attr-field-icon")).toBeInTheDocument();
        });

        it("should not disable a computed attribute because a regular attribute shares its identifier", async () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: { displayForm: { uri: "test" } },
                filters: [
                    {
                        attribute: { identifier: "rep_performance", type: "attribute" },
                    } as IDecoratedMetricAttributeFilter,
                ],
            });
            const itemsLoader = getMockLoader(mockComputedAttributeCatalogItems());

            await renderAndOpen({ itemsLoader, bucketItem });

            expect(document.querySelector(".s-filter-item")).not.toHaveClass("is-disabled");
        });

        it("should disable a computed attribute already used in the metric filters", async () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: { displayForm: { uri: "test" } },
                filters: [
                    {
                        attribute: { identifier: "rep_performance", type: "computedAttribute" },
                    } as IDecoratedMetricAttributeFilter,
                ],
            });
            const itemsLoader = getMockLoader(mockComputedAttributeCatalogItems());

            await renderAndOpen({ itemsLoader, bucketItem });

            expect(document.querySelector(".s-filter-item")).toHaveClass("is-disabled");
        });

        it("should select a computed attribute with its own type and refs", async () => {
            const itemsLoader = getMockLoader(mockComputedAttributeCatalogItems());
            const onSelect = vi.fn();

            await renderAndOpen({ itemsLoader, onSelect });
            fireEvent.click(document.querySelector(".s-filter-item"));

            // the refs must keep the computedAttribute type - the created filter's displayFormRef is
            // built from them, and the backend refuses a computed attribute referenced as a label
            expect(onSelect).toHaveBeenCalledWith({
                identifier: "rep_performance",
                title: "Rep performance",
                type: "computedAttribute",
                ref: idRef("rep_performance", "computedAttribute"),
                dfRef: idRef("rep_performance", "computedAttribute"),
                dfUri: "rep_performance",
                primaryRef: idRef("rep_performance", "computedAttribute"),
                primaryUri: "rep_performance",
                isLocationIconVisible: false,
            });
        });
    });

    describe("out-of-order load requests", () => {
        function deferred<T>() {
            let resolve!: (value: T) => void;
            let reject!: (reason?: unknown) => void;
            const promise = new Promise<T>((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return { promise, resolve, reject };
        }

        it("should ignore a failure that arrives after a newer request already loaded items", async () => {
            const first = deferred<CatalogItem[]>();
            const second = deferred<CatalogItem[]>();
            const itemsLoader = vi
                .fn()
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise);
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

            // open the dropdown -> request A; a tags change then starts request B
            const { rerender } = renderComponent({ itemsLoader });
            fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));
            rerender(
                <Wrapped
                    projectId={defaultTestProjectID}
                    bucketLocalIdentifier={MEASURES}
                    bucketItem={defaultTestBucketItem}
                    onSelect={vi.fn()}
                    tagsConfiguration={{ includeObjectsWithTags: [{ identifier: "other" }] }}
                    isLocationIconEnabled={false}
                    itemsLoader={itemsLoader}
                />,
            );
            expect(itemsLoader).toHaveBeenCalledTimes(2);

            // B succeeds, then the stale A rejects — A must not clear B's items
            second.resolve(mockCatalogItems(2));
            await waitFor(() => {
                expect(document.querySelectorAll(".s-filter-item")).toHaveLength(2);
            });
            first.reject(new Error("stale request failed"));
            await waitFor(() => {
                expect(itemsLoader).toHaveBeenCalledTimes(2);
            });

            expect(document.querySelectorAll(".s-filter-item")).toHaveLength(2);
            consoleError.mockRestore();
        });

        it("should ignore items that arrive after a newer request superseded them", async () => {
            const first = deferred<CatalogItem[]>();
            const second = deferred<CatalogItem[]>();
            const itemsLoader = vi
                .fn()
                .mockReturnValueOnce(first.promise)
                .mockReturnValueOnce(second.promise);

            const { rerender } = renderComponent({ itemsLoader });
            fireEvent.click(document.querySelector(".s-metric-attribute-filter-button"));
            rerender(
                <Wrapped
                    projectId={defaultTestProjectID}
                    bucketLocalIdentifier={MEASURES}
                    bucketItem={defaultTestBucketItem}
                    onSelect={vi.fn()}
                    tagsConfiguration={{ includeObjectsWithTags: [{ identifier: "other" }] }}
                    isLocationIconEnabled={false}
                    itemsLoader={itemsLoader}
                />,
            );

            // B lands first, THEN the stale A resolves with a longer list — A must not overwrite it
            second.resolve(mockCatalogItems(2));
            await waitFor(() => {
                expect(document.querySelectorAll(".s-filter-item")).toHaveLength(2);
            });
            first.resolve(mockCatalogItems(5));
            await waitFor(() => {
                expect(itemsLoader).toHaveBeenCalledTimes(2);
            });

            expect(document.querySelectorAll(".s-filter-item")).toHaveLength(2);
        });
    });

    describe("search", () => {
        it("should show no results message when no attribute is matching the search phrase", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(2));

            await renderAndOpen({ itemsLoader });
            const search = document.querySelector("input");
            fireEvent.change(search, { target: { value: "foo" } });

            const items = document.querySelectorAll(".s-filter-item");
            expect(items).toHaveLength(0);
            expect(document.querySelector(".s-no-results")).toBeInTheDocument();
        });

        it("should limit the items in the dropdown to those matching the search phrase", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(12));

            await renderAndOpen({ itemsLoader });
            const search = document.querySelector("input");
            fireEvent.change(search, { target: { value: "duct" } });

            const items = document.querySelectorAll(".s-filter-item");
            expect(items).toHaveLength(2);
            expect(items[0].textContent).toBe("title1 product");
            expect(items[1].textContent).toBe("title3 duct tape");
            expect(document.querySelector(".s-no-results")).not.toBeInTheDocument();
        });

        it("should show all the items again when the search phrase has been cleared", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(12));

            await renderAndOpen({ itemsLoader });
            const search = document.querySelector("input");
            fireEvent.change(search, { target: { value: "duct" } });
            fireEvent.change(search, { target: { value: "" } });

            const items = document.querySelectorAll(".s-filter-item");
            expect(items).toHaveLength(12);
        });
    });

    describe("callbacks", () => {
        it("should call onSelect when the item has been clicked", async () => {
            const itemsLoader = getMockLoader(mockCatalogItems(2));
            const onSelect = vi.fn();
            await renderAndOpen({ itemsLoader, onSelect });

            const items = document.querySelectorAll(".s-filter-item");
            fireEvent.click(items[1]);

            expect(onSelect.mock.calls[0][0]).toMatchSnapshot();
        });

        it("should not call onSelect when the clicked item is disabled(already used in filters)", async () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: {
                    displayForm: { uri: "test" },
                },
                filters: [
                    { attribute: { identifier: "attrIdentifier1" } } as IDecoratedMetricAttributeFilter,
                ],
            });
            const itemsLoader = getMockLoader(mockCatalogItems(2));

            const onSelect = vi.fn();
            await renderAndOpen({ itemsLoader, bucketItem, onSelect });

            const items = document.querySelectorAll(".s-filter-item");
            fireEvent.click(items[1]);

            expect(onSelect).not.toHaveBeenCalled();
        });
    });
});
