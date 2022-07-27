// (C) 2022 GoodData Corporation
declare namespace JSX {
    interface IntrinsicElements {
        ["gd-insight"]: any;
        ["gd-dashboard"]: any;
    }
}

interface Window {
    __setWebComponentsContext: any;
}
