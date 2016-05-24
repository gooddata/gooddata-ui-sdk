import { difference, map } from 'lodash';

const IDENTIFIER_REGEX = /{\S+}/g;

function getDependencies({ metricDefinition }) {
    return (metricDefinition.expression.match(IDENTIFIER_REGEX) || [])
        .map(s => s.substring(1, s.length - 1));
}

function getIdentifier({ metricDefinition }) {
    return metricDefinition.identifier;
}

function resolvedDependencies(resolved, { dependencies }) {
    const identifiers = map(resolved, 'identifier');

    return difference(dependencies, identifiers).length === 0;
}

function scan(resolved, unresolved) {
    for (let i = 0; i < unresolved.length; i++) {
        const tested = unresolved[i];

        if (resolvedDependencies(resolved, tested)) {
            resolved.push(tested);
            unresolved.splice(i--, 1);
        }
    }
}

function sort(unresolved) {
    const resolved = [];
    let lastLength;

    while (unresolved.length > 0) {
        lastLength = unresolved.length;
        scan(resolved, unresolved);

        if (unresolved.length === lastLength) {
            throw new Error('Metric defintions cannot be sorted due to missing dependencies.');
        }
    }

    return resolved;
}

export function sortDefinitions(definitions) {
    const indexed = definitions.map(definition => ({
        definition,
        identifier: getIdentifier(definition),
        dependencies: getDependencies(definition)
    }));

    return map(sort(indexed), 'definition');
}
