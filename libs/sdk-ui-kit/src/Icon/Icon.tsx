// (C) 2021-2025 GoodData Corporation

import React from "react";

import { Aborted } from "./icons/Aborted.js";
import { Alert } from "./icons/Alert.js";
import { AlertPaused } from "./icons/AlertPaused.js";
import { ArrowDown } from "./icons/ArrowDown.js";
import { ArrowLeft } from "./icons/ArrowLeft.js";
import { ArrowRight } from "./icons/ArrowRight.js";
import { ArrowUp } from "./icons/ArrowUp.js";
import { AttachmentClip } from "./icons/AttachmentClip.js";
import { Attribute } from "./icons/Attribute.js";
import { AttributeFilter } from "./icons/AttributeFilter.js";
import { BoldHyperlink } from "./icons/BoldHyperlink.js";
import { Book } from "./icons/Book.js";
import { BurgerMenu } from "./icons/BurgerMenu.js";
import { ChatBubble } from "./icons/ChatBubble.js";
import { Close } from "./icons/Close.js";
import { ColumnContainer } from "./icons/ColumnContainer.js";
import { Columns, IColumnsIconProps } from "./icons/Columns.js";
import { Contract } from "./icons/Contract.js";
import { Copy } from "./icons/Copy.js";
import { Dashboard } from "./icons/Dashboard.js";
import { Dataset } from "./icons/Dataset.js";
import { DataSource } from "./icons/DataSource.js";
import { Date } from "./icons/Date.js";
import { DragHandle } from "./icons/DragHandle.js";
import { DrillDown } from "./icons/DrillDown.js";
import { DrillToDashboard } from "./icons/DrillToDashboard.js";
import { DrillToInsight } from "./icons/DrillToInsight.js";
import { Edit } from "./icons/Edit.js";
import { Ellipsis } from "./icons/Ellipsis.js";
import { Email } from "./icons/Email.js";
import { EmbedCodeIcon } from "./icons/EmbedCodeIcon.js";
import { Error } from "./icons/Error.js";
import { Expand } from "./icons/Expand.js";
import { Explore } from "./icons/Explore.js";
import { ExternalLink } from "./icons/ExternalLink.js";
import { Fact } from "./icons/Fact.js";
import { Function } from "./icons/Function.js";
import { GenAI } from "./icons/GenAI.js";
import { GenAI2 } from "./icons/GenAI2.js";
import { Hash } from "./icons/Hash.js";
import { Header } from "./icons/Header.js";
import { HistoryBack } from "./icons/HistoryBack.js";
import { Home } from "./icons/Home.js";
import { Hyperlink } from "./icons/Hyperlink.js";
import { Image } from "./icons/Image.js";
import { Insight } from "./icons/Insight.js";
import { Bar } from "./icons/InsightIcons/Bar.js";
import { Bubble } from "./icons/InsightIcons/Bubble.js";
import { Bullet } from "./icons/InsightIcons/Bullet.js";
import { Column } from "./icons/InsightIcons/Column.js";
import { Combo } from "./icons/InsightIcons/Combo.js";
import { DependencyWheel } from "./icons/InsightIcons/DependencyWheel.js";
import { Donut } from "./icons/InsightIcons/Donut.js";
import { Funnel } from "./icons/InsightIcons/Funnel.js";
import { Geo } from "./icons/InsightIcons/Geo.js";
import { HeadlineChart } from "./icons/InsightIcons/HeadlineChart.js";
import { HeatMap } from "./icons/InsightIcons/HeatMap.js";
import { Line } from "./icons/InsightIcons/Line.js";
import { Pie } from "./icons/InsightIcons/Pie.js";
import { Pyramid } from "./icons/InsightIcons/Pyramid.js";
import { Repeater } from "./icons/InsightIcons/Repeater.js";
import { Sankey } from "./icons/InsightIcons/Sankey.js";
import { ScatterPlot } from "./icons/InsightIcons/ScatterPlot.js";
import { StackedArea } from "./icons/InsightIcons/StackedArea.js";
import { Table } from "./icons/InsightIcons/Table.js";
import { TreeMap } from "./icons/InsightIcons/TreeMap.js";
import { Waterfall } from "./icons/InsightIcons/Waterfall.js";
import { Interaction } from "./icons/Interaction.js";
import { Invite } from "./icons/Invite.js";
import { Keyword } from "./icons/Keyword.js";
import { Label } from "./icons/Label.js";
import { Leave } from "./icons/Leave.js";
import { LegendMenu } from "./icons/LegendMenu.js";
import { Lock } from "./icons/Lock.js";
import { Logout } from "./icons/Logout.js";
import { Magic } from "./icons/Magic.js";
import { Many } from "./icons/Many.js";
import { Metric } from "./icons/Metric.js";
import { Minimize } from "./icons/Minimize.js";
import { NewVisualization } from "./icons/NewVisualization.js";
import { Origin } from "./icons/Origin.js";
import { Pdf } from "./icons/Pdf.js";
import { Progress } from "./icons/Progress.js";
import { QuestionMark } from "./icons/QuestionMark.js";
import { Refresh } from "./icons/Refresh.js";
import { Reset } from "./icons/Reset.js";
import { RichText } from "./icons/RichText.js";
import { IRowsIconProps, Rows } from "./icons/Rows.js";
import { Run } from "./icons/Run.js";
import { Save } from "./icons/Save.js";
import { Schedule } from "./icons/Schedule.js";
import { Search } from "./icons/Search.js";
import { SettingsGear } from "./icons/SettingsGear.js";
import { SimplifiedDashboard } from "./icons/SimplifiedDashboard.js";
import { SmallDragHandle } from "./icons/SmallDragHandle.js";
import { Success } from "./icons/Success.js";
import { ThumbsDown } from "./icons/ThumbsDown.js";
import { ThumbsUp } from "./icons/ThumbsUp.js";
import { Token } from "./icons/Token.js";
import { Trash } from "./icons/Trash.js";
import { Undo } from "./icons/Undo.js";
import { User } from "./icons/User.js";
import { UserGroup } from "./icons/UserGroup.js";
import { VisualizationSwitcher } from "./icons/VisualizationSwitcher.js";
import { Warning } from "./icons/Warning.js";
import { Webhook } from "./icons/Webhook.js";
import { Website } from "./icons/Website.js";
import { Widget } from "./icons/Widget.js";
import { IIconProps } from "./typings.js";

