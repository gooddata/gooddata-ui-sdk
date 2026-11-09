// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef, newInsightDefinition } from "@gooddata/sdk-model";

import { newCatalogMeasureMap, newDisplayFormMap } from "../../../../_staging/metadata/objRefMap.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../model/store/catalog/catalogSelectors.js";
import {
    selectEnableMeasureValueFilterKD,
    selectEnableParameters,
    selectIsWhiteLabeled,
} from "../../../../model/store/config/configSelectors.js";
import { selectInsightByWidgetRef } from "../../../../model/store/insights/insightsSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilterItems,
    selectFilterContextMeasureValueFilters,
} from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import {
    type IWidgetParameterValue,
    selectWidgetParameterValues,
} from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { CustomUrlEditor } from "./CustomUrlEditor.js";

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by an earlier test file in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const selected = vi.hoisted(() => new Map<unknown, unknown>());

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => selected.get(selector),
}));

const widgetRef = idRef("widget");

const topN: IWidgetParameterValue = {
    identifier: "top_n",
    parameterType: "NUMBER",
    title: "Top N",
    value: 25,
};

function renderEditor({
    enableParameters,
    parameters,
    customUrl = "",
}: {
    enableParameters: boolean;
    parameters: IWidgetParameterValue[];
    customUrl?: string;
}) {
    selected.set(selectEnableParameters, enableParameters);
    selected.set(selectWidgetParameterValues(widgetRef), parameters);
    selected.set(selectEnableMeasureValueFilterKD, false);
    selected.set(selectIsWhiteLabeled, false);
    selected.set(selectInsightByWidgetRef(widgetRef), newInsightDefinition("local:table"));
    selected.set(selectAllCatalogDisplayFormsMap, newDisplayFormMap([]));
    selected.set(selectAllCatalogMeasuresMap, newCatalogMeasureMap([]));
    selected.set(selectFilterContextAttributeFilterItems, []);
    selected.set(selectFilterContextMeasureValueFilters, []);
    selected.set(selectAttributeFilterConfigsOverrides, []);

    render(
        <IntlWrapper>
            <CustomUrlEditor
                urlDrillTarget={{ customUrl }}
                attributeDisplayForms={[]}
                invalidAttributeDisplayFormIdentifiers={[]}
                enableClientIdParameter={false}
                enableDataProductIdParameter={false}
                enableWidgetIdParameter={false}
                onClose={() => {}}
                onSelect={() => {}}
                widgetRef={widgetRef}
            />
        </IntlWrapper>,
    );
}

function getEditorContent() {
    return document.querySelector(".cm-content");
}

describe("CustomUrlEditor parameters", () => {
    it("lists the parameters of the widget tab", () => {
        renderEditor({ enableParameters: true, parameters: [topN] });

        expect(screen.getByText("Parameters")).toBeInTheDocument();
        expect(screen.getByText("Top N")).toBeInTheDocument();
    });

    it("inserts the parameter placeholder on click", () => {
        renderEditor({ enableParameters: true, parameters: [topN] });

        fireEvent.click(screen.getByText("Top N"));

        expect(getEditorContent()?.textContent).toBe("{parameter(top_n)}");
    });

    it("shows that the tab has no parameters", () => {
        renderEditor({ enableParameters: true, parameters: [] });

        expect(screen.getByText("Parameters")).toBeInTheDocument();
        expect(screen.getByText("No parameters")).toBeInTheDocument();
    });

    it("hides the section when parameters are disabled", () => {
        renderEditor({ enableParameters: false, parameters: [] });

        expect(screen.queryByText("Parameters")).not.toBeInTheDocument();
    });

    it("highlights a known parameter as valid and an unknown or malformed one as invalid", () => {
        renderEditor({
            enableParameters: true,
            parameters: [topN],
            customUrl: "https://a.com/{parameter(top_n)}/{parameter(gone)}/{parameter}",
        });

        const content = getEditorContent();
        const valid = [...(content?.querySelectorAll(".cm-attribute") ?? [])].map((node) => node.textContent);
        const invalid = [...(content?.querySelectorAll(".cm-invalid") ?? [])].map((node) => node.textContent);

        expect(valid).toEqual(["{parameter(top_n)}"]);
        expect(invalid).toEqual(["{parameter(gone)}", "{parameter}"]);
    });

    it("warns about a parameter that is not on the dashboard", () => {
        renderEditor({
            enableParameters: true,
            parameters: [topN],
            customUrl: "https://a.com/{parameter(top_n)}/{parameter(gone)}",
        });

        expect(screen.getByText('Invalid placeholders: "gone"')).toBeInTheDocument();
    });
});
