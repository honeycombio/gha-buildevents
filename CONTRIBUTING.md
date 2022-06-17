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

Pull requests to this project from forks will not have workflows run automatically. A maintainer will be along to review and run the CI soon after a PR is opened.

### Note to Maintainers:

Sadly, GitHub is not showing us the "Approve and run" button for workflows. Our workaround: checkout the PR's branch, push it directly to this repository with a specific name, see the CI run, then delete the branch. An easy way to do this is with [the GitHub CLI](https://cli.github.com/).

```
# be in a clone of this repository
» cd gha-buildevents

# checkout pull request #42
» gh pr checkout 42

# rename the checkedout branch to test-<pr number> to avoid branch name conflicts
» git branch -m test-42

# push the branch to origin
» git push origin test-42
```

This pushes the same commits as exist on the pull request. Actions will run and apply check statuses on the latest commit which matches the commit sha for the PR so the status will apply to the PR as well.
