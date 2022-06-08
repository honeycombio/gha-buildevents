# Releasing

`gha-buildevents` follows [the recommendation from the GitHub Actions team](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#versioning): each tag and release has a semantic version (i.e. `v1.0.1`). There is a major version tag (i.e. `v1`) that binds to the latest semantic version. If a new version is released, the major version tag is moved.

Follow these steps to create a new release:

- create a new release from [the Releases page](https://github.com/honeycombio/gha-buildevents/releases)
- assign it a tag with the new version
- make sure to also publish the release to the GitHub Marketplace
- update the major version tag so it points to the latest release
```shell
# with the latest release checked out locally
git tag -fa v1 -m "Update v1 tag"
git push origin v1 --force
```
- all tags can be seen on [the Tags page](https://github.com/honeycombio/gha-buildevents/tags), including the commit they reference
