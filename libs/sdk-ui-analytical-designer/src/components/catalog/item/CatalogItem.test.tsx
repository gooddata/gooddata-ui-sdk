// (C) 2019-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ICatalogMeasure, idRef } from "@gooddata/sdk-model";

import { type IAppState } from "../../../store/types.js";
import { getCatalogMeasureWithPermissions } from "../../../tests/catalog.test.helpers.js";
import { withData, withRoot } from "../../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { CatalogItem, type ICatalogItemOwnProps, getCatalogItemClassName } from "./CatalogItem.js";

describe("CatalogItem", () => {
    const defaultProps: ICatalogItemOwnProps = {
        item: {
            title: "My Title",
            type: "attribute",
            identifier: "myIdentifier",
            dfRef: idRef("df1"),
        },
    };

    function renderComponent(props: Partial<ICatalogItemOwnProps> = {}) {
        const WithIntl = withRedux(withIntl(CatalogItem));

        return render(<WithIntl {...defaultProps} {...props} />);
    }

    function getCatalogDetailsBubble(container: HTMLElement) {
        return container.querySelectorAll(".s-gd-bubble-trigger-wrap");
    }

    it("should render title", () => {
        const { container } = renderComponent();
        const catalogItem = container.querySelector(".adi-catalog-item");

        expect(catalogItem.textContent).toEqual("My Title");
    });

    describe("bubble help", () => {
        it("should not render bubble help if bubbleHelp is false", () => {
            const { container } = renderComponent({ bubbleHelp: false });
            const catalogDetailsBubble = getCatalogDetailsBubble(container);

            expect(catalogDetailsBubble).toHaveLength(0);
        });

        it("should render bubble help if bubbleHelp undefined", () => {
            const { container } = renderComponent();
            const catalogDetailsBubble = getCatalogDetailsBubble(container);

            expect(catalogDetailsBubble).toHaveLength(1);
        });

        it("should render bubble help if bubbleHelp is true", () => {
            const { container } = renderComponent({ bubbleHelp: true });
            const catalogDetailsBubble = getCatalogDetailsBubble(container);

            expect(catalogDetailsBubble).toHaveLength(1);
        });

        it("should not render bubble help if bubbleHelp is true and being dragged", () => {
            const { container } = renderComponent({ bubbleHelp: true, isDragging: true });
            const catalogDetailsBubble = getCatalogDetailsBubble(container);

            expect(catalogDetailsBubble).toHaveLength(0);
        });
    });

    describe("getCatalogItemClassName", () => {
        it("should return correct class for date", () => {
            const item = { type: "date", identifier: "foobar" };
            expect(getCatalogItemClassName(item)).toEqual("s-date");
        });

        it("should return correct class for other item types", () => {
            const item = { identifier: "foobar" };
            expect(getCatalogItemClassName(item)).toEqual("s-id-foobar");
        });
    });

    describe("edit metric icon", () => {
        const metricItem: ICatalogItemOwnProps["item"] = {
            type: "metric",
            title: "measure 1",
            identifier: "measure1.identifier",
        };

        function seedState(
            canManageProject: boolean,
            enableMetricPermissions: boolean,
            catalogItems: ICatalogMeasure[],
        ) {
            return (state: IAppState): IAppState => {
                let seeded = withRoot(state, {
                    workspacePermissions: { ...state.workspacePermissions, canManageProject },
                });
                seeded = withRoot(seeded, {
                    featureFlags: { ...seeded.featureFlags, enableMetricPermissions },
                });
                return withData(seeded, {
                    catalog: { ...seeded.data.catalog, items: catalogItems },
                });
            };
        }

        function renderMetric(
            canManageProject: boolean,
            enableMetricPermissions: boolean,
            catalogItems: ICatalogMeasure[] = [],
        ) {
            const Wrapped = withRedux(
                withIntl(CatalogItem),
                seedState(canManageProject, enableMetricPermissions, catalogItems),
            );
            const { container } = render(<Wrapped item={metricItem} />);

            return container.querySelector(".adi-catalog-item-edit-metric");
        }

        it("is offered to an admin with the flag off, even when the metric is not in the catalog", () => {
            expect(renderMetric(true, false)).toBeInTheDocument();
        });

        it("ignores the metric own EDIT with the flag off", () => {
            expect(
                renderMetric(false, false, [getCatalogMeasureWithPermissions(1, ["VIEW", "EDIT"])]),
            ).not.toBeInTheDocument();
        });

        it("is offered to a non-admin for a metric with EDIT with the flag on", () => {
            expect(
                renderMetric(false, true, [getCatalogMeasureWithPermissions(1, ["VIEW", "EDIT"])]),
            ).toBeInTheDocument();
        });

        it("is withheld from a non-admin for a metric without EDIT with the flag on", () => {
            expect(
                renderMetric(false, true, [getCatalogMeasureWithPermissions(1, ["VIEW"])]),
            ).not.toBeInTheDocument();
        });

        it("stays with an admin when the metric is not in the catalog with the flag on", () => {
            expect(renderMetric(true, true)).toBeInTheDocument();
        });
    });

    describe("unavailable item", () => {
        it("should add correct classes for unavailable item", () => {
            const { container } = renderComponent({
                item: {
                    title: "My Title",
                    type: "attribute",
                    identifier: "myIdentifier",
                    dfRef: idRef("df1"),
                    available: false,
                },
            });

            expect(container.querySelector(".not-available")).toBeInTheDocument();
            expect(container.querySelector(".s-item-unavailable")).toBeInTheDocument();
        });
    });
});
