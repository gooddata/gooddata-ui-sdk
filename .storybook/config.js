import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';

import pkg from '../package.json';

const req = require.context('../stories', true, /\.tsx?$/);

function loadStories() {
    req.keys().forEach(filename => req(filename));
}

setOptions({
    name: `React Components v${pkg.version} ${__COMMIT_HASH__}`,
    downPanelInRight: true
});

configure(loadStories, module);
