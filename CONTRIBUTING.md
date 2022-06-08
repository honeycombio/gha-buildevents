# Contributing Guide

Please see our [general guide for OSS lifecycle and practices.](https://github.com/honeycombio/home/blob/main/honeycomb-oss-lifecycle-and-practices.md)

All contributions are welcome, whether they are technical in nature or not. Feel free to [start a Discussion](https://github.com/honeycombio/gha-buildevents/discussions) or [open an issue](https://github.com/honeycombio/gha-buildevents/issues) to ask questions, discuss issues or propose enhancements.

## Good to know

Before committing any code changes, execute `npm run all` to compile and package the code. Only the code under `dist/` is executed by GitHub Actions.

## Testing

Since this project is highly dependent on both GitHub Actions and Honeycomb, it's difficult to test locally. Instead, the following workflows should be checked _manually_ to ensure functionality is not broken:

- [**Integration**](https://github.com/honeycombio/gha-buildevents/actions?query=workflow%3AIntegration): this workflow contains two jobs:
    - **Smoke test** should create a proper trace with a couple of spans. Check to see the additional`github.*` fields are set.
    - **Matrix** is a simple workflow using a build matrix. Check each build creates a unique trace.
- [**Integration Failure**](https://github.com/honeycombio/gha-buildevents/actions?query=workflow%3A%22Integration+Failure%22) : this run should create a trace in Honeycomb, with `job.status` equal to `failure`.
