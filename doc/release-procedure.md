# Release procedure

`gha-buildevents` follows [the recommendation from the GitHub Actions team](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#versioning), namely that each release has a semantic version (i.e. `v1.0.1`). We also provide a major version tag (i.e. `v1`) that binds to the latest semantic version.

Follow these steps to create a new release:
- create a new release from the Relases page.
- assign it a tag with semantic version.
- create or update the major version tag so it points to the latest release:
```
git tag -fa v1 -m "Update v1 tag"
git push origin v1 --force
```
