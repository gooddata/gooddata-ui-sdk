# Gooddata GenAI SDK

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-gen-ai)](https://www.npmjs.com/@gooddata/sdk-ui-gen-ai)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-gen-ai)](https://npmcharts.com/compare/@gooddata/sdk-ui-gen-ai?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides a set of React-based UI components and hooks for GenAI chatbot and other AI-based functionality.

Example usage:

```tsx
import { GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const App = () => {
    return <GenAIAssistant workspaceId="your-workspace-id" backend={tigerBackend} />;
};
```

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-all/LICENSE).
