// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

import {
    IconAborted,
    IconAlert,
    IconAlertPaused,
    IconArrowDown,
    IconArrowUp,
    IconAttachmentClip,
    IconAttribute,
    IconAttributeFilter,
    IconBar,
    IconBoldHyperlink,
    IconBook,
    IconBubble,
    IconBullet,
    IconBurgerMenu,
    IconChatBubble,
    IconClose,
    IconColumn,
    IconColumns,
    IconCombo,
    IconContract,
    IconCopy,
    IconDashboard,
    IconDataSource,
    IconDataset,
    IconDate,
    IconDependencyWheel,
    IconDonut,
    IconDragHandle,
    IconDrillDown,
    IconDrillToDashboard,
    IconDrillToInsight,
    IconEllipsis,
    IconEmbedCode,
    IconError,
    IconExpand,
    IconExplore,
    IconExternalLink,
    IconFact,
    IconFunction,
    IconFunnel,
    IconGenAI,
    IconGeo,
    IconHash,
    IconHeadlineChart,
    IconHeatMap,
    IconHistoryBack,
    IconHome,
    IconHyperlink,
    IconImage,
    IconInsight,
    IconInteraction,
    IconInvite,
    IconKeyword,
    IconLabel,
    IconLeave,
    IconLegendMenu,
    IconLine,
    IconLock,
    IconLogout,
    IconMagic,
    IconMany,
    IconMetric,
    IconMinimize,
    IconNewVisualization,
    IconOrigin,
    IconPdf,
    IconPie,
    IconProgress,
    IconPyramid,
    IconQuestionMark,
    IconRefresh,
    IconRepeater,
    IconReset,
    IconRichText,
    IconRows,
    IconRun,
    IconSankey,
    IconScatterPlot,
    IconSchedule,
    IconSearch,
    IconSettingsGear,
    IconSimplifiedDashboard,
    IconStackedArea,
    IconSuccess,
    IconTable,
    IconThumbsDown,
    IconThumbsUp,
    IconToken,
    IconTreeMap,
    IconUndo,
    IconUser,
    IconUserGroup,
    IconVisualizationSwitcher,
    IconWaterfall,
    IconWebhook,
    IconWebsite,
    IconWidget,
} from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";
import { IStoryParameters } from "../../../_infra/backstopScenario.js";

interface IIconWrapperProps {
    name: string;
    children?: ReactNode;
}

function IconWrapper({ name, children }: IIconWrapperProps) {
    return (
        <div className="gd-icon-wrapper">
            <div className="gd-icon-name">{`${name}: `}</div>
            {children}
        </div>
    );
}

function RowWrapper({ children }: { children?: ReactNode }) {
    return <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>;
}

function ColumnWrapper({ children }: { children?: ReactNode }) {
    return <div style={{ display: "flex", flexDirection: "column", paddingRight: "10px" }}>{children}</div>;
}

function InsightIconsTest(_props: { children?: ReactNode }) {
    return (
        <div className="library-component screenshot-target">
            <IconWrapper name="ScatterPlot">
                <IconScatterPlot color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Donut">
                <IconDonut color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeadlineChart">
                <IconHeadlineChart color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="TreeMap">
                <IconTreeMap color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Combo">
                <IconCombo color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeatMap">
                <IconHeatMap color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bubble">
                <IconBubble color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bullet">
                <IconBullet color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bar">
                <IconBar color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Table">
                <IconTable color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="StackedArea">
                <IconStackedArea color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Column">
                <IconColumn color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Line">
                <IconLine color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Geo">
                <IconGeo color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pie">
                <IconPie color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Sankey">
                <IconSankey color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="DependencyWheel">
                <IconDependencyWheel color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Waterfall">
                <IconWaterfall color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Funnel">
                <IconFunnel color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pyramid">
                <IconPyramid color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Repeater">
                <IconRepeater color="#000" width={15} height={15} />
            </IconWrapper>
        </div>
    );
}

