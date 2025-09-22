// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import { IAnalyticalWorkspace, IOrganization } from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useBackend, useOrganization, useWorkspace } from "@gooddata/sdk-ui";

import { AutomationsScope, IAutomationService, IAutomationsQueryParams } from "./types.js";

export const useAutomationService = (scope: AutomationsScope): IAutomationService => {
    const backend = useBackend();
    const workspace = useWorkspace();
    const organization = useOrganization();

    const service = useMemo(() => {
        if (scope === "organization") {
            invariant(organization, "organization is required when scope is 'organization'");
            return backend.organization(organization);
        } else {
            invariant(workspace, "workspace is required when scope is 'workspace'");
            return backend.workspace(workspace);
        }
    }, [backend, scope, workspace, organization]);

    return useMemo(
        () => ({
            //fetch data
            promiseGetAutomationsQuery: (params?: IAutomationsQueryParams) => {
                if (scope === "organization") {
                    return (service as IOrganization)
                        .automations()
                        .getAutomationsQuery({
                            includeAutomationResult: params?.includeAutomationResult,
                        })
                        .withSize(params?.pageSize)
                        .withPage(params?.page)
                        .withFilter({
                            title: params?.search,
                        })
                        .withWorkspace(
                            params?.workspacesFilterQuery?.value,
                            params?.workspacesFilterQuery?.type,
                        )
                        .withRecipient(
                            params?.recipientsFilterQuery?.value,
                            params?.recipientsFilterQuery?.type,
                        )
                        .withAuthor(params?.createdByFilterQuery?.value, params?.createdByFilterQuery?.type)
                        .withStatus(params?.statusFilterQuery?.value, params?.statusFilterQuery?.type)
                        .withSorting([`${params.sortBy},${params.sortDirection}`])
                        .withType(params?.type)
                        .query();
                } else {
                    return (service as IAnalyticalWorkspace)
                        .automations()
                        .getAutomationsQuery({
                            includeAutomationResult: params?.includeAutomationResult,
                        })
                        .withSize(params?.pageSize)
                        .withPage(params?.page)
                        .withFilter({
                            title: params?.search,
                        })
                        .withDashboard(
                            params?.dashboardFilterQuery?.value,
                            params?.dashboardFilterQuery?.type,
                        )
                        .withRecipient(
                            params?.recipientsFilterQuery?.value,
                            params?.recipientsFilterQuery?.type,
                        )
                        .withAuthor(params?.createdByFilterQuery?.value, params?.createdByFilterQuery?.type)
                        .withStatus(params?.statusFilterQuery?.value, params?.statusFilterQuery?.type)
                        .withSorting([`${params.sortBy},${params.sortDirection}`])
                        .withType(params?.type)
                        .query();
                }
            },

            //fetch permissions
            promiseGetCurrentUser: () => {
                return backend.currentUser().getUserWithDetails();
            },
            promiseCanManageWorkspace: () => {
                if (scope === "organization") {
                    return Promise.resolve(undefined);
                }
                return (service as IAnalyticalWorkspace).permissions().getPermissionsForCurrentUser();
            },

            //fetch filter options
            promiseGetUsers: () => {
                if (scope === "organization") {
                    return (service as IOrganization).users().getUsers();
                } else {
                    return (service as IAnalyticalWorkspace).users().queryAll();
                }
            },
            promiseGetDashboards: () => {
                if (scope === "organization") {
                    return Promise.resolve([]);
                } else {
                    return (service as IAnalyticalWorkspace).dashboards().getDashboards();
                }
            },
            promiseGetWorkspaces: () => {
                if (scope === "organization") {
                    return backend.workspaces().forCurrentUser().queryAllDescriptors();
                } else {
                    return Promise.resolve([]);
                }
            },

            //actions
            promiseDeleteAutomation: (automation: IAutomationMetadataObject) => {
                if (scope === "organization") {
                    return service.automations().deleteAutomation(automation.id, automation.workspace?.id);
                }
                return (service as IAnalyticalWorkspace).automations().deleteAutomation(automation.id);
            },
            promiseDeleteAutomations: (automations: Array<IAutomationMetadataObject>) => {
                if (scope === "organization") {
                    return (service as IOrganization).automations().deleteAutomations(
                        automations.map((automation) => ({
                            id: automation.id,
                            workspaceId: automation.workspace?.id,
                        })),
                    );
                }
                return (service as IAnalyticalWorkspace)
                    .automations()
                    .deleteAutomations(automations.map((automation) => automation.id));
            },
            promiseUnsubscribeAutomation: (automation: IAutomationMetadataObject) => {
                if (scope === "organization") {
                    return (service as IOrganization)
                        .automations()
                        .unsubscribeAutomation(automation.id, automation.workspace?.id);
                }
                return (service as IAnalyticalWorkspace).automations().unsubscribeAutomation(automation.id);
            },
            promiseUnsubscribeAutomations: (automations: Array<IAutomationMetadataObject>) => {
                if (scope === "organization") {
                    return (service as IOrganization).automations().unsubscribeAutomations(
                        automations.map((automation) => ({
                            id: automation.id,
                            workspaceId: automation.workspace?.id,
                        })),
                    );
                }
                return (service as IAnalyticalWorkspace)
                    .automations()
                    .unsubscribeAutomations(automations.map((automation) => automation.id));
            },
            promisePauseAutomation: (automation: IAutomationMetadataObject) => {
                if (scope === "organization") {
                    return (service as IOrganization)
                        .automations()
                        .pauseAutomation(automation.id, automation.workspace?.id);
                }
                return (service as IAnalyticalWorkspace).automations().pauseAutomation(automation.id);
            },
            promisePauseAutomations: (automations: Array<IAutomationMetadataObject>) => {
                if (scope === "organization") {
                    return (service as IOrganization).automations().pauseAutomations(
                        automations.map((automation) => ({
                            id: automation.id,
                            workspaceId: automation.workspace?.id,
                        })),
                    );
                }
                return (service as IAnalyticalWorkspace)
                    .automations()
                    .pauseAutomations(automations.map((automation) => automation.id));
            },
            promiseResumeAutomation: (automation: IAutomationMetadataObject) => {
                if (scope === "organization") {
                    return (service as IOrganization)
                        .automations()
                        .resumeAutomation(automation.id, automation.workspace?.id);
                }
                return (service as IAnalyticalWorkspace).automations().resumeAutomation(automation.id);
            },
            promiseResumeAutomations: (automations: Array<IAutomationMetadataObject>) => {
                if (scope === "organization") {
                    return (service as IOrganization).automations().resumeAutomations(
                        automations.map((automation) => ({
                            id: automation.id,
                            workspaceId: automation.workspace?.id,
                        })),
                    );
                }
                return (service as IAnalyticalWorkspace)
                    .automations()
                    .resumeAutomations(automations.map((automation) => automation.id));
            },
        }),
        [service, scope, backend],
    );
};
