// (C) 2019 GoodData Corporation
import { IDropdownItem } from "../components/configurationControls/DropdownControl";

export const rotationDropdownItems: IDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    { title: "properties.rotation.0", value: "0" },
    { title: "properties.rotation.30", value: "30" },
    { title: "properties.rotation.60", value: "60" },
    { title: "properties.rotation.90", value: "90" },
];

export const legendPositionDropdownItems: IDropdownItem[] = [
    { title: "properties.auto_default", value: "auto" },
    { type: "separator" },
    { title: "properties.legend.position.up", value: "top", icon: "dropdown-icon-legend-top" },
    { title: "properties.legend.position.down", value: "bottom", icon: "dropdown-icon-legend-bottom" },
    { title: "properties.legend.position.right", value: "right", icon: "dropdown-icon-legend-right" },
    { title: "properties.legend.position.left", value: "left", icon: "dropdown-icon-legend-left" },
];

export const dataLabelsDropdownItems: IDropdownItem[] = [
    { title: "properties.canvas.dataLabels.auto", value: "auto" },
    { type: "separator" },
    { title: "properties.canvas.dataLabels.show", value: true },
    { title: "properties.canvas.dataLabels.hide", value: false },
];
