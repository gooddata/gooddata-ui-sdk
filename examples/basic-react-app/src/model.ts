import { IMeasure, IAttribute } from "@gooddata/sdk-model";

export const workspace = "gtl83h4doozbp26q0kf5qg8uiyu4glyn";

export const SumOfCalls: IMeasure = {
    measure: {
        localIdentifier: "sum_of_calls",
        alias: "Sum of Calls",
        definition: {
            measureDefinition: {
                item: { identifier: "fact.endpoint_calls.calls" },
                aggregation: "sum",
            },
        },
    },
};

export const AvgDuration: IMeasure = {
    measure: {
        localIdentifier: "average_duration",
        alias: "Average Duration",
        definition: {
            measureDefinition: {
                item: { identifier: "fact.endpoint_calls.avg_duration" },
                aggregation: "avg",
            },
        },
    },
};

export const AgentName = {
    attribute: {
        displayForm: { identifier: "label.agent.agent" },
        localIdentifier: "agent_name",
    },
};

export const EndpointName: IAttribute = {
    attribute: {
        displayForm: { identifier: "label.endpoint.name" },
        localIdentifier: "endpoint_name",
    },
};
