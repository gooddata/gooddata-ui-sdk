// (C) 2019 GoodData Corporation
export enum DemoProjectAuthStatus {
    AUTHORIZING = "AUTHORIZING",
    CHECKING_DEMO_AVAILABILITY = "CHECKING_DEMO_AVAILABILITY",
    ASSIGNING_DEMO_PROJECT_TO_USER = "ASSIGNING_DEMO_PROJECT_TO_USER",
    AUTHORIZED = "AUTHORIZED",
    UNAUTHORIZED = "UNAUTHORIZED",
}

export interface IDemoProjectState {
    authStatus: DemoProjectAuthStatus;
    profileUri?: string | undefined;
    projects?: any[];
    error?: undefined | string;
}