/**
 * @internal
 */
export const Icon: Record<string, React.FC<IIconProps>> = {
    Book,
    Refresh,
    Reset,
    DrillDown,
    DrillToDashboard,
    DrillToInsight,
    Date,
    Explore,
    Logout,
    Lock,
    Pdf,
    ExternalLink,
    Hyperlink,
    BoldHyperlink,
    Undo,
    Home,
    BurgerMenu,
    Rows,
    Columns,
    DragHandle,
    Interaction,
    AttributeFilter,
    LegendMenu,
    ArrowDown,
    ArrowUp,
    ArrowLeft,
    ArrowRight,
    Attribute,
    Close,
    Dataset,
    Expand,
    Contract,
    Fact,
    Function,
    Insight,
    Keyword,
    Label,
    Metric,
    QuestionMark,
    Minimize,
    Dashboard,
    Many,
    SettingsGear,
    AttachmentClip,
    Table,
    Column,
    Bar,
    Line,
    StackedArea,
    Combo,
    HeadlineChart,
    ScatterPlot,
    Bubble,
    Pie,
    Donut,
    TreeMap,
    HeatMap,
    Bullet,
    Geo,
    Sankey,
    DependencyWheel,
    Waterfall,
    EmbedCodeIcon,
    Error,
    Aborted,
    Progress,
    Success,
    Token,
    Origin,
    Leave,
    Copy,
    Run,
    Invite,
    Pyramid,
    Funnel,
    RichText,
    VisualizationSwitcher,
    DataSource,
    User,
    UserGroup,
    Repeater,
    Image,
    Hash,
    Magic,
    Webhook,
    Schedule,
    Website,
    Widget,
    SimplifiedDashboard,
    HistoryBack,
    Alert,
    AlertPaused,
    Ellipsis,
    Warning,
    Email,
    Trash,
    GenAI,
    GenAI2,
    Search,
    NewVisualization,
    ChatBubble,
    ColumnContainer,
    ThumbsUp,
    ThumbsDown,
    SmallDragHandle,
    Header,
    Save,
    Edit,
};

export type { IRowsIconProps, IColumnsIconProps };
