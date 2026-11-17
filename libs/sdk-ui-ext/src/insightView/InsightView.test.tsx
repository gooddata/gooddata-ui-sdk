// (C) 2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DecoratedWorkspaceInsightsService, decoratedBackend } from "@gooddata/sdk-backend-base";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IGetInsightOptions, type IWorkspaceInsightsService } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionConfig,
    type IInsight,
    type IInsightParameterValue,
    type IParameterDefinition,
    type IParameterMetadataObject,
    type ISettings,
    type ObjRef,
    idRef,
    insightRef,
    insightSetParameters,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import { clearInsightViewCaches } from "../dataLoaders/index.js";

import { InsightView } from "./InsightView.js";

interface IRendererProps {
    insight?: IInsight;
    execConfig?: IExecutionConfig;
    afterRender?: () => void;
}

const rendererProps = vi.hoisted(() => vi.fn<(props: IRendererProps) => void>());

vi.mock("./InsightRenderer.js", () => ({
    InsightRenderer: (props: IRendererProps) => {
        rendererProps(props);
        props.afterRender?.();
        return null;
    },
}));

const workspace = "reference-workspace";
const numberOverride: IInsightParameterValue = { ref: idRef("discount", "parameter"), value: 10 };
const stringOverride: IInsightParameterValue = { ref: idRef("region", "parameter"), value: "EU" };

describe("InsightView", () => {
    beforeEach(() => {
        clearInsightViewCaches();
        rendererProps.mockClear();
    });

    it("passes afterRender on to the visualization it renders", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const [insight] = (await backend.workspace(workspace).insights().getInsights({ limit: 1 })).items;
        const afterRender = vi.fn();

        render(
            <InsightView
                backend={backend}
                workspace={workspace}
                insight={insightRef(insight)}
                afterRender={afterRender}
            />,
        );

        await waitFor(() => expect(afterRender).toHaveBeenCalled());
    });

    it("executes with the stored parameter overrides of the insight", async () => {
        const execConfig = await renderedExecConfig([numberOverride], { enableParameters: true });

        expect(execConfig).toEqual({ parameterValues: [numberOverride] });
    });

    it("does not send stored overrides when parameters are disabled", async () => {
        const execConfig = await renderedExecConfig([numberOverride], { enableParameters: false });

        expect(execConfig).toBeUndefined();
    });

    it("drops stored string overrides when string parameters are disabled", async () => {
        const execConfig = await renderedExecConfig([numberOverride, stringOverride], {
            enableParameters: true,
            enableStringParameters: false,
        });

        expect(execConfig).toEqual({ parameterValues: [numberOverride] });
    });

    it("sends the caller's parameter values unchanged when parameters are disabled", async () => {
        const callerExecConfig: IExecutionConfig = { parameterValues: [stringOverride] };

        const execConfig = await renderedExecConfig(
            [numberOverride],
            { enableParameters: false, enableStringParameters: false },
            callerExecConfig,
        );

        expect(execConfig).toBe(callerExecConfig);
    });

    it("lets the caller's value win for its parameter and keeps other stored overrides", async () => {
        const callerOverride: IInsightParameterValue = { ref: idRef("discount", "parameter"), value: 25 };
        const callerExecConfig: IExecutionConfig = {
            timestamp: "2026-01-01 00:00:00",
            parameterValues: [callerOverride],
        };

        const execConfig = await renderedExecConfig(
            [numberOverride, stringOverride],
            { enableParameters: true },
            callerExecConfig,
        );

        expect(execConfig).toEqual({
            timestamp: "2026-01-01 00:00:00",
            parameterValues: [stringOverride, callerOverride],
        });
    });

    it("passes the caller's exec config as is when the insight has no overrides", async () => {
        const callerExecConfig: IExecutionConfig = { timestamp: "2026-01-01 00:00:00" };

        const execConfig = await renderedExecConfig([], { enableParameters: true }, callerExecConfig);

        expect(execConfig).toBe(callerExecConfig);
    });

    it("passes no exec config when the insight has no overrides and the caller sends none", async () => {
        const execConfig = await renderedExecConfig([], { enableParameters: true });

        expect(execConfig).toBeUndefined();
    });

    it("does not send a stored value outside the range of its parameter", async () => {
        const callerExecConfig: IExecutionConfig = { timestamp: "2026-01-01 00:00:00" };

        const execConfig = await renderedExecConfig(
            [numberOverride],
            { enableParameters: true },
            callerExecConfig,
            [parameter("discount", { type: "NUMBER", defaultValue: 1, constraints: { max: 5 } })],
        );

        expect(execConfig).toBe(callerExecConfig);
    });

    it("does not send a stored value of the wrong type for its parameter", async () => {
        const callerExecConfig: IExecutionConfig = { timestamp: "2026-01-01 00:00:00" };

        const execConfig = await renderedExecConfig(
            [stringOverride],
            { enableParameters: true },
            callerExecConfig,
            [parameter("region", { type: "NUMBER", defaultValue: 1 })],
        );

        expect(execConfig).toBe(callerExecConfig);
    });

    it("keeps a valid stored value next to an invalid one", async () => {
        const execConfig = await renderedExecConfig(
            [numberOverride, stringOverride],
            { enableParameters: true },
            undefined,
            [
                parameter("discount", { type: "NUMBER", defaultValue: 1, constraints: { max: 5 } }),
                parameter("region", { type: "STRING", defaultValue: "US" }),
            ],
        );

        expect(execConfig).toEqual({ parameterValues: [stringOverride] });
    });

    it("does not send a stored value whose parameter no longer exists", async () => {
        const execConfig = await renderedExecConfig(
            [numberOverride, stringOverride],
            { enableParameters: true },
            undefined,
            [parameter("region", { type: "STRING", defaultValue: "US" })],
        );

        expect(execConfig).toEqual({ parameterValues: [stringOverride] });
    });

    it("sends the caller's value for a parameter whose stored value is invalid", async () => {
        const callerOverride: IInsightParameterValue = { ref: idRef("discount", "parameter"), value: 25 };
        const callerExecConfig: IExecutionConfig = { parameterValues: [callerOverride] };

        const execConfig = await renderedExecConfig(
            [numberOverride],
            { enableParameters: true },
            callerExecConfig,
            [parameter("discount", { type: "NUMBER", defaultValue: 1, constraints: { max: 5 } })],
        );

        expect(execConfig).toBe(callerExecConfig);
    });

    it("passes no exec config when all stored values are invalid and the caller sends none", async () => {
        const execConfig = await renderedExecConfig([numberOverride], { enableParameters: true }, undefined, [
            parameter("discount", { type: "NUMBER", defaultValue: 1, constraints: { max: 5 } }),
        ]);

        expect(execConfig).toBeUndefined();
    });
});

