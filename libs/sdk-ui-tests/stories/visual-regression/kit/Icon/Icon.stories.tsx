// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

import { Icon } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const {
    Aborted: AbortedIcon,
    Alert: AlertIcon,
    AlertPaused: AlertPausedIcon,
    ArrowDown: ArrowDownIcon,
    ArrowUp: ArrowUpIcon,
    AttachmentClip: AttachmentClipIcon,
    Attribute: AttributeIcon,
    AttributeFilter: AttributeFilterIcon,
    Bar: BarIcon,
    BoldHyperlink: BoldHyperlinkIcon,
    Book: BookIcon,
    Bubble: BubbleIcon,
    Bullet: BulletIcon,
    BurgerMenu: BurgerMenuIcon,
    ChatBubble: ChatBubbleIcon,
    Close: CloseIcon,
    Column: ColumnIcon,
    Columns: ColumnsIcon,
    Combo: ComboIcon,
    Contract: ContractIcon,
    Copy: CopyIcon,
    Dashboard: DashboardIcon,
    DataSource: DataSourceIcon,
    Dataset: DatasetIcon,
    Date: DateIcon,
    DependencyWheel: DependencyWheelIcon,
    Donut: DonutIcon,
    DragHandle: DragHandleIcon,
    DrillDown: DrillDownIcon,
    DrillToDashboard: DrillToDashboardIcon,
    DrillToInsight: DrillToInsightIcon,
    Ellipsis: EllipsisIcon,
    EmbedCodeIcon,
    Error: ErrorIcon,
    Expand: ExpandIcon,
    Explore: ExploreIcon,
    ExternalLink: ExternalLinkIcon,
    Fact: FactIcon,
    Function: FunctionIcon,
    Funnel: FunnelIcon,
    GenAI: GenAIIcon,
    Geo: GeoIcon,
    Hash: HashIcon,
    HeadlineChart: HeadlineChartIcon,
    HeatMap: HeatMapIcon,
    HistoryBack: HistoryBackIcon,
    Home: HomeIcon,
    Hyperlink: HyperlinkIcon,
    Image: ImageIcon,
    Insight: InsightIcon,
    Interaction: InteractionIcon,
    Invite: InviteIcon,
    Keyword: KeywordIcon,
    Label: LabelIcon,
    Leave: LeaveIcon,
    LegendMenu: LegendMenuIcon,
    Line: LineIcon,
    Lock: LockIcon,
    Logout: LogoutIcon,
    Magic: MagicIcon,
    Many: ManyIcon,
    Metric: MetricIcon,
    Minimize: MinimizeIcon,
    NewVisualization: NewVisualizationIcon,
    Origin: OriginIcon,
    Pdf: PdfIcon,
    Pie: PieIcon,
    Progress: ProgressIcon,
    Pyramid: PyramidIcon,
    QuestionMark: QuestionMarkIcon,
    Refresh: RefreshIcon,
    Repeater: RepeaterIcon,
    Reset: ResetIcon,
    RichText: RichTextIcon,
    Rows: RowsIcon,
    Run: RunIcon,
    Sankey: SankeyIcon,
    ScatterPlot: ScatterPlotIcon,
    Schedule: ScheduleIcon,
    Search: SearchIcon,
    SettingsGear: SettingsGearIcon,
    SimplifiedDashboard: SimplifiedDashboardIcon,
    StackedArea: StackedAreaIcon,
    Success: SuccessIcon,
    Table: TableIcon,
    ThumbsDown: ThumbsDownIcon,
    ThumbsUp: ThumbsUpIcon,
    Token: TokenIcon,
    TreeMap: TreeMapIcon,
    Undo: UndoIcon,
    User: UserIcon,
    UserGroup: UserGroupIcon,
    VisualizationSwitcher: VisualizationSwitcherIcon,
    Waterfall: WaterfallIcon,
    Webhook: WebhookIcon,
    Website: WebsiteIcon,
    Widget: WidgetIcon,
} = Icon;

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
                <ScatterPlotIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Donut">
                <DonutIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeadlineChart">
                <HeadlineChartIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="TreeMap">
                <TreeMapIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Combo">
                <ComboIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="HeatMap">
                <HeatMapIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bubble">
                <BubbleIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bullet">
                <BulletIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Bar">
                <BarIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Table">
                <TableIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="StackedArea">
                <StackedAreaIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Column">
                <ColumnIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Line">
                <LineIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Geo">
                <GeoIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pie">
                <PieIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Sankey">
                <SankeyIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="DependencyWheel">
                <DependencyWheelIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Waterfall">
                <WaterfallIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Funnel">
                <FunnelIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Pyramid">
                <PyramidIcon color="#000" width={15} height={15} />
            </IconWrapper>
            <IconWrapper name="Repeater">
                <RepeaterIcon color="#000" width={15} height={15} />
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
                        <RefreshIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillDown">
                        <DrillDownIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToDashboard">
                        <DrillToDashboardIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DrillToInsight">
                        <DrillToInsightIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Date">
                        <DateIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Explore">
                        <ExploreIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Logout">
                        <LogoutIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Pdf">
                        <PdfIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ExternalLink">
                        <ExternalLinkIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hyperlink">
                        <HyperlinkIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Undo">
                        <UndoIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Home">
                        <HomeIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DragHandle">
                        <DragHandleIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AttributeFilter">
                        <AttributeFilterIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Interaction">
                        <InteractionIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Book">
                        <BookIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Lock">
                        <LockIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Rows">
                        <RowsIcon colorPalette={{ normalRow: "#f00", totalRow: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="Columns">
                        <ColumnsIcon colorPalette={{ normalColumn: "#f00", totalColumn: "#00f" }} />
                    </IconWrapper>
                    <IconWrapper name="ArrowDown">
                        <ArrowDownIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ArrowUp">
                        <ArrowUpIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Contract">
                        <ContractIcon color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="AttachmentClip">
                        <AttachmentClipIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Attribute">
                        <AttributeIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BurgerMenu">
                        <BurgerMenuIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Close">
                        <CloseIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Dashboard">
                        <DashboardIcon color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Dataset">
                        <DatasetIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Expand">
                        <ExpandIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Fact">
                        <FactIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Function">
                        <FunctionIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Insight">
                        <InsightIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Keyword">
                        <KeywordIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Label">
                        <LabelIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="LegendMenu">
                        <LegendMenuIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Many">
                        <ManyIcon color="#00f" width={16} height={16} />
                    </IconWrapper>
                    <IconWrapper name="Metric">
                        <MetricIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Minimize">
                        <MinimizeIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="QuestionMark">
                        <QuestionMarkIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SettingsGear">
                        <SettingsGearIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="EmbedCodeIcon">
                        <EmbedCodeIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="BoldHyperlink">
                        <BoldHyperlinkIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Reset">
                        <ResetIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Error">
                        <ErrorIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="Aborted">
                        <AbortedIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Progress">
                        <ProgressIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Success">
                        <SuccessIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Origin">
                        <OriginIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Token">
                        <TokenIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Leave">
                        <LeaveIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Invite">
                        <InviteIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="RichText">
                        <RichTextIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="VisualizationSwitcher">
                        <VisualizationSwitcherIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Copy">
                        <CopyIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Run">
                        <RunIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="DataSource">
                        <DataSourceIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="User">
                        <UserIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="UserGroup">
                        <UserGroupIcon color="#00f" width={18} height={18} />
                    </IconWrapper>
                    <IconWrapper name="Image">
                        <ImageIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Hash">
                        <HashIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Magic">
                        <MagicIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Webhook">
                        <WebhookIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Schedule">
                        <ScheduleIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Website">
                        <WebsiteIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Widget">
                        <WidgetIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="SimplifiedDashboard">
                        <SimplifiedDashboardIcon color="#00f" />
                    </IconWrapper>
                </ColumnWrapper>
                <ColumnWrapper>
                    <IconWrapper name="HistoryBack">
                        <HistoryBackIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Alert">
                        <AlertIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="AlertPaused">
                        <AlertPausedIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="Ellipsis">
                        <EllipsisIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="GenAI">
                        <GenAIIcon color="#00f" width={22} height={22} />
                    </IconWrapper>
                    <IconWrapper name="Search">
                        <SearchIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="NewVisualization">
                        <NewVisualizationIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ChatBubble">
                        <ChatBubbleIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsUp">
                        <ThumbsUpIcon color="#00f" />
                    </IconWrapper>
                    <IconWrapper name="ThumbsDown">
                        <ThumbsDownIcon color="#00f" />
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
InsightIcons.parameters = { kind: "insight icons", screenshot: true };

export function Icons() {
    return <IconsTest />;
}
Icons.parameters = { kind: "icons", screenshot: true };
