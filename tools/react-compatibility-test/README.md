# React Compatibility Test App

## Overview

This application is designed to test dashboard plugin compatibility during the transition from React 18 to React 19. Use this tool to verify that your plugins work correctly with both React versions before deploying to production.

## Features

- **Dual React Support**: Test plugins against both React 18 and React 19
- **Easy Configuration**: Simple environment-based setup
- **Standalone**: No rush setup required - works independently
- **Plugin Parameters**: Support for testing plugins with custom parameters

## Quick Start

### 1. Setup Repository

```bash
# Clone this repository (if not already done)
git clone <repository-url>
cd sdk/tools/react-compatibility-test
```

### 2. Install Dependencies

```bash
npm install
```

> **Note**: This app is standalone and doesn't require rush setup in the main repository.

### 3. Configure Environment

#### Create `.env` file (based on `.env.template`):

```env
# Backend Configuration
BACKEND_URL=https://your-backend-url.com

# Workspace Configuration
WORKSPACE=your-workspace-id
DASHBOARD_ID=your-dashboard-id

# Plugin Configuration
PLUGIN_BUILD_DIRECTORY=/path/to/your/plugin/esm/dashboardPlugin
MODULE_FEDERATION_NAME=plugin-identification

# Optional: Plugin Parameters
PLUGIN_PARAMETERS_JSON_PATH=/path/to/plugin-parameters.json
```

Note that `MODULE_FEDERATION_NAME` typically matches with the value in `src/metadata.json` of the plugin, for example `dp_myplugin`.

#### Create `.env.secrets` file (based on `.env.secrets.template`):

```env
# Authentication
TIGER_API_TOKEN=your-api-token-here
```

### 4. Test Your Plugin

#### Test with React 18:

```bash
npm run start:react18
```

Visit: https://localhost:8000

#### Test with React 19:

```bash
npm run start:react19
```

Visit: https://localhost:8000

## Configuration Details

| Variable                      | Description                | Required | Example                                     |
| ----------------------------- | -------------------------- | -------- | ------------------------------------------- |
| `BACKEND_URL`                 | Backend server URL         | ✅       | `https://live-examples-proxy.herokuapp.com` |
| `WORKSPACE`                   | Workspace identifier       | ✅       | `demo-workspace`                            |
| `DASHBOARD_ID`                | Dashboard to test against  | ✅       | `dashboard-123`                             |
| `PLUGIN_BUILD_DIRECTORY`      | Path to built plugin files | ✅       | `/home/user/plugin/esm/dashboardPlugin`     |
| `MODULE_FEDERATION_NAME`      | Plugin federation name     | ✅       | `my_custom_plugin`                          |
| `PLUGIN_PARAMETERS_JSON_PATH` | Plugin parameters file     | ❌       | `/path/to/params.json`                      |
| `TIGER_API_TOKEN`             | API authentication token   | ✅       | `your-secret-token`                         |

## Testing Workflow

1. **Build Your Plugin**: Ensure your plugin is built and available in the specified directory
2. **Configure Environment**: Set up `.env` and `.env.secrets` files with your specific values
3. **Test React 18**: Run `npm run start:react18` and verify plugin functionality
4. **Test React 19**: Run `npm run start:react19` and verify plugin functionality
5. **Compare Results**: Ensure consistent behavior across both React versions

## Troubleshooting

- **Plugin not loading**: Verify `PLUGIN_BUILD_DIRECTORY` path and `MODULE_FEDERATION_NAME`
- **Authentication errors**: Check your `TIGER_API_TOKEN` is valid and has proper permissions
- **Build errors**: Ensure your plugin is compatible with the Module Federation setup

## Available Scripts

- `npm run start:react18` - Explicitly start with React 18
- `npm run start:react19` - Start with React 19
