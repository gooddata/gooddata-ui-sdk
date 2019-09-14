// (C) 2019 GoodData Corporation
import { SDK } from "@gooddata/gd-bear-client";

/**
 * This provider defines function which when called returns a promise of an instance of SDK which is
 * already authenticated with the backend.
 */
export type AuthenticatedSdkProvider = () => Promise<SDK>;
