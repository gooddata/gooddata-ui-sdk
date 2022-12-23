// (C) 2022 GoodData Corporation

// Keep in sync with test_new/reference_workspace/constant.js
import * as BearMDObjects from "../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import * as TigerMDObjects from "../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import * as TigerChildMDObjects from "../../reference_workspace/workspace_objects/goodsales/current_child_reference_workspace_objects_tiger";

import { getBackend } from "./constants";

export const MDObjects = getBackend() === "TIGER" ? TigerMDObjects : BearMDObjects;
export const ChildMDObjects = TigerChildMDObjects;
