// (C) 2026 GoodData Corporation

import type { DetachedWindowAPI } from "happy-dom";

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        happyDOM: DetachedWindowAPI;
    }
}
