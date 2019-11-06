// (C) 2007-2019 GoodData Corporation
import { IExecutionFactory, IAnalyticalBackend, IPreparedExecution } from '@gooddata/sdk-backend-spi';
import { dummyBackend, decoratedBackend } from '@gooddata/sdk-backend-mockingbird';
import { IExecutionDefinition, IBucket, IFilter, IInsight, AttributeOrMeasure } from '@gooddata/sdk-model';

export class ExecutionFactoryDecorator implements IExecutionFactory {
    private readonly decorated: IExecutionFactory;

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        return undefined;
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return undefined;
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        return undefined;
    }

    public forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution> {
        return undefined;
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        return undefined;
    }
}

function createBackend(): IAnalyticalBackend {
    const backend = decoratedBackend(
        dummyBackend(),
        {
            execution:
        }
    );

    return
}
