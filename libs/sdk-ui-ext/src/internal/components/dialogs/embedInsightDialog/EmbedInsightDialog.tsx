// (C) 2022-2023 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { IColorPalette, IExecutionConfig, IInsight } from "@gooddata/sdk-model";
import {
    EmbedInsightDialogBase,
    InsightCodeType,
    Overlay,
    getDefaultEmbedTypeOptions,
    getHeightWithUnitsForEmbedCode,
    IAlignPoint,
    CopyCodeOriginType,
    EmbedOptionsType,
    EmbedType,
    IReactOptions,
    IWebComponentsOptions,
} from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { FullVisualizationCatalog } from "../../VisualizationCatalog.js";
import { insightViewCodeGenerator } from "../../../utils/embeddingInsightViewCodeGenerator/insightViewCodeGenerator.js";
import { getWebComponentsCodeGenerator } from "../../../utils/embeddingCodeGenerator/getWebComponentsCodeGenerator.js";

const INSIGHT_VIEW_PROPERTIES_LINK =
    "https://sdk.gooddata.com/gooddata-ui/docs/visualization_component.html#properties";

/**
 * @internal
 */
export interface IEmbedInsightDialogProps {
    insight: IInsight;
    locale?: string;
    backend?: IAnalyticalBackend;
    reactIntegrationDocLink?: string;
    webComponentIntegrationDocLink?: string;
    saveInsightDocLink?: string;
    settings?: IUserWorkspaceSettings;
    colorPalette?: IColorPalette;
    executionConfig?: IExecutionConfig;
    workspaceId?: string;
    showWebComponentsTab?: boolean;

    openSaveInsightDialog: () => void;
    onClose: () => void;
    onCopyCode: (code: string, type: CopyCodeOriginType, codeType: EmbedType) => void;
}

/**
 * @internal
 */
export const EmbedInsightDialog: React.VFC<IEmbedInsightDialogProps> = (props) => {
    const { locale, openSaveInsightDialog, onClose, onCopyCode, showWebComponentsTab } = props;

    const {
        code,
        documentationLink,
        integrationDocLink,
        currentTab,
        codeOption,
        onTabChange,
        onOptionsChange,
    } = useEmbedInsightDialog(props);

    return (
        <IntlWrapper locale={locale}>
            <ModalOverlay>
                <EmbedInsightDialogBase
                    code={code}
                    propertiesLink={documentationLink}
                    showWebComponentsTab={showWebComponentsTab}
                    integrationDocLink={integrationDocLink}
                    openSaveInsightDialog={openSaveInsightDialog}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                    embedTab={currentTab}
                    onTabChange={onTabChange}
                    embedTypeOptions={codeOption}
                    onOptionsChange={onOptionsChange}
                />
            </ModalOverlay>
        </IntlWrapper>
    );
};

const useEmbedInsightDialog = (props: IEmbedInsightDialogProps) => {
    const {
        insight,
        backend,
        settings,
        colorPalette,
        executionConfig,
        reactIntegrationDocLink,
        webComponentIntegrationDocLink,
        workspaceId,
    } = props;
    const [currentTab, setCurrentTab] = useState<EmbedType>("react");
    const [codeOption, setCodeOption] = useState<EmbedOptionsType>(getDefaultEmbedTypeOptions(currentTab));

    useEffect(() => {
        setCodeOption(getDefaultEmbedTypeOptions(currentTab));
    }, [currentTab]);

    const code = useMemo(() => {
        const isReactDefinitionCode =
            codeOption.type === "react" && codeOption.componentType === "definition";
        if (!insight.insight.identifier && !isReactDefinitionCode) {
            return null;
        }
        const inputBase = {
            insight,
            settings,
            backend,
            colorPalette,
            executionConfig,
            workspaceId,
        };
        return codeOption.type === "react"
            ? generateCodeByReact({
                  ...inputBase,
                  codeOption: codeOption,
              })
            : generateCodeByWebComponents({
                  ...inputBase,
                  codeOption,
              });
    }, [codeOption, insight, settings, backend, colorPalette, executionConfig, workspaceId]);

    const documentationLink = useMemo(() => {
        if (codeOption.type === "react") {
            return getLinkToPropertiesDocumentation(codeOption.componentType, insight);
        }
        return getLinkToPropertiesDocumentation("definition", insight);
    }, [insight, codeOption]);

    const integrationDocLink = useMemo(() => {
        return currentTab === "react" ? reactIntegrationDocLink : webComponentIntegrationDocLink;
    }, [currentTab, reactIntegrationDocLink, webComponentIntegrationDocLink]);

    const onTabChange = useCallback((selectedTab: EmbedType) => {
        setCurrentTab(selectedTab);
    }, []);

    const onOptionsChange = useCallback((opt: EmbedOptionsType) => setCodeOption(opt), []);

    return {
        code,
        documentationLink,
        integrationDocLink,
        currentTab,
        codeOption,
        onTabChange,
        onOptionsChange,
    };
};

const getLinkToPropertiesDocumentation = (
    codeType: InsightCodeType,
    insight: IInsight,
): string | undefined => {
    if (codeType === "definition") {
        const meta = FullVisualizationCatalog.forInsight(insight).getMeta();
        if (meta?.documentationUrl) {
            return `${meta?.documentationUrl}#properties`;
        }
    }

    return INSIGHT_VIEW_PROPERTIES_LINK;
};

interface ICodeGenInput<TOptions extends EmbedOptionsType> {
    codeOption: TOptions;
    insight: IInsight;
    settings: IUserWorkspaceSettings;
    backend: IAnalyticalBackend;
    colorPalette: IColorPalette;
    executionConfig: IExecutionConfig | undefined;
    workspaceId?: string;
}

const generateCodeByReact = (input: ICodeGenInput<IReactOptions>) => {
    const { backend, codeOption, colorPalette, executionConfig, insight, settings } = input;
    const height = getHeightWithUnitsForEmbedCode(codeOption);
    const generateCodeConfig = {
        context: {
            settings,
            backend,
            colorPalette,
            executionConfig,
        },
        language: codeOption.codeType,
        height,
        omitChartProps: codeOption.displayConfiguration ? [] : ["config"],
    };

    if (codeOption.componentType === "definition") {
        const descriptor = FullVisualizationCatalog.forInsight(insight);
        return descriptor.getEmbeddingCode?.(insight, generateCodeConfig);
    }
    return insightViewCodeGenerator(insight, generateCodeConfig);
};

const generateCodeByWebComponents = (input: ICodeGenInput<IWebComponentsOptions>) => {
    const { codeOption, insight, workspaceId } = input;
    const height = getHeightWithUnitsForEmbedCode(codeOption) as string;
    return getWebComponentsCodeGenerator(workspaceId, insight, { ...codeOption, height });
};

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "cc cc" }];

const ModalOverlay: React.FC<{ children?: React.ReactNode }> = (props) => {
    const { children } = props;
    return (
        <Overlay alignPoints={BUBBLE_ALIGN_POINTS} isModal positionType="fixed">
            {children}
        </Overlay>
    );
};
