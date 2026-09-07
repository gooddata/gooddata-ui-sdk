// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiAttributeOut, type JsonApiLabelOutWithLinks } from "@gooddata/api-client-tiger";

import { convertAttributeLabels } from "./MetadataConverter.js";

const PRIMARY = "label.f_account.account.name";
const SECONDARY = "label.f_account.account.email";

const label = (id: string): JsonApiLabelOutWithLinks =>
    ({
        id,
        type: "label",
        attributes: { title: id, primary: id === PRIMARY },
    }) as JsonApiLabelOutWithLinks;

const attribute = (labelIds: string[], defaultViewId?: string): JsonApiAttributeOut =>
    ({
        id: "attr.f_account.account",
        type: "attribute",
        relationships: {
            labels: { data: labelIds.map((id) => ({ id, type: "label" })) },
            ...(defaultViewId ? { defaultView: { data: { id: defaultViewId, type: "label" } } } : {}),
        },
    }) as JsonApiAttributeOut;

/** Only labels the caller may view reach `included`, so only those reach the map. */
const labelsMap = (...ids: string[]): Record<string, JsonApiLabelOutWithLinks> =>
    Object.fromEntries(ids.map((id) => [id, label(id)]));

describe("convertAttributeLabels", () => {
    it("marks the defaultView label as default when it is resolvable", () => {
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY], SECONDARY),
            labelsMap(PRIMARY, SECONDARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([
            [PRIMARY, false],
            [SECONDARY, true],
        ]);
    });

    it("falls back to the primary label when no defaultView is set", () => {
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY]),
            labelsMap(PRIMARY, SECONDARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([
            [PRIMARY, true],
            [SECONDARY, false],
        ]);
    });

    it("falls back to the primary label when the defaultView is withheld by object permissions", () => {
        // The withheld label keeps its `relationships` linkage but is absent from `included`, so it
        // never reaches the map. Without resolving the reference the defaultView branch would be
        // taken and no label would end up marked default at all (F1-2602).
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY], SECONDARY),
            labelsMap(PRIMARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([[PRIMARY, true]]);
    });

    it("omits labels withheld by object permissions", () => {
        const displayForms = convertAttributeLabels(attribute([PRIMARY, SECONDARY]), labelsMap(PRIMARY));

        expect(displayForms.map((df) => df.id)).toEqual([PRIMARY]);
    });
});
