// (C) 2022-2024 GoodData Corporation
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const EXPIRED_WORKSPACE_TIME = 7200000; // 2 hours
export const E2E_SDK_WORKSPACE_PREFIX = "E2E_SDK_cypress_test";
export const E2E_SDK_CHILD_WORKSPACE_PREFIX = "E2E_SDK_cypress_test_child";

export const BEAR_FIXTURE_PATHS = {
    goodsales: "GoodSales/3",
};

export const TIGER_FIXTURE_METADATA_EXTENSIONS = {
    goodsales: path.join(__dirname, `fixtures/goodsales/tiger_metadata_extension.json`),
    demo: path.join(__dirname, `fixtures/demo/tiger_metadata_extension.json`),
};

export const TIGER_FIXTURE_CATALOG = {
    goodsales: path.join(
        __dirname,
        `workspace_objects/goodsales/current_reference_workspace_objects_tiger.ts`,
    ),
};

export const TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG = {
    goodsales: path.join(
        __dirname,
        `workspace_objects/goodsales/current_child_reference_workspace_objects_tiger.ts`,
    ),
};

export const BEAR_FIXTURE_CATALOG = {
    goodsales: path.join(
        __dirname,
        `workspace_objects/goodsales/current_reference_workspace_objects_bear.ts`,
    ),
};
