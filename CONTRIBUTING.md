# Contributing

All contributions are welcome, whether they are technical in nature or not. Feel free to open a new issue to ask questions, discuss issues or propose enhancements.

## Good to know

Before committing any code changes, execute `npm run all` to compile and package the code. Only the code under `dist/` is executed by GitHub Actions.

## Testing

Since this project is highly dependent on both GitHub Actions and Honeycomb, it's difficult to test locally. Instead, the following workflows should be checked _manually_ to ensure functionality is not broken:

- [**Integration**](https://github.com/kvrhdn/gha-buildevents/actions?query=workflow%3AIntegration): this run should create a proper trace in Honeycomb.
- [**Integration Failure**](https://github.com/kvrhdn/gha-buildevents/actions?query=workflow%3A%22Integration+Failure%22) : this run should create a trace in Honeycomb, with `job.status` equal to `failure`.
