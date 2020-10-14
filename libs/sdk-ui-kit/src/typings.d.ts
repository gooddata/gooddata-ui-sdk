// (C) 2020 GoodData Corporation
declare module "react-native-listener";
declare module "fixed-data-table-2";

declare module "@gooddata/goodstrap/lib/core/immutable" {
    export function propsEqual(props: any, nextProps: any): boolean;
}

declare module "@gooddata/goodstrap/lib/data/date" {
    export function getDateTimeConfig(date: any, options: any): any;
}
