// (C) 2026 GoodData Corporation

/**
 * Marker carried by every {@link ScenarioAction}; holds the label of the action.
 */
export interface IScenarioActionMarker {
    /**
     * Label under which the action should be reported by the consumer that resolves it.
     */
    readonly scenarioActionLabel: string;
}

/**
 * Storybook-free placeholder for an event handler used in scenario props.
 *
 * @remarks
 * It is a no-op callback, so it can be safely used wherever a real handler is expected; on top of that it
 * carries the label of the action. See {@link scenarioAction}.
 */
export type ScenarioAction = (() => void) & IScenarioActionMarker;

/**
 * Creates a placeholder for an event handler that only carries the label of the action.
 *
 * @remarks
 * Scenario definitions must not depend on storybook. Instead of storybook's `action(label)`, they use this
 * function; consumers that render the scenarios into storybook stories detect these placeholders with
 * {@link isScenarioAction} and swap them for real `action(label)` handlers. Anywhere else the placeholder
 * behaves as a handler that does nothing.
 *
 * @param label - label of the action
 */
export function scenarioAction(label: string): ScenarioAction {
    const handler = (): void => undefined;

    return Object.assign(handler, { scenarioActionLabel: label });
}

/**
 * Tests whether the provided value is a {@link ScenarioAction} placeholder.
 *
 * @param value - value to test
 */
export function isScenarioAction(value: unknown): value is ScenarioAction {
    return (
        typeof value === "function" &&
        "scenarioActionLabel" in value &&
        typeof value.scenarioActionLabel === "string"
    );
}
