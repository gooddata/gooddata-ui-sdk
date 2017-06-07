# ChartConfig

```js
{
    colors?: String[];
    legend?: {
        enabled?: boolean;
        position?: 'top' | 'left' | 'right' | 'bottom';
    };
}
```

Example of **colors** array:
`['rgba(195, 49, 73, 1)', 'rgba(168, 194, 86, 1)']`

If there are less colors than data points, then the colors will be repeated. E.g. for 2 colors above and 3 data points colors will be used as `['rgba(195, 49, 73, 1)', 'rgba(168, 194, 86, 1)', 'rgba(195, 49, 73, 1)']`.