// (C) 2026 GoodData Corporation

import { findAllObjects } from "./findObjects.js";
import { type LdmObjects, isITigerParameter } from "./metadata/model.js";
import { isRenderableDefinition, parameterMaqlLiteral } from "./metadata/parameters.js";
import { MaqlMetric } from "./parseMaql.js";

/**
 * A MAQL template rendered with its parameters' defaults. `unresolved` lists the ids of references
 * that could not be turned into a literal; those are left untouched in `maql`.
 *
 * @internal
 */
export interface IRenderedMaql {
    maql: string;
    unresolved: string[];
}

/**
 * Replaces every `{parameter/id}` reference in `maql` with its default value, so the template can be
 * previewed as the MAQL that would actually execute. String defaults are rendered as quoted literals
 * and numeric ones bare. Unresolvable references are reported and left in place rather than guessed.
 *
 * Returns undefined when the template references no parameter at all.
 *
 * @internal
 */
export function renderParameterDefaults(maql: string, ldmObjects: LdmObjects): IRenderedMaql | undefined {
    const parameters = findAllObjects(new MaqlMetric(maql)).filter(
        (object) => object.tigerType === "parameter",
    );

    if (parameters.length === 0) {
        return undefined;
    }

    const unresolved: string[] = [];
    let rendered = "";
    let cursor = 0;

    for (const parameter of parameters) {
        const found = ldmObjects.findObject(parameter);
        if (!found || !isITigerParameter(found) || !isRenderableDefinition(found.definition)) {
            unresolved.push(parameter.id);
            continue;
        }

        rendered += maql.slice(cursor, parameter.offsets.start) + parameterMaqlLiteral(found.definition);
        cursor = parameter.offsets.end;
    }

    return { maql: rendered + maql.slice(cursor), unresolved };
}

/**
 * A parameter resolved to its default value. `value` is absent when the default cannot be
 * determined; `title` is absent when the parameter is unknown.
 *
 * @internal
 */
export interface IResolvedParameter {
    id: string;
    title?: string;
    value?: string | number;
}

/**
 * Resolves every parameter the given MAQL templates and metrics depend on to its default value,
 * following `{metric/id}` references into metric expressions. Each parameter is reported once, in
 * order of first appearance.
 *
 * @internal
 */
export function resolveParameterValues(
    maqls: string[],
    metricIds: string[],
    ldmObjects: LdmObjects,
): IResolvedParameter[] {
    const parameters = new Map<string, IResolvedParameter>();
    const visitedMetrics = new Set<string>();

    const visitTemplate = (template: string): void => {
        for (const object of findAllObjects(new MaqlMetric(template))) {
            if (object.tigerType === "parameter" && !parameters.has(object.id)) {
                parameters.set(object.id, resolveParameter(object.id, ldmObjects));
            }
            if (object.tigerType === "metric") {
                visitMetric(object.id);
            }
        }
    };
    const visitMetric = (metricId: string): void => {
        if (visitedMetrics.has(metricId)) {
            return;
        }
        visitedMetrics.add(metricId);
        const expression = ldmObjects.findById("metric", metricId)?.expression;
        if (expression) {
            visitTemplate(expression);
        }
    };

    maqls.forEach(visitTemplate);
    metricIds.forEach(visitMetric);

    return [...parameters.values()];
}

function resolveParameter(id: string, ldmObjects: LdmObjects): IResolvedParameter {
    const found = ldmObjects.findById("parameter", id);
    if (!found) {
        return { id };
    }
    return isRenderableDefinition(found.definition)
        ? { id, title: found.title, value: found.definition.defaultValue }
        : { id, title: found.title };
}
