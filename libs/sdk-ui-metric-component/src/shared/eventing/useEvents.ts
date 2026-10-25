// (C) 2021-2026 GoodData Corporation

import { useCallback, useContext, useMemo } from "react";

import { EventContext, type IEvent } from "./EventContext.js";

/**
 * @internal
 */
export interface IEventsInterface {
    [type: string]: (...args: never[]) => IEvent | null;
}

/**
 * @internal
 */
export type IEventsCallback<Type extends IEventsInterface> = {
    [Property in keyof Type]: (...args: Parameters<Type[Property]>) => void;
};

/**
 * @internal
 */
export function useEvents<EventsInterface extends IEventsInterface>(
    value: EventsInterface,
): IEventsCallback<EventsInterface> {
    const { emit } = useContext(EventContext);

    const emitEvent = useCallback(
        <U extends (...args: never[]) => IEvent | null>(func: U) =>
            (...args: Parameters<U>): void => {
                const event = func(...args);
                if (emit && event) {
                    emit(event);
                }
            },
        [emit],
    );

    return useMemo(
        () =>
            Object.keys(value).reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: emitEvent(value[key]),
                }),
                {} as IEventsCallback<EventsInterface>,
            ),
        [emitEvent, value],
    );
}
