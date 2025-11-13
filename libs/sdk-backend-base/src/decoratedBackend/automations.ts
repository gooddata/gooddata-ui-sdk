// (C) 2021-2025 GoodData Corporation

import {
    AutomationFilterType,
    AutomationType,
    IAutomationsQuery,
    IAutomationsQueryResult,
    IGetAutomationOptions,
    IGetAutomationsOptions,
    IGetAutomationsQueryOptions,
    IRawExportCustomOverrides,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExecutionDefinition,
} from "@gooddata/sdk-model";

export abstract class DecoratedAutomationsQuery implements IAutomationsQuery {
    protected constructor(protected readonly decorated: IAutomationsQuery) {}

    withSize(size: number): IAutomationsQuery {
        return this.decorated.withSize(size);
    }
    withPage(page: number): IAutomationsQuery {
        return this.decorated.withPage(page);
    }
    withFilter(filter: { title?: string }): IAutomationsQuery {
        return this.decorated.withFilter(filter);
    }
    withSorting(sort: string[]): IAutomationsQuery {
        return this.decorated.withSorting(sort);
    }
    withType(type: AutomationType): IAutomationsQuery {
        return this.decorated.withType(type);
    }
    withAuthor(author: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        return this.decorated.withAuthor(author, filterType);
    }
    withRecipient(recipient: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        return this.decorated.withRecipient(recipient, filterType);
    }
    withExternalRecipient(externalRecipient: string): IAutomationsQuery {
        return this.decorated.withExternalRecipient(externalRecipient);
    }
    withUser(user: string): IAutomationsQuery {
        return this.decorated.withUser(user);
    }
    withDashboard(dashboard: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        return this.decorated.withDashboard(dashboard, filterType);
    }
    withStatus(status: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        return this.decorated.withStatus(status, filterType);
    }
    query(): Promise<IAutomationsQueryResult> {
        return this.decorated.query();
    }
    queryAll(): Promise<IAutomationMetadataObject[]> {
        return this.decorated.queryAll();
    }
}

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceAutomationsService implements IWorkspaceAutomationService {
    protected constructor(protected readonly decorated: IWorkspaceAutomationService) {}

    createAutomation(
        automation: IAutomationMetadataObjectDefinition,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        return this.decorated.createAutomation(automation, options, widgetExecution, overrides);
    }

    deleteAutomation(id: string): Promise<void> {
        return this.decorated.deleteAutomation(id);
    }

    deleteAutomations(ids: string[]): Promise<void> {
        return this.decorated.deleteAutomations(ids);
    }

    getAutomation(id: string, options?: IGetAutomationOptions): Promise<IAutomationMetadataObject> {
        return this.decorated.getAutomation(id, options);
    }

    getAutomations(options?: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]> {
        return this.decorated.getAutomations(options);
    }

    getAutomationsQuery(options?: IGetAutomationsQueryOptions): IAutomationsQuery {
        return this.decorated.getAutomationsQuery(options);
    }

    updateAutomation(
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        return this.decorated.updateAutomation(automation, options, widgetExecution, overrides);
    }

    unsubscribeAutomation(id: string): Promise<void> {
        return this.decorated.unsubscribeAutomation(id);
    }

    unsubscribeAutomations(ids: string[]): Promise<void> {
        return this.decorated.unsubscribeAutomations(ids);
    }

    pauseAutomation(id: string): Promise<void> {
        return this.decorated.pauseAutomation(id);
    }

    resumeAutomation(id: string): Promise<void> {
        return this.decorated.resumeAutomation(id);
    }

    pauseAutomations(ids: string[]): Promise<void> {
        return this.decorated.pauseAutomations(ids);
    }

    resumeAutomations(ids: string[]): Promise<void> {
        return this.decorated.resumeAutomations(ids);
    }
}
