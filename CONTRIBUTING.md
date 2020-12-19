# Contributing

All contributions are welcome, whether they are technical in nature or not. Feel free to [start a Discussion](https://github.com/kvrhdn/gha-buildevents/discussions) or [open an issue](https://github.com/kvrhdn/gha-buildevents/issues) to ask questions, discuss issues or propose enhancements.

## Good to know

Before committing any code changes, execute `npm run all` to compile and package the code. Only the code under `dist/` is executed by GitHub Actions.

## Testing

Since this project is highly dependent on both GitHub Actions and Honeycomb, it's difficult to test locally. Instead, the following workflows should be checked _manually_ to ensure functionality is not broken:

- [**Integration**](https://github.com/kvrhdn/gha-buildevents/actions?query=workflow%3AIntegration): this workflow contains two jobs:
    - **Smoke test** should create a proper trace with a couple of spans. Check to see the additional`github.*` fields are set.
    - **Matrix** is a simple workflow using a build matrix. Check each build creates a unique trace.
- [**Integration Failure**](https://github.com/kvrhdn/gha-buildevents/actions?query=workflow%3A%22Integration+Failure%22) : this run should create a trace in Honeycomb, with `job.status` equal to `failure`.

## Release procedure

`gha-buildevents` follows [the recommendation from the GitHub Actions team](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#versioning): each tag and release has a semantic version (i.e. `v1.0.1`). There is a major version tag (i.e. `v1`) that binds to the latest semantic version. If a new version is released, the major version tag is moved.

Follow these steps to create a new release:

- create a new release from [the Releases page](https://github.com/kvrhdn/gha-buildevents/releases)
- assign it a tag with the new version
- make sure to also publish the release to the GitHub Marketplace
- update the major version tag so it points to the latest release
```shell
# with the latest release checked out locally
git tag -fa v1 -m "Update v1 tag"
git push origin v1 --force
```
- all tags can be seen on [the Tags page](https://github.com/kvrhdn/gha-buildevents/tags), including the commit they reference
