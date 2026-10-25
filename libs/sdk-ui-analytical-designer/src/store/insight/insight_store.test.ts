// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsightLayerDefinition } from "@gooddata/sdk-model";

import { openReportStarted } from "../../actions/open_actions.js";
import { reportDescriptionChange, reportTitleChange } from "../../actions/report_actions.js";
import { saveReportFinished } from "../../actions/save_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { buildInitialState } from "../../reducers/initial_state.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import {
    type IObjectMeta,
    type IVisualizationObject,
    type IVisualizationObjectContent,
} from "../../typings/bear/bearTypes.js";
import { type ILoadedReportItems } from "../../typings/report.js";
import { buildOpenReportFinished } from "../../utils/open_report_actions.js";
import { type IAppState } from "../types.js";

import {
    getInsightLayers,
    getInsightLayersOwner,
    getInsightSummary,
    getInsightTags,
    getInsightTitle,
} from "./insight_selectors.js";

describe("insight store", () => {
    const state = getInitializedState();

    const minimalLoadedItems: ILoadedReportItems = {
        itemCache: {},
        filterItems: {},
        allDateDatasets: { available: [], unavailable: 0 },
        availableDateDatasets: { available: [], unavailable: 0 },
        parameterFilters: [],
        parameterWarnings: [],
    };

    const buildInsight = ({ tags, summary }: { tags?: string[]; summary?: string } = {}) => {
        const insight = newInsight("local:table", "insight-id", "/gdc/md/vo1", (i) => i.title("my title"));
        if (tags !== undefined) {
            insight.insight.tags = tags;
        }
        if (summary !== undefined) {
            insight.insight.summary = summary;
        }
        return insight;
    };

    const buildOpenFinished = (isDraft = false, layers?: IInsightLayerDefinition[]) => {
        const insight = buildInsight({ tags: ["t1"], summary: "sum" });
        if (layers !== undefined) {
            insight.insight.layers = layers;
        }
        // the FULL operation result: driving the combined root means every owning slice
        // consumes the payload, so a stubbed result is not enough
        return buildOpenReportFinished(state, insight, minimalLoadedItems, 123, false, isDraft);
    };

    const buildSaveFinished = ({
        saveAsNew = false,
        meta = {},
        content = null,
    }: {
        saveAsNew?: boolean;
        meta?: Partial<IObjectMeta>;
        content?: Partial<IVisualizationObjectContent>;
    } = {}) =>
        saveReportFinished(
            { visualizationObject: { meta, content } as IVisualizationObject },
            saveAsNew,
            123,
        );

    describe("OPEN_REPORT_STARTED", () => {
        it("clears title, tags and summary but leaves the layers alone", () => {
            const dirty = withData(
                withData(
                    withData(withData(withData(state, { title: "previous" }), { tags: ["a"] }), {
                        summary: "previous summary",
                    }),
                    { layers: [{ id: "layer", type: "insight", buckets: [] }] },
                ),
                { layersOwner: "owner" },
            ) as unknown as IAppState;

            const result = combinedRootReducer(dirty, openReportStarted("project", "report"));

            expect(getInsightTitle(result)).toEqual("");
            expect(getInsightTags(result)).toEqual([]);
            expect(getInsightSummary(result)).toEqual("");
            expect(getInsightLayers(result)).toEqual([{ id: "layer", type: "insight", buckets: [] }]);
            expect(getInsightLayersOwner(result)).toEqual("owner");
        });
    });

    describe("OPEN_REPORT_FINISHED", () => {
        it("stores the opened insight's meta and layer identity", () => {
            const result = combinedRootReducer(
                state,
                buildOpenFinished(false, [{ id: "layer-1", type: "insight", buckets: [] }]),
            );

            expect(getInsightTitle(result)).toEqual("my title");
            expect(getInsightTags(result)).toEqual(["t1"]);
            expect(getInsightSummary(result)).toEqual("sum");
            expect(getInsightLayers(result)).toEqual([{ id: "layer-1", type: "insight", buckets: [] }]);
            expect(getInsightLayersOwner(result)).toEqual("insight-id");
        });

        it("keeps a draft's meta out of the state but still records the layer identity", () => {
            const result = combinedRootReducer(
                state,
                buildOpenFinished(true, [{ id: "layer-1", type: "insight", buckets: [] }]),
            );

            expect(getInsightTitle(result)).toEqual("");
            expect(getInsightTags(result)).toEqual([]);
            expect(getInsightSummary(result)).toEqual("");
            expect(getInsightLayers(result)).toEqual([{ id: "layer-1", type: "insight", buckets: [] }]);
            expect(getInsightLayersOwner(result)).toEqual("insight-id");
        });

        it("stores plain arrays for tags and layers", () => {
            const result = combinedRootReducer(
                state,
                buildOpenFinished(false, [{ id: "layer-1", type: "insight", buckets: [] }]),
            );

            expect(Array.isArray(result.data.tags)).toBe(true);
            expect(Array.isArray(result.data.layers)).toBe(true);
        });
    });

    describe("SAVE_REPORT_FINISHED", () => {
        it("updates tags, summary and layers owner but never the title", () => {
            const titled = combinedRootReducer(state, reportTitleChange("typed title"));

            const result = combinedRootReducer(
                titled,
                buildSaveFinished({ meta: { tags: ["t2"], summary: "saved sum", identifier: "id-2" } }),
            );

            expect(getInsightTitle(result)).toEqual("typed title");
            expect(getInsightTags(result)).toEqual(["t2"]);
            expect(getInsightSummary(result)).toEqual("saved sum");
            expect(getInsightLayersOwner(result)).toEqual("id-2");
        });

        it("defaults absent meta to the empty values", () => {
            const dirty = withData(withData(withData(state, { tags: ["a"] }), { summary: "s" }), {
                layersOwner: "owner",
            }) as unknown as IAppState;

            const result = combinedRootReducer(dirty, buildSaveFinished());

            expect(getInsightTags(result)).toEqual([]);
            expect(getInsightSummary(result)).toEqual("");
            expect(getInsightLayersOwner(result)).toEqual(null);
        });

        it("adopts the saved layers only for save-as-new", () => {
            const withLayers = withData(state, {
                layers: [{ id: "existing", type: "insight", buckets: [] }],
            }) as unknown as IAppState;

            const plainSave = combinedRootReducer(
                withLayers,
                buildSaveFinished({
                    content: { visualizationClass: { uri: "/gdc/md/p/obj/vc" }, buckets: [], layers: [] },
                }),
            );
            expect(getInsightLayers(plainSave)).toEqual([{ id: "existing", type: "insight", buckets: [] }]);

            const saveAsNew = combinedRootReducer(
                withLayers,
                buildSaveFinished({
                    saveAsNew: true,
                    content: { layers: [{ id: "saved", type: "insight", buckets: [] }] },
                }),
            );
            expect(getInsightLayers(saveAsNew)).toEqual([{ id: "saved", type: "insight", buckets: [] }]);

            const saveAsNewWithoutLayers = combinedRootReducer(
                withLayers,
                buildSaveFinished({ saveAsNew: true }),
            );
            expect(getInsightLayers(saveAsNewWithoutLayers)).toEqual([]);
        });
    });

    describe("user edits", () => {
        it("REPORT_TITLE_CHANGE writes the title", () => {
            const result = combinedRootReducer(state, reportTitleChange("My report title"));

            expect(getInsightTitle(result)).toEqual("My report title");
        });

        it("REPORT_DESCRIPTION_CHANGE writes the summary", () => {
            const result = combinedRootReducer(state, reportDescriptionChange("My description"));

            expect(getInsightSummary(result)).toEqual("My description");
        });
    });

    describe("identity — a repeated identical write must not dirty the root", () => {
        it("re-reporting an identical title returns the same root", () => {
            const titled = combinedRootReducer(state, reportTitleChange("same"));

            expect(combinedRootReducer(titled, reportTitleChange("same"))).toBe(titled);
        });

        it("re-reporting an identical description returns the same root", () => {
            const described = combinedRootReducer(state, reportDescriptionChange("same"));

            expect(combinedRootReducer(described, reportDescriptionChange("same"))).toBe(described);
        });

        it("an unrelated action returns the same root", () => {
            expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
        });
    });

    describe("accessors normalize the collection kind (the #11767 gate)", () => {
        it("serve the plain initial values on the pristine state where the leaves are absent", () => {
            // RESET_FOR_PLUGGABLE_MOUNT returns the pristine build, where these leaves are
            // slice-owned — only the accessor fallbacks answer there
            const pristine = buildInitialState() as unknown as IAppState;

            expect(getInsightTitle(pristine)).toEqual("");
            expect(getInsightTags(pristine)).toEqual([]);
            expect(getInsightSummary(pristine)).toEqual("");
            expect(getInsightLayers(pristine)).toEqual([]);
            expect(getInsightLayersOwner(pristine)).toEqual(null);
        });

        it("reads a hand-built plain fixture through the accessors", () => {
            const seeded = {
                appState: {},
                data: { tags: ["a", "b"], layers: [{ id: "layer", type: "insight", buckets: [] }] },
                report: {},
            } as unknown as IAppState;

            expect(getInsightTags(seeded)).toEqual(["a", "b"]);
            expect(Array.isArray(getInsightLayers(seeded))).toBe(true);
            expect(getInsightLayers(seeded)).toHaveLength(1);
        });

        it("fall back to the empty array for a wrong-kind value instead of leaking it", () => {
            // the #11767 shape: a keyed container standing in for an indexed list survives the
            // type cast and `?? []`, and throws on the first spread — the accessor kind-checks
            const wrongKind = withData(buildInitialState(), {
                tags: {
                    not: "a list",
                } as unknown as string[],
            }) as unknown as IAppState;

            expect(getInsightTags(wrongKind)).toEqual([]);
            expect([...getInsightTags(wrongKind)]).toEqual([]);
        });
    });
});
