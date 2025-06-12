// (C) 2025 GoodData Corporation
import { useState } from "react";
import { v4 as uuid } from "uuid";

/**
 * This is a hook that generates a unique ID for purposes of aria references and so on. Can be replaced with
 * React 18's useId when we drop support for React 17.
 * @internal
 */
export const useId = (): string => {
    const [id] = useState<string>(uuid());
    return id;
};

/**
 * This is a hook that generates a unique ID for purposes of aria references and so on. Can be enhanced with a prefix.
 * @param prefix - The prefix to be added to the generated ID.
 * @internal
 */
export const useIdPrefixed = (prefix?: string): string => {
    const id = useId();
    return prefix ? `${prefix}-${id}` : id;
};
