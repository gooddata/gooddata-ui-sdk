// (C) 2026 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import { type ISettings } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    getAbsoluteSettingHref,
    getAbsoluteShellAppOrgSettingHref,
    getAbsoluteShellAppWorkspaceSettingHref,
    getAbsoluteWorkspaceSettingHref,
    getSettingHref,
    getShellAppOrgSettingHref,
    getShellAppWorkspaceSettingHref,
    getWorkspaceSettingHref,
} from "../../utils.js";
import { useConfig } from "../ConfigContext.js";

const GEN_AI_SECTION = "ai";
const CREATE_LLM_PROVIDER_ACTION = "create-llm-provider";
const CHANGE_LLM_MODEL_ACTION = "change-llm-model";

export function useSettingsClick(settings: ISettings | undefined) {
    const workspaceId = useWorkspaceStrict();
    const { linkHandler, allowNativeLinks } = useConfig();

    // When the shell host is enabled, the standalone home-ui at `/settings` or
    // `/workspaces/{id}/settings` is bounced to the host base path, dropping the
    // workspaceId and hash. Switch to host-shaped URLs so the deep-link
    // (e.g. `#/ai/change-llm-model`) reaches the settings page intact.
    const useShellAppUrls = Boolean(settings?.enableShellApplication);
    return useCallback(
        (type: "change-model" | "create") => (e: MouseEvent) => {
            switch (type) {
                case "change-model":
                    if (allowNativeLinks) {
                        window.location.href = useShellAppUrls
                            ? getAbsoluteShellAppWorkspaceSettingHref(
                                  workspaceId,
                                  GEN_AI_SECTION,
                                  CHANGE_LLM_MODEL_ACTION,
                              )
                            : getAbsoluteWorkspaceSettingHref(
                                  workspaceId,
                                  GEN_AI_SECTION,
                                  CHANGE_LLM_MODEL_ACTION,
                              );
                    } else {
                        linkHandler?.({
                            id: CHANGE_LLM_MODEL_ACTION,
                            workspaceId,
                            type: "setting",
                            newTab: e.metaKey,
                            section: GEN_AI_SECTION,
                            preventDefault: e.preventDefault.bind(e),
                            itemUrl: useShellAppUrls
                                ? getShellAppWorkspaceSettingHref(
                                      workspaceId,
                                      GEN_AI_SECTION,
                                      CHANGE_LLM_MODEL_ACTION,
                                  )
                                : getWorkspaceSettingHref(
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
                        window.location.href = useShellAppUrls
                            ? getAbsoluteShellAppOrgSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION)
                            : getAbsoluteSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION);
                    } else {
                        linkHandler?.({
                            id: CREATE_LLM_PROVIDER_ACTION,
                            workspaceId,
                            type: "setting",
                            newTab: e.metaKey,
                            section: GEN_AI_SECTION,
                            preventDefault: e.preventDefault.bind(e),
                            itemUrl: useShellAppUrls
                                ? getShellAppOrgSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION)
                                : getSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION),
                        });
                        e.stopPropagation();
                    }
                    break;
            }
        },
        [allowNativeLinks, linkHandler, workspaceId, useShellAppUrls],
    );
}
