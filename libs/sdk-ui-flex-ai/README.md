# Gooddata FlexAI SDK

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-flex-ai)](https://www.npmjs.com/@gooddata/sdk-ui-flex-ai)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-flex-ai)](https://npmcharts.com/compare/@gooddata/sdk-ui-flex-ai?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides a set of React-based UI components and hooks for FlexAI chatbot and other AI-based functionality.

Example usage:

```tsx
import { FlexAIChat } from "@gooddata/sdk-ui-flex-ai";
import "@gooddata/sdk-ui-flex-ai/styles/css/main.css";

const App = () => {
    return <FlexAIChat workspaceId="your-workspace-id" backend={tigerBackend} />;
};
```

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-all/LICENSE).
