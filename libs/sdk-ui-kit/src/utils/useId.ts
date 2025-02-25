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
