// (C) 2007-2022 GoodData Corporation
import difference from "lodash/difference.js";
import map from "lodash/map.js";

const IDENTIFIER_REGEX = /\{\S+\}/g;

export interface IMetric {
    metricDefinition: {
        expression: string;
        identifier: string;
    };
}

function getDependencies({ metricDefinition }: IMetric): string[] {
    return (metricDefinition.expression.match(IDENTIFIER_REGEX) || []).map((s: string) =>
        s.substring(1, s.length - 1),
    );
}

function getIdentifier({ metricDefinition }: IMetric) {
    return metricDefinition.identifier;
}

function resolvedDependencies(resolved: any[], { dependencies }: any) {
    const identifiers = map(resolved, "identifier");

    return difference(dependencies, identifiers).length === 0;
}

function scan(resolved: any[], unresolved: any[]) {
    for (let i = 0; i < unresolved.length; i += 1) {
        const tested = unresolved[i];

        if (resolvedDependencies(resolved, tested)) {
            resolved.push(tested);
            unresolved.splice(i, 1);
            i -= 1;
        }
    }
}

function sort(unresolved: any[]) {
    const resolved: any[] = [];
    let lastLength;

    while (unresolved.length > 0) {
        lastLength = unresolved.length;
        scan(resolved, unresolved);

        if (unresolved.length === lastLength) {
            throw new Error("Metric defintions cannot be sorted due to missing dependencies.");
        }
    }

    return resolved;
}

export function sortDefinitions(definitions: any[]): any[] {
    const indexed = definitions.map((definition: any) => ({
        definition,
        identifier: getIdentifier(definition),
        dependencies: getDependencies(definition),
    }));

    return map(sort(indexed), "definition");
}
