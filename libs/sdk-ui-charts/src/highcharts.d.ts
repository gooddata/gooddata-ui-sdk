// (C) 2024-2025 GoodData Corporation

//Should be removed after this will be resolved https://github.com/highcharts/highcharts-react/issues/521
declare module "highcharts/esm/highcharts.js" {
    import { Chart, correctFloat, css, setOptions, wrap } from "highcharts";
    export { Chart, wrap, setOptions, css, correctFloat };
}
