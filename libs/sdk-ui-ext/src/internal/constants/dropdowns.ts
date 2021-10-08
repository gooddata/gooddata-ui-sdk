// (C) 2019-2021 GoodData Corporation
import { ITranslatedDropdownItem } from "../interfaces/Dropdown";

export const pushpinSizeDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "default" },
    { type: "separator" },
    { title: "properties.points.size.extra_small", value: "0.5x" },
    { title: "properties.points.size.small", value: "0.75x" },
    { title: "properties.points.size.normal", value: "normal" },
    { title: "properties.points.size.large", value: "1.25x" },
    { title: "properties.points.size.extra_large", value: "1.5x" },
];

export const pushpinViewportDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.viewport.area.auto_default", value: "auto" },
    { title: "properties.viewport.area.world", value: "world" },
    { type: "header", title: "properties.viewport.area.continents" },
    { title: "properties.viewport.area.continent_af", value: "continent_af" },
    { title: "properties.viewport.area.continent_na", value: "continent_na" },
    { title: "properties.viewport.area.continent_sa", value: "continent_sa" },
    { title: "properties.viewport.area.continent_as", value: "continent_as" },
    { title: "properties.viewport.area.continent_au", value: "continent_au" },
    { title: "properties.viewport.area.continent_eu", value: "continent_eu" },
];

export const rotationDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    { title: "properties.rotation.0", value: "0" },
    { title: "properties.rotation.30", value: "30" },
    { title: "properties.rotation.60", value: "60" },
    { title: "properties.rotation.90", value: "90" },
];

export const formatDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    {
        title: "properties.axis.format.inherit",
        value: "inherit",
        info: "properties.axis.format.info.inherit",
    },
];

export const legendPositionDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    { title: "properties.legend.position.up", value: "top", icon: "gd-dropdown-icon-legend-top" },
    { title: "properties.legend.position.down", value: "bottom", icon: "gd-dropdown-icon-legend-bottom" },
    { title: "properties.legend.position.right", value: "right", icon: "gd-dropdown-icon-legend-right" },
    { title: "properties.legend.position.left", value: "left", icon: "gd-dropdown-icon-legend-left" },
];

export const dataLabelsDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.canvas.dataLabels.auto", value: "auto" },
    { type: "separator" },
    { title: "properties.canvas.dataLabels.show", value: true },
    { title: "properties.canvas.dataLabels.hide", value: false },
];

export const dataPointsDropdownLabels: ITranslatedDropdownItem[] = [
    { title: "properties.canvas.dataPoints.auto", value: "auto" },
    { type: "separator" },
    { title: "properties.canvas.dataPoints.show", value: true },
    { title: "properties.canvas.dataPoints.hide", value: false },
];

export const xAxisPositionDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    {
        title: "properties.axis.name.position.left",
        value: "left",
        icon: "gd-dropdown-icon-axis-name-position-left",
    },
    {
        title: "properties.axis.name.position.center",
        value: "center",
        icon: "gd-dropdown-icon-axis-name-position-center",
    },
    {
        title: "properties.axis.name.position.right",
        value: "right",
        icon: "gd-dropdown-icon-axis-name-position-right",
    },
];

export const yAxisPositionDropdownItems: ITranslatedDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    {
        title: "properties.axis.name.position.top",
        value: "top",
        icon: "gd-dropdown-icon-axis-name-position-top",
    },
    {
        title: "properties.axis.name.position.middle",
        value: "middle",
        icon: "gd-dropdown-icon-axis-name-position-middle",
    },
    {
        title: "properties.axis.name.position.bottom",
        value: "bottom",
        icon: "gd-dropdown-icon-axis-name-position-bottom",
    },
];
