---
title: Hooks
weight: 60
description: Choose the matching React hook to read an SDK provider context or load a plugin-enhanced dashboard.
diataxis_type: reference
type: docs
section: Integrations
subsection: Hooks
section_overview: true
---

React hooks for the SDK context providers: backend, workspace, organization, and theme. Each reads from the matching `*Provider` higher in the component tree, so you don't pass these values down through props.

`useBackend`, `useWorkspace`, and `useTheme` take an optional value that overrides the context. Their strict variants, `useBackendStrict` and `useWorkspaceStrict`, throw when neither the argument nor the provider supplies a value. To load and render a dashboard with its plugins, use `useDashboardLoader`.
