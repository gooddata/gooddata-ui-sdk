// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type JsonApiAutomationOutList,
    type JsonApiAutomationOutWithLinks,
    type RestrictedObject,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import { convertAutomationListToAutomations } from "./AutomationConverter.js";
import { resolveAutomationUnavailableReferences } from "./AutomationRestrictedReferencesConverter.js";

const automation = (id: string, relationships: object) =>
    ({ id, type: "automation", relationships }) as JsonApiAutomationOutWithLinks;

const scheduleOnVisX = automation("schedule", {
    exportDefinitions: { data: [{ id: "ed1", type: "exportDefinition" }] },
    visualizationObjects: { data: [{ id: "vis-X", type: "visualizationObject" }] },
});

const alertOnVisY = automation("alert", {
    visualizationObjects: { data: [{ id: "vis-Y", type: "visualizationObject" }] },
});

const visX: RestrictedObject = { id: "vis-X", type: "visualizationObject" };
const unavailableVisX = { ref: idRef("vis-X", "insight"), type: "insight", reason: "forbidden" };

describe("resolveAutomationUnavailableReferences", () => {
    it("returns undefined when no object-level permissions apply", () => {
        expect(resolveAutomationUnavailableReferences(scheduleOnVisX, undefined)).toBeUndefined();
    });

    it("returns an empty list when nothing is restricted", () => {
        expect(resolveAutomationUnavailableReferences(scheduleOnVisX, [])).toEqual([]);
    });

    it("reports a restricted object the automation is related to", () => {
        expect(resolveAutomationUnavailableReferences(scheduleOnVisX, [visX])).toEqual([unavailableVisX]);
    });

    it("ignores a restricted object the automation is not related to", () => {
        expect(resolveAutomationUnavailableReferences(alertOnVisY, [visX])).toEqual([]);
    });

    it.each([
        ["metrics", "metric", "measure"],
        ["attributes", "attribute", "attribute"],
        ["labels", "label", "displayForm"],
        ["facts", "fact", "fact"],
        ["computedAttributes", "computedAttribute", "computedAttribute"],
    ] as const)("reports a restricted object related under %s", (relationship, tigerType, type) => {
        const alertOnObject = automation("alert", {
            [relationship]: { data: [{ id: "obj", type: tigerType }] },
        });

        expect(
            resolveAutomationUnavailableReferences(alertOnObject, [{ id: "obj", type: tigerType }]),
        ).toEqual([{ ref: idRef("obj", type), type, reason: "forbidden" }]);
    });

    it("matches the type as well as the id", () => {
        const metricWithSameId: RestrictedObject = { id: "vis-X", type: "metric" };

        expect(resolveAutomationUnavailableReferences(scheduleOnVisX, [metricWithSameId])).toEqual([]);
    });
});

describe("convertAutomationListToAutomations — restricted references", () => {
    it("classifies the document-level restrictions per automation", () => {
        const list = {
            data: [scheduleOnVisX, alertOnVisY],
            included: [],
            meta: { restricted: [visX] },
        } as unknown as JsonApiAutomationOutList;

        const [schedule, alert] = convertAutomationListToAutomations(list);

        expect(schedule.unavailable).toEqual([unavailableVisX]);
        expect(alert.unavailable).toEqual([]);
    });

    it("leaves unavailable unset when no object-level permissions apply", () => {
        const list = { data: [scheduleOnVisX], included: [] } as unknown as JsonApiAutomationOutList;

        const [schedule] = convertAutomationListToAutomations(list);

        expect(schedule).not.toHaveProperty("unavailable");
    });
});
