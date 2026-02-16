// (C) 2022-2026 GoodData Corporation

declare namespace JSX {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface IntrinsicElements {
        ["gd-insight"]: any;
        ["gd-dashboard"]: any;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    __setWebComponentsContext: any;
}
