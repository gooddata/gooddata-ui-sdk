module.exports = {
    addons: ["@storybook/addon-actions", "@storybook/preset-scss"],
    stories: ["../stories/generated.stories.js"],
    features: {
        // suppress the warning with deprecated implicit PostCSS loader, we do not need it anyway
        // this makes the eventual upgrade to Storybook 7 easier since we opt-out of the deprecated feature explicitly
        postcss: false,
    },
};
