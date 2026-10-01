// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { type IntlShape } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type DashboardAttributeFilterItem, type ObjRef, idRef } from "@gooddata/sdk-model";

import {
    selectBackendCapabilities,
    selectSupportsSingleSelectDependentFilters,
} from "../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";

import { AttributeFilterConfiguration } from "./AttributeFilterConfiguration.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by an earlier test file in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const loaders = vi.hoisted(() => ({
    selected: new Map<unknown, unknown>(),
    useAttributes: vi.fn((_displayForms: ObjRef[]) => ({ attributes: [], attributesLoading: false })),
    useConnectingAttributes: vi.fn((_current: ObjRef, _neighbors: ObjRef[]) => ({
        connectingAttributes: [],
        connectingAttributesLoading: false,
    })),
    useValidNeighbourAttributes: vi.fn((_current: ObjRef, _neighbors: ObjRef[]) => ({
        validNeighbourAttributes: {},
        validNeighbourAttributesLoading: false,
    })),
}));

const filter = (localIdentifier: string) =>
    ({
        attributeFilter: {
            displayForm: idRef(`${localIdentifier}-label`, "displayForm"),
            localIdentifier,
            negativeSelection: true,
            attributeElements: { uris: [] },
        },
    }) as DashboardAttributeFilterItem;

const current = filter("current");
const readable = filter("readable");

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => loaders.selected.get(selector),
}));
// The provider leaves out the neighbors the user may not read; the panel must use its list.
vi.mock("../../AttributeFilterParentFilteringContext.js", () => ({
    useAttributeFilterParentFiltering: () => ({
        filterItem: current,
        neighborFilters: [readable],
        parents: [],
        filterDisplayForms: { availableDisplayForms: [], selectedDisplayForm: idRef("current-label") },
        availableDatasetsForFilter: [],
    }),
}));
vi.mock("../../../../../_staging/sharedHooks/useAttributes.js", () => ({
    useAttributes: loaders.useAttributes,
}));
vi.mock("./hooks/useConnectingAttributes.js", () => ({
    useConnectingAttributes: loaders.useConnectingAttributes,
}));
vi.mock("./hooks/useValidNeighbourAttributes.js", () => ({
    useValidNeighbourAttributes: loaders.useValidNeighbourAttributes,
}));
vi.mock("../../../../../_staging/sharedHooks/useMetricsAndFacts.js", () => ({
    useMetricsAndFacts: () => ({ metricsAndFacts: {}, metricsAndFactsLoading: false }),
}));
vi.mock("./hooks/useAvailableDatasetsForItems.js", () => ({
    useAvailableDatasetsForItems: () => ({
        availableDatasetForItems: [],
        availableDatasetsForItemsLoading: false,
    }),
}));
vi.mock("./ConfigurationPanelHeader.js", () => ({ ConfigurationPanelHeader: () => null }));
vi.mock("../../../configuration/title/AttributeTitleRenaming.js", () => ({
    AttributeTitleRenaming: () => null,
}));
vi.mock("./selectionMode/SelectionMode.js", () => ({ SelectionMode: () => null }));
vi.mock("./limitValues/LimitValuesConfiguration.js", () => ({
    LocalizedLimitValuesConfiguration: () => null,
}));

describe("AttributeFilterConfiguration", () => {
    it("loads neighbor metadata only for the neighbors the user may read", () => {
        loaders.selected.set(selectBackendCapabilities, { supportsAttributeFilterElementsLimiting: true });
        loaders.selected.set(selectSupportsSingleSelectDependentFilters, false);

        const { container } = render(
            <AttributeFilterConfiguration
                {...({} as Parameters<typeof AttributeFilterConfiguration>[0])}
                filterRef={idRef("current-label", "displayForm")}
                closeHandler={() => {}}
                intl={{} as IntlShape}
                showConfigModeSection={false}
                showSelectionTypeSection={false}
            />,
        );

        const readableDisplayForms = [idRef("readable-label", "displayForm")];
        expect(loaders.useAttributes).toHaveBeenLastCalledWith(readableDisplayForms);
        expect(loaders.useConnectingAttributes).toHaveBeenLastCalledWith(
            idRef("current-label", "displayForm"),
            readableDisplayForms,
        );
        expect(loaders.useValidNeighbourAttributes).toHaveBeenLastCalledWith(
            idRef("current-label"),
            readableDisplayForms,
        );
        expect(container.querySelector(".s-attribute-filter-dropdown-configuration")).not.toBeNull();
    });
});
