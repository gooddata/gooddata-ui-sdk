// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    getAbsoluteShellAppOrgSettingHref,
    getAbsoluteShellAppWorkspaceSettingHref,
    getShellAppOrgSettingHref,
    getShellAppWorkspaceSettingHref,
} from "../../utils.js";
import { useConfig } from "../ConfigContext.js";

const GEN_AI_SECTION = "ai";
const CREATE_LLM_PROVIDER_ACTION = "create-llm-provider";
const CHANGE_LLM_MODEL_ACTION = "change-llm-model";

export function useSettingsClick() {
    const workspaceId = useWorkspaceStrict();
    const { linkHandler, allowNativeLinks } = useConfig();

    return useCallback(
        (type: "change-model" | "create") => (e: MouseEvent) => {
            switch (type) {
                case "change-model":
                    if (allowNativeLinks) {
                        window.location.href = getAbsoluteShellAppWorkspaceSettingHref(
                            workspaceId,
                            GEN_AI_SECTION,
                            CHANGE_LLM_MODEL_ACTION,
                        );
                    } else {
                        linkHandler?.({
                            id: CHANGE_LLM_MODEL_ACTION,
                            workspaceId,
                            type: "setting",
                            action: "open",
                            newTab: e.metaKey,
                            section: GEN_AI_SECTION,
                            preventDefault: e.preventDefault.bind(e),
                            itemUrl: getShellAppWorkspaceSettingHref(
                                workspaceId,
                                GEN_AI_SECTION,
                                CHANGE_LLM_MODEL_ACTION,
                            ),
                        });
                        e.stopPropagation();
                    }
                    break;
                case "create":
                    if (allowNativeLinks) {
                        window.location.href = getAbsoluteShellAppOrgSettingHref(
                            GEN_AI_SECTION,
                            CREATE_LLM_PROVIDER_ACTION,
                        );
                    } else {
                        linkHandler?.({
                            id: CREATE_LLM_PROVIDER_ACTION,
                            workspaceId,
                            action: "open",
                            type: "setting",
                            newTab: e.metaKey,
                            section: GEN_AI_SECTION,
                            preventDefault: e.preventDefault.bind(e),
                            itemUrl: getShellAppOrgSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION),
                        });
                        e.stopPropagation();
                    }
                    break;
            }
        },
        [allowNativeLinks, linkHandler, workspaceId],
    );
}
