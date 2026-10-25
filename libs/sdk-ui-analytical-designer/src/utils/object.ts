// (C) 2007-2026 GoodData Corporation

import { omitBy } from "lodash-es";
export const typedObject = <K extends string, T>(type: K, obj: T) => ({ [type]: obj }) as Record<K, T>;

export const omitNil = <T extends object>(obj: T): Partial<T> =>
    omitBy(obj, (value) => value === null || value === undefined) as Partial<T>;
