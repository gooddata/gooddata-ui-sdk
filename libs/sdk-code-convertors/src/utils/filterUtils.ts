// (C) 2023-2026 GoodData Corporation

import type { DateDataset } from "@gooddata/sdk-code-schemas/v1";

import { convertGranularityToId, parseGranularityValue } from "./granularityUtils.js";
import { type ExportEntities, type FromEntities } from "../types.js";

export function parseDateValues(
    entities: FromEntities | ExportEntities,
    label: string,
    values: (string | number | boolean)[],
) {
    const [type, objId] = label.split("/");
    const id = objId || type;
    const [dateDatasetId, gran] = id.split(".");

    const dateDatasetEntity = entities.find((e) => e.type === "date" && e.id === dateDatasetId);
    if (dateDatasetEntity?.data) {
        const dateDataset = dateDatasetEntity.data as DateDataset;
        const exists = dateDataset.granularities
            ?.map((g) => convertGranularityToId(g))
            .find((g) => g === gran);

        if (exists) {
            return convertDateValues(gran, values);
        }
    }
    return values;
}

function convertDateValues(gran: string, values: (string | number | boolean)[]) {
    const granularity = gran as ReturnType<typeof convertGranularityToId>;
    // Filter out null/undefined but preserve empty strings which are valid attribute values
    return values
        .map((v) => parseGranularityValue(granularity, v))
        .filter((v) => v !== null && v !== undefined);
}
