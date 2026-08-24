// (C) 2026 GoodData Corporation

import type { IAsCodeDescriptor, IAsCodeMutationPort } from "./descriptor.js";

/** A descriptor whose `createMutationPort` yields `port` — the test seam for the mutation adapter. */
export function withMutationPort(
    descriptor: IAsCodeDescriptor,
    port: IAsCodeMutationPort,
): IAsCodeDescriptor {
    return { ...descriptor, createMutationPort: () => port };
}