function IconsTest(_props: { children?: ReactNode }) {
    return (
        <div className="library-component screenshot-target">
            <RowWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Refresh">
                        <IconRefresh color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillDown">
                        <IconDrillDown color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToDashboard">
                        <IconDrillToDashboard color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToInsight">
                        <IconDrillToInsight color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Date">
                        <IconDate color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Explore">
                        <IconExplore color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Logout">
                        <IconLogout color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Pdf">
                        <IconPdf color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ExternalLink">
                        <IconExternalLink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hyperlink">
                        <IconHyperlink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Undo">
                        <IconUndo color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Home">
                        <IconHome color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DragHandle">
                        <IconDragHandle color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AttributeFilter">
                        <IconAttributeFilter color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Interaction">
                        <IconInteraction color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Book">
                        <IconBook color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Lock">
                        <IconLock color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Rows">
                        <IconRows colorPalette={{ normalRow: "#f00", totalRow: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="Columns">
                        <IconColumns colorPalette={{ normalColumn: "#f00", totalColumn: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="ArrowDown">
                        <IconArrowDown color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ArrowUp">
                        <IconArrowUp color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Contract">
                        <IconContract color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="AttachmentClip">
                        <IconAttachmentClip color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Attribute">
                        <IconAttribute color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BurgerMenu">
                        <IconBurgerMenu color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Close">
                        <IconClose color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Dashboard">
                        <IconDashboard color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Dataset">
                        <IconDataset color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Expand">
                        <IconExpand color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Fact">
                        <IconFact color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Function">
                        <IconFunction color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Insight">
                        <IconInsight color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Keyword">
                        <IconKeyword color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Label">
                        <IconLabel color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="LegendMenu">
                        <IconLegendMenu color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Many">
                        <IconMany color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Metric">
                        <IconMetric color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Minimize">
                        <IconMinimize color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="QuestionMark">
                        <IconQuestionMark color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SettingsGear">
                        <IconSettingsGear color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="EmbedCodeIcon">
                        <IconEmbedCode color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BoldHyperlink">
                        <IconBoldHyperlink color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Reset">
                        <IconReset color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Error">
                        <IconError color="#00f" width={18} height={18} />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Aborted">
                        <IconAborted color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Progress">
                        <IconProgress color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Success">
                        <IconSuccess color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Origin">
                        <IconOrigin color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Token">
                        <IconToken color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Leave">
                        <IconLeave color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Invite">
                        <IconInvite color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="RichText">
                        <IconRichText color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="VisualizationSwitcher">
                        <IconVisualizationSwitcher color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Copy">
                        <IconCopy color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Run">
                        <IconRun color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DataSource">
                        <IconDataSource color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="User">
                        <IconUser color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="UserGroup">
                        <IconUserGroup color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Image">
                        <IconImage color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hash">
                        <IconHash color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Magic">
                        <IconMagic color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Webhook">
                        <IconWebhook color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Schedule">
                        <IconSchedule color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Website">
                        <IconWebsite color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Widget">
                        <IconWidget color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SimplifiedDashboard">
                        <IconSimplifiedDashboard color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="HistoryBack">
                        <IconHistoryBack color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Alert">
                        <IconAlert color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AlertPaused">
                        <IconAlertPaused color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Ellipsis">
                        <IconEllipsis color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="GenAI">
                        <IconGenAI color="#00f" width={22} height={22} />
                    </IconWrapper>
                    <IconWrapper name="Search">
                        <IconSearch color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="NewVisualization">
                        <IconNewVisualization color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ChatBubble">
                        <IconChatBubble color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsUp">
                        <IconThumbsUp color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsDown">
                        <IconThumbsDown color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
            </RowWrapper>
        </div>
    );
}

export default {
    title: "12 UI Kit/Icon",
};

export function InsightIcons() {
    return <InsightIconsTest />;
}
InsightIcons.parameters = { kind: "insight icons", screenshot: true } satisfies IStoryParameters;

export function Icons() {
    return <IconsTest />;
}
Icons.parameters = { kind: "icons", screenshot: true } satisfies IStoryParameters;
