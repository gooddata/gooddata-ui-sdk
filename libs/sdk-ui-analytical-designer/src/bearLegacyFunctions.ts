// (C) 2020-2026 GoodData Corporation

import { type IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { type IInsight } from "@gooddata/sdk-model";

import { IS_DEBUG } from "./buildParams.js";
import { type IBearBootstrap } from "./typings/bear/bearTypes.js";

export type BearLegacyFunctions = {
    openAsReport?(workspace: string, insight: IInsight): Promise<string>;
    getBootstrapResource?(options: {
        projectId?: string;
        loadAnalyticalDashboards?: boolean;
    }): Promise<IBearBootstrap>;
    sanitizeDrillingActivationPostMessageData?(
        workspace: string,
        postMessageData: IDrillableItemsCommandBody,
    ): Promise<IDrillableItemsCommandBody>;
};

// This makes sure that calls to non-essential legacy functions from incompatible backend instances do not fail.
// Any warning this produces should be taken care of, though, as there is likely some error in the calling logic.
class BearLegacyFunctionsProxy implements BearLegacyFunctions {
    private legacyFunctionImpl: BearLegacyFunctions = {};

    private static getErrorMessage = (name: keyof BearLegacyFunctions): string =>
        `Trying to call the ${name} bear legacy function, but no implementation of it is available. Please make sure you are running on a bear-compatible backend.`;

    private static printMissingImplWarning = (name: keyof BearLegacyFunctions): void => {
        if (IS_DEBUG) {
            console.warn(BearLegacyFunctionsProxy.getErrorMessage(name));
        }
    };

    public getBootstrapResource: BearLegacyFunctions["getBootstrapResource"] = (...params) => {
        if (!this.legacyFunctionImpl.getBootstrapResource) {
            // this is unrecoverable, there is no sensible default to return here
            throw new Error(BearLegacyFunctionsProxy.getErrorMessage("getBootstrapResource"));
        }
        return this.legacyFunctionImpl.getBootstrapResource(...params);
    };

    public openAsReport: BearLegacyFunctions["openAsReport"] = (...params) => {
        if (!this.legacyFunctionImpl.openAsReport) {
            BearLegacyFunctionsProxy.printMissingImplWarning("openAsReport");
            return Promise.resolve("");
        }
        return this.legacyFunctionImpl.openAsReport(...params);
    };

    public sanitizeDrillingActivationPostMessageData: BearLegacyFunctions["sanitizeDrillingActivationPostMessageData"] =
        (workspace, postMessageData) => {
            if (!this.legacyFunctionImpl.sanitizeDrillingActivationPostMessageData) {
                BearLegacyFunctionsProxy.printMissingImplWarning("sanitizeDrillingActivationPostMessageData");
                return Promise.resolve(postMessageData);
            }
            return this.legacyFunctionImpl.sanitizeDrillingActivationPostMessageData(
                workspace,
                postMessageData,
            );
        };
}

export const bearLegacyFunctions = new BearLegacyFunctionsProxy();
