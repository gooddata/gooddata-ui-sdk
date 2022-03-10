// (C) 2022 GoodData Corporation
import compact from "lodash/compact";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fp/fromPairs";
import isEmpty from "lodash/isEmpty";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import map from "lodash/fp/map";
import repeat from "lodash/repeat";
import toPairs from "lodash/fp/toPairs";
import {
    attributeAlias,
    attributeLocalId,
    bucketItems,
    bucketTotals,
    factoryNotationFor,
    IInsightDefinition,
    insightBuckets,
    insightSetBuckets,
    insightSetFilters,
    insightSetSorts,
    isAttribute,
    measureAlias,
    measureFormat,
    measureLocalId,
    measureTitle,
    modifyAttribute,
    modifyMeasure,
    newBucket,
    newDefForInsight,
    newTotal,
} from "@gooddata/sdk-model";
import { IEmbeddingCodeConfig } from "../interfaces/VisualizationDescriptor";
import { Normalizer } from "@gooddata/sdk-backend-base";

export interface IComponentInfo {
    name: string;
    importType: "default" | "named";
    package: string;
}

function toComponentImport(componentInfo: IComponentInfo): string {
    return componentInfo.importType === "default"
        ? `import ${componentInfo.name} from "${componentInfo.package}";`
        : `import { ${componentInfo.name} } from "${componentInfo.package}";`;
}

const allSdkModelFactories = [
    // ObjRef factories
    "uriRef",
    "idRef",
    "localIdRef",
    // attribute factories
    "newAttribute",
    // measure factories
    "newMeasure",
    "newArithmeticMeasure",
    "newPopMeasure",
    "newPreviousPeriodMeasure",
    // filter factories
    "newAbsoluteDateFilter",
    "newRelativeDateFilter",
    "newNegativeAttributeFilter",
    "newPositiveAttributeFilter",
    "newMeasureValueFilter",
    "newRankingFilter",
    // sort factories
    "newAttributeSort",
    "newAttributeAreaSort",
    "newMeasureSort",
    // total factories
    "newTotal",
];

function detectSdkModelImports(serializedProps: string): string[] {
    const detectedFactories = allSdkModelFactories.filter((factory) => serializedProps.includes(factory));
    detectedFactories.sort();
    return detectedFactories;
}

const TAB_SIZE = 4;
const DEFAULT_HEIGHT = 400;

function indent(str: string, tabs: number): string {
    return str
        .split("\n")
        .map((chunk) => `${repeat(" ", tabs * TAB_SIZE)}${chunk}`)
        .join("\n");
}

/**
 * Creates an insight that has reasonable local ids instead of potentially long illegible ones in the original insight.
 *
 * @privateRemarks
 * Makes use of the {@link @gooddata/sdk-backed-base#Normalizer} to do most of the work, filling back things
 * that the Normalizer removes (like titles, aliases, etc.).
 *
 * @param insight - the insight to "normalize"
 * @returns always a new instance
 */
function normalizeInsight(insight: IInsightDefinition): IInsightDefinition {
    const execution = newDefForInsight("foo", insight);
    const { n2oMap, normalized } = Normalizer.normalize(execution);

    const o2nMap = flow(
        toPairs,
        map(([normalized, original]) => [original, normalized]),
        fromPairs,
    )(n2oMap);

    const processedBuckets = insightBuckets(insight).map((originalBucket) => {
        // put back stuff deleted by the normalizer
        const processedItems = bucketItems(originalBucket).map((originalBucketItem) => {
            if (isAttribute(originalBucketItem)) {
                const normalizedId = o2nMap[attributeLocalId(originalBucketItem)];
                const normalizedBucketItem = normalized.attributes.find(
                    (attr) => attributeLocalId(attr) === normalizedId,
                );
                return modifyAttribute(normalizedBucketItem, (a) =>
                    a.alias(attributeAlias(originalBucketItem)),
                );
            } else {
                const normalizedId = o2nMap[measureLocalId(originalBucketItem)];
                const normalizedBucketItem = normalized.measures.find(
                    (measure) => measureLocalId(measure) === normalizedId,
                );
                return modifyMeasure(normalizedBucketItem, (m) =>
                    m
                        .alias(measureAlias(originalBucketItem))
                        .format(measureFormat(originalBucketItem))
                        .title(measureTitle(originalBucketItem)),
                );
            }
        });

        const processedTotals = bucketTotals(originalBucket).map((originalTotal) => {
            const { attributeIdentifier, measureIdentifier, type, alias } = originalTotal;
            return newTotal(type, o2nMap[measureIdentifier], o2nMap[attributeIdentifier], alias);
        });

        return newBucket(originalBucket.localIdentifier, ...processedItems, ...processedTotals);
    });

    // TODO properties

    return flow(
        (i) => insightSetBuckets(i, processedBuckets),
        (i) => insightSetFilters(i, normalized.filters),
        (i) => insightSetSorts(i, normalized.sortBy),
    )(insight);
}

export function getReactEmbeddingCodeGenerator(
    componentInfo: IComponentInfo,
    insightToProps: (insight: IInsightDefinition) => Record<string, any>,
): (insight: IInsightDefinition, config?: IEmbeddingCodeConfig) => string {
    return (insight, config) => {
        const normalizedInsight = normalizeInsight(insight);
        const props = insightToProps(normalizedInsight);
        const propPairs = toPairs(props)
            // we ignore functions as there is no bullet-proof way to serialize them
            .filter(([_, value]) => !isFunction(value))
            .filter(([_, value]) => !isEmpty(value));

        const propDeclarations = propPairs
            .map(([key, value]) =>
                isString(value)
                    ? `const ${key} = "${value}";`
                    : `const ${key} = ${factoryNotationFor(value)};`,
            )
            .join("\n");

        const serializedProps = propPairs.map(([key]) => `${key}={${key}}`).join("\n");

        const detectedFactories = detectSdkModelImports(propDeclarations);
        const factoriesImport = detectedFactories.length
            ? `import { ${detectedFactories.join(", ")} } from "@gooddata/sdk-model";`
            : "";

        const imports = compact([
            'import React from "react";',
            factoriesImport,
            toComponentImport(componentInfo),
        ]);

        const height = config?.height ?? DEFAULT_HEIGHT;
        const stringifiedHeight = isString(height) ? `"${height}"` : height.toString();

        const componentBody = `<${componentInfo.name}\n${indent(serializedProps, 1)}\n/>`;

        return `${imports.join("\n")}

${propDeclarations}
const style = { height: ${stringifiedHeight} };

function MyComponent() {
    return (
        <div style={style}>
${indent(componentBody, 3)}
        </div>
    );
}
`;
    };
}
