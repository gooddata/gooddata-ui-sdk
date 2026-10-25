// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type CatalogItem, type ICatalogAttribute, uriRef } from "@gooddata/sdk-model";

import { createDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { save } from "../../models/item_cache.js";
import { initialState } from "../../reducers/initial_state.js";
import {
    updateAttributeFilter,
    updateAttributeFilterDisplayForm,
} from "../../store/bucket_filters/bucket_filters_actions.js";
import { FilterBarService } from "../../store/filter_bar/filter_bar_service.js";
import { type IAttributeFilter, type IFilter } from "../../store/filter_bar/filter_bar_types.js";
import { setupAppStateWithDateDatasetMeta } from "../../tests/constants.test.helpers.js";
import { buildAttributeFilterMock, filtersMock } from "../../tests/filter.test.helpers.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type ICacheItemDisplayForm, type ICatalogEntries } from "../../typings/state_objects.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import {
    AttributeFilterItemPureBase,
    AttributeFilterItemTest,
    type IAttributeFilterItemProps,
} from "./AttributeFilterItem.js";

vi.hoisted(() => {
    vi.resetModules();
});

const filter: IFilter = buildAttributeFilterMock({});

// spelled out rather than left to the automocker: the automocker has to import the real module to
// derive its shape, and that lookup goes through the module registry the whole worker shares, so it
// intermittently handed this file an empty module (`No "AttributeFilter" export is defined`)
vi.mock("../AttributeFilter/AttributeFilter", () => ({
    AttributeFilter: vi.fn(() => <div className="s-filter-button" />),
}));

const activityCatalogAttribute: ICatalogAttribute = {
    attribute: {
        description: "",
        production: true,
        title: "Activity",
        id: "attr.activity",
        ref: { identifier: "attr.activity" },
        type: "attribute",
        uri: "activityUri",
        deprecated: false,
        unlisted: false,
        displayForms: [
            {
                attribute: { identifier: "attr.activity" },
                description: "",
                ref: { identifier: "label.activity" },
                id: "label.activity",
                production: true,
                title: "Activity",
                uri: "activityDfUri",
                type: "displayForm",
                deprecated: false,
                unlisted: false,
            },
        ],
    },
    groups: [],
    geoPinDisplayForms: [],
    defaultDisplayForm: {
        attribute: { identifier: "attr.activity" },
        description: "",
        ref: { identifier: "label.activity" },
        id: "label.activity",
        production: true,
        title: "Activity",
        uri: "activityDfUri",
        type: "displayForm",
        deprecated: false,
        unlisted: false,
    },
    displayForms: [
        {
            attribute: { identifier: "attr.activity" },
            description: "",
            ref: { identifier: "label.activity" },
            id: "label.activity",
            production: true,
            title: "Activity",
            uri: "activityDfUri",
            type: "displayForm",
            deprecated: false,
            unlisted: false,
        },
    ],
    type: "attribute",
};

const regionCatalogAttribute: ICatalogAttribute = {
    attribute: {
        description: "",
        production: true,
        title: "Region",
        id: "attr.region",
        ref: { identifier: "attr.region" },
        type: "attribute",
        uri: "regionUri",
        deprecated: false,
        unlisted: false,
        displayForms: [
            {
                attribute: { identifier: "attr.region" },
                description: "",
                ref: { identifier: "label.region" },
                id: "label.region",
                production: true,
                title: "Region",
                uri: "regionDfUri",
                type: "displayForm",
                deprecated: false,
                unlisted: false,
            },
        ],
    },
    groups: [],
    geoPinDisplayForms: [],
    defaultDisplayForm: {
        attribute: { identifier: "attr.region" },
        description: "",
        ref: { identifier: "label.region" },
        id: "label.region",
        production: true,
        title: "Region",
        uri: "regionDfUri",
        type: "displayForm",
        deprecated: false,
        unlisted: false,
    },
    displayForms: [
        {
            attribute: { identifier: "attr.region" },
            description: "",
            ref: { identifier: "label.region" },
            id: "label.region",
            production: true,
            title: "Region",
            uri: "regionDfUri",
            type: "displayForm",
            deprecated: false,
            unlisted: false,
        },
    ],
    type: "attribute",
};

const catalogItemsWithFilterAttribute: ICatalogAttribute[] = [
    activityCatalogAttribute,
    regionCatalogAttribute,
    {
        attribute: {
            description: "",
            production: true,
            title: "Identifier",
            id: "attr.identifier",
            ref: { identifier: "attr.identifier" },
            type: "attribute",
            uri: "identifierUri",
            deprecated: false,
            unlisted: false,
            displayForms: [
                {
                    attribute: { identifier: "attr.identifier" },
                    description: "",
                    ref: { identifier: "label.identifier" },
                    id: "label.identifier",
                    production: true,
                    title: "Identifier",
                    uri: "identifierDfUri",
                    type: "displayForm",
                    deprecated: false,
                    unlisted: false,
                },
            ],
        },
        groups: [],
        geoPinDisplayForms: [],
        defaultDisplayForm: {
            attribute: { identifier: "attr.identifier" },
            description: "",
            ref: { identifier: "label.identifier" },
            id: "label.identifier",
            production: true,
            title: "Identifier",
            uri: "identifierDfUri",
            type: "displayForm",
            deprecated: false,
            unlisted: false,
        },
        displayForms: [
            {
                attribute: { identifier: "attr.identifier" },
                description: "",
                ref: { identifier: "label.identifier" },
                id: "label.identifier",
                production: true,
                title: "Identifier",
                uri: "identifierDfUri",
                type: "displayForm",
                deprecated: false,
                unlisted: false,
            },
        ],
        type: "attribute",
    },
];
const catalogItemsWithoutFilterAttribute: CatalogItem[] = [activityCatalogAttribute, regionCatalogAttribute];

const defaultProps: IAttributeFilterItemProps = {
    filter: createDecoratedMetricAttributeFilter(),
    isUsedByInsight: true,
    updateAttributeFilter,
    filterLocalIdentifier: "filterLocalIdentifier",
    availableDisplayForms: [],
    availableSelectionTypes: ["elements"],
    updateAttributeFilterDisplayForm,
};

function createComponent(customProps?: Partial<IAttributeFilterItemProps>) {
    const Wrapped = withRedux(withIntl(AttributeFilterItemPureBase));
    return render(<Wrapped {...defaultProps} {...customProps} />);
}

describe("AttributeFilterItem", () => {
    describe("component", () => {
        it('should have class "highlight" when component receive isHighlighted=true in props', () => {
            const { container } = createComponent({ isHighlighted: true });
            expect(container.querySelector(".adi-bucket-item")).toHaveClass("highlight");
        });

        it('should not have class "highlight" when component receive isHighlighted=false in props', () => {
            const { container } = createComponent({ isHighlighted: false });
            expect(container.querySelector(".adi-bucket-item")).not.toHaveClass("highlight");
        });
    });

    describe("selector", () => {
        const state = setupAppStateWithDateDatasetMeta(initialState);
        const stateWithFilterBar = FilterBarService.setFilterBarState(state, {
            items: filtersMock,
            isMultiline: false,
            migratedAdditionalFilters: [],
            parameterItems: [],
            filterBarDropdownOpen: false,
            attributeFilterConfigs: {},
        });

        const notExistAttributeFilterItemProp = {
            filterLocalIdentifier: "unknown.localIdentifier",
        };

        const attributeFilterItemProp = {
            filterLocalIdentifier: "attr.localIdentifier",
        };

        describe("getAttributeFilterItem", () => {
            it("should find attribute filter with attr.localIdentifier filterLocalIdentifier", () => {
                const filter = AttributeFilterItemTest.getAttributeFilterItem(
                    stateWithFilterBar,
                    attributeFilterItemProp,
                );

                expect(filter.localIdentifier).toBe(attributeFilterItemProp.filterLocalIdentifier);
            });

            it("should find no items and return undefined when get not exist filterLocalIdentifier", () => {
                const notExistFilter = AttributeFilterItemTest.getAttributeFilterItem(
                    stateWithFilterBar,
                    notExistAttributeFilterItemProp,
                );

                expect(notExistFilter).toBeUndefined();
            });
        });
        describe("createGetAttributeFilterProp", () => {
            function transformFilterItemToOldDefinition(
                attributeFilter: IAttributeFilter,
            ): IBucketItemMetricFilter {
                return {
                    allElements: [],
                    localIdentifier: attributeFilter.localIdentifier,
                    attribute: attributeFilter.cacheItemIdentifier,
                    displayFormRef: attributeFilter?.displayFormRef ?? uriRef("attr/df/uri"),
                    ...attributeFilter.filterConfig,
                };
            }

            it("should return valid DecoratedMetricAttributeFilter with right data", () => {
                const attributeFilterProp = AttributeFilterItemTest.createGetAttributeFilterProp();
                const decoratedMetricAttributeFilter = attributeFilterProp(
                    stateWithFilterBar,
                    attributeFilterItemProp,
                );
                const attributeFilterPropItem = createDecoratedMetricAttributeFilter(
                    transformFilterItemToOldDefinition(filtersMock[0] as IAttributeFilter),
                );

                expect(decoratedMetricAttributeFilter.isDate).toEqual(false);

                expect(decoratedMetricAttributeFilter).toEqual(attributeFilterPropItem);
            });

            it("should return valid DecoratedMetricAttributeFilter generated from attribute filter provided via props with right data", () => {
                const attributeFilterProp: IAttributeFilter = {
                    localIdentifier: "localIdentifier",
                    type: "attribute",
                    cacheItemIdentifier: "cacheItemIdentifier",
                    displayFormRef: {
                        uri: "uri/test/",
                    },
                    filterConfig: {
                        selectedElements: [],
                        isInverted: false,
                        totalElementsCount: 10,
                    },
                };
                const getAttributeFilterProp = AttributeFilterItemTest.createGetAttributeFilterProp();
                const decoratedMetricAttributeFilter = getAttributeFilterProp(stateWithFilterBar, {
                    ...attributeFilterItemProp,
                    attributeFilterProp,
                });
                const attributeFilterPropItem = createDecoratedMetricAttributeFilter(
                    transformFilterItemToOldDefinition(attributeFilterProp),
                );

                expect(decoratedMetricAttributeFilter.isDate).toEqual(false);

                expect(decoratedMetricAttributeFilter).toEqual(attributeFilterPropItem);
            });

            it("should return null when attributeFilterProp receive not exist identifier", () => {
                const attributeFilterProp = AttributeFilterItemTest.createGetAttributeFilterProp();
                const decoratedMetricAttributeFilter = attributeFilterProp(
                    stateWithFilterBar,
                    notExistAttributeFilterItemProp,
                );

                expect(decoratedMetricAttributeFilter).toBeNull();
            });
        });
        describe("isUsedByInsight", () => {
            const isUsedByInsight = AttributeFilterItemTest.isUsedByInsightSelector();

            it("should return true if the filter attribute is available in the catalog", () => {
                expect(
                    isUsedByInsight.resultFunc(
                        filter,
                        catalogItemsWithFilterAttribute,
                        catalogItemsWithFilterAttribute,
                        false,
                    ),
                ).toBe(true);
            });
            it("should return false if the filter attribute is hidden in the catalog", () => {
                expect(
                    isUsedByInsight.resultFunc(
                        filter,
                        catalogItemsWithFilterAttribute,
                        catalogItemsWithoutFilterAttribute,
                        false,
                    ),
                ).toBe(false);
            });
            it("should return true if the filter attribute is from another dataset", () => {
                expect(
                    isUsedByInsight.resultFunc(
                        filter,
                        catalogItemsWithoutFilterAttribute,
                        catalogItemsWithoutFilterAttribute,
                        false,
                    ),
                ).toBe(true);
            });
            it("should return true if the list of available catalog items is loading", () => {
                expect(
                    isUsedByInsight.resultFunc(
                        filter,
                        catalogItemsWithFilterAttribute,
                        catalogItemsWithoutFilterAttribute,
                        true,
                    ),
                ).toBe(true);
            });
        });

        describe("getDisplayFormsForAttributeFilterSelector", () => {
            const itemCache: ICatalogEntries = {
                "attribute.attr.identifier": {
                    // the `uri` a real display form carries is omitted on purpose: the selector
                    // never reads it and the snapshot would capture it
                    displayForms: [
                        {
                            id: "attr.text",
                            title: "Text display form",
                            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/666"),
                            type: undefined,
                        },
                        {
                            id: "attr.hyperlink",
                            title: "Hyperlink display form",
                            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/667"),
                            type: "GDC.link",
                        },
                        {
                            id: "attr.geo_pin",
                            title: "Geo push pun display form",
                            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/668"),
                            type: "GDC.geo.pin",
                        },
                        {
                            id: "attr.geo_legacy",
                            title: "Legacy geo display form",
                            ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/669"),
                            type: "GDC.geo.ausstates.code",
                        },
                    ] as ICacheItemDisplayForm[],
                },
            };
            const stateWithItemCache = save(stateWithFilterBar, itemCache);

            it("should return available display forms from item cache", () => {
                expect(
                    AttributeFilterItemTest.getDisplayFormsForAttributeFilterSelector(
                        stateWithItemCache,
                        attributeFilterItemProp,
                    ),
                ).toMatchSnapshot();
            });
        });
    });
});
