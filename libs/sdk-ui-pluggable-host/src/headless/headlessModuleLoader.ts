// (C) 2026 GoodData Corporation

import { type HeadlessModuleRegistryItem, isRemoteHeadlessModuleRegistryItem } from "@gooddata/sdk-model";
import { type IHeadlessModule } from "@gooddata/sdk-pluggable-application-model";

import { loadRemoteHeadlessModule } from "../loader/remoteLoader.js";

import { loadLocalHeadlessModule } from "./localHeadlessLoader.js";

export function loadHeadlessModule(item: HeadlessModuleRegistryItem): Promise<IHeadlessModule> {
    if (isRemoteHeadlessModuleRegistryItem(item)) {
        return loadRemoteHeadlessModule(item.remote);
    }
    return loadLocalHeadlessModule(item.id);
}
