// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IAttributeDisplayFormMetadataObject, type ICatalogAttribute, idRef } from "@gooddata/sdk-model";

import { newCatalogAttributeMap, newDisplayFormMap } from "../../../../../_staging/metadata/objRefMap.js";
import { selectBackendCapabilities } from "../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectSettings } from "../../../../../model/store/config/configSelectors.js";
import { selectSelectedWidgetRef } from "../../../../../model/store/ui/uiSelectors.js";
import { selectUnavailableObjects } from "../../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

import { DrillTargetUrlItem } from "./DrillTargetUrlItem.js";

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by an earlier test file in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const selected = vi.hoisted(() => new Map<unknown, unknown>());

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => selected.get(selector),
}));

const attributeRef = idRef("region", "attribute");
const hyperlinkRef = idRef("region_link", "displayForm");
const hyperlink = {
    ref: hyperlinkRef,
    id: "region_link",
    uri: "/region_link",
    title: "Region link",
    attribute: attributeRef,
} as IAttributeDisplayFormMetadataObject;
const attribute = {
    attribute: { ref: attributeRef, id: "region", uri: "/region", title: "Region" },
} as ICatalogAttribute;

function renderButton(catalog: {
    displayForms: IAttributeDisplayFormMetadataObject[];
    attributes: ICatalogAttribute[];
    unavailable: IUnavailableDashboardReference[];
}) {
    selected.set(selectAllCatalogDisplayFormsMap, newDisplayFormMap(catalog.displayForms));
    selected.set(selectAllCatalogAttributesMap, newCatalogAttributeMap(catalog.attributes));
    selected.set(selectUnavailableObjects, catalog.unavailable);
    selected.set(selectBackendCapabilities, {});
    selected.set(selectSettings, {});
    selected.set(selectSelectedWidgetRef, idRef("widget"));

    render(
        <IntlWrapper>
            <DrillTargetUrlItem
                widgetRef={idRef("widget")}
                urlDrillTarget={{
                    insightAttributeDisplayForm: idRef("region_name", "displayForm"),
                    drillToAttributeDisplayForm: hyperlinkRef,
                }}
                attributes={[]}
                onSelect={() => {}}
            />
        </IntlWrapper>,
    );

    return screen.getByRole("button").textContent;
}

describe("DrillTargetUrlItem", () => {
    it("names the hyperlink label the user may read", () => {
        expect(renderButton({ displayForms: [hyperlink], attributes: [attribute], unavailable: [] })).toBe(
            "Region (Region link)",
        );
    });

    it("shows a hyperlink label the user may not read as restricted", () => {
        expect(
            renderButton({
                displayForms: [],
                attributes: [],
                unavailable: [{ ref: hyperlinkRef, type: "displayForm", reason: "forbidden" }],
            }),
        ).toBe("Restricted");
    });

    it("asks to choose a URL again when the hyperlink label is gone", () => {
        expect(renderButton({ displayForms: [], attributes: [], unavailable: [] })).toBe("Choose URL");
    });
});