async function renderedExecConfig(
    parameters: IInsightParameterValue[],
    settings: ISettings,
    execConfig?: IExecutionConfig,
    definitions?: IParameterMetadataObject[],
): Promise<IExecutionConfig | undefined> {
    const backend = decoratedBackend(
        recordedBackend(ReferenceRecordings.Recordings, { globalSettings: settings }),
        {
            insights: (insights, workspace) =>
                new InsightsWithParameterDefinitions(insights, workspace, definitions),
        },
    );
    const definition = newInsightDefinition("local:table", (builder) => builder.title("Stored overrides"));
    const saved = await backend
        .workspace(workspace)
        .insights()
        .createInsight(insightSetParameters(definition, parameters));

    render(
        <InsightView
            backend={backend}
            workspace={workspace}
            insight={insightRef(saved)}
            execConfig={execConfig}
        />,
    );

    await waitFor(() => expect(rendererProps.mock.lastCall?.[0].insight).toBeDefined());
    return rendererProps.mock.lastCall?.[0].execConfig;
}

class InsightsWithParameterDefinitions extends DecoratedWorkspaceInsightsService {
    constructor(
        decorated: IWorkspaceInsightsService,
        workspace: string,
        private readonly definitions: IParameterMetadataObject[] | undefined,
    ) {
        super(decorated, workspace);
    }

    public override async getInsight(ref: ObjRef, options?: IGetInsightOptions): Promise<IInsight> {
        const insight = await this.decorated.getInsight(ref, options);
        if (!options?.loadParameters || !this.definitions) {
            return insight;
        }
        return { insight: { ...insight.insight, referencedParameters: this.definitions } };
    }
}

function parameter(id: string, definition: IParameterDefinition): IParameterMetadataObject {
    return {
        id,
        uri: id,
        ref: idRef(id, "parameter"),
        type: "parameter",
        title: id,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition,
    };
}
