// (C) 2019 GoodData Corporation
import { IMeasure, isMeasureDefinition } from "@gooddata/sdk-model";

export type UriOrIdentifier = {
    uri?: string;
    identifier?: string;
};

export function measureUriOrQualifier(measure?: IMeasure): UriOrIdentifier {
    if (!measure) {
        return {
            uri: undefined,
            identifier: undefined,
        };
    }

    return isMeasureDefinition(measure.measure.definition)
        ? measure.measure.definition.measureDefinition.item
        : {};
}
