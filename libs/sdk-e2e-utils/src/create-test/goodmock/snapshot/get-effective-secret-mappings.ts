// (C) 2026 GoodData Corporation

import { type ISecretMapping } from "../types.js";

export const getEffectiveSecretMappings = (secretMappings: ISecretMapping[] | undefined): ISecretMapping[] =>
    (secretMappings ?? []).filter(({ secret, placeholder }) => secret && secret !== placeholder);
