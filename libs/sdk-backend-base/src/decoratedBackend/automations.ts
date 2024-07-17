// (C) 2021-2024 GoodData Corporation

import {
    IWorkspaceAutomationService,
    IGetAutomationOptions,
    IGetAutomationsOptions,
    IAutomationsQuery,
    AutomationType,
    IAutomationsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IAutomationMetadataObjectDefinition, IAutomationMetadataObject } from "@gooddata/sdk-model";

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
    query(): Promise<IAutomationsQueryResult> {
        return this.decorated.query();
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
    ): Promise<IAutomationMetadataObject> {
        return this.decorated.createAutomation(automation, options);
    }

    deleteAutomation(id: string): Promise<void> {
        return this.decorated.deleteAutomation(id);
    }

    getAutomation(id: string, options?: IGetAutomationOptions): Promise<IAutomationMetadataObject> {
        return this.decorated.getAutomation(id, options);
    }

    getAutomations(options?: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]> {
        return this.decorated.getAutomations(options);
    }

    getAutomationsQuery(): IAutomationsQuery {
        return this.decorated.getAutomationsQuery();
    }

    updateAutomation(
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
    ): Promise<IAutomationMetadataObject> {
        return this.decorated.updateAutomation(automation, options);
    }
}
