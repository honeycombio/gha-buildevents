# Releasing

`gha-buildevents` follows [the recommendation from the GitHub Actions team](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#versioning): each tag and release has a semantic version (i.e. `v1.0.1`). There is a major version tag (i.e. `v1`) that binds to the latest semantic version. If a new version is released, the major version tag is moved.

Follow these steps to create a new release:

- Use `npm version --no-git-tag-version` to update the version number using `major`, `minor`, `patch`, or the prerelease variants `premajor`, `preminor`, or `prepatch`.
  For example, to bump from v1.1.1 to the next patch version:

```shell
> npm version --no-git-tag-version patch # 1.1.1 -> 1.1.2
```

- Confirm the version number update appears in package.json and package-lock.json.
- Update `CHANGELOG.md` with the changes since the last release. Consider automating with a command such as these two:
  - `git log $(git describe --tags --abbrev=0)..HEAD --no-merges --oneline > new-in-this-release.log`
  - `git log --pretty='%C(green)%d%Creset- %s | [%an](https://github.com/)'`
- Commit changes, push, and open a release preparation pull request for review.
- Once the pull request is merged, fetch the updated `main` branch.
- Apply a tag for the new version on the merged commit (e.g. `git tag --annotate v2.3.1 --message "v2.3.1"`)
- Push the tag upstream (this will kick off the release pipeline in CI) e.g. `git push origin v2.3.1`
- Create a new release from [the Releases page](https://github.com/honeycombio/gha-buildevents/releases)
  - check the "Publish this release to the GitHub Marketplace" box
  - choose the version tag created above
  - release title matches version number
  - copy and paste the changelog entry for this version into the release description
- Update the major version tag so it points to the latest release
  - example in the steps above is releasing v2.3.1, so the major version tag to update would be v2

```shell
# checkout release-tagged commit
git checkout v2.3.1
# create a new v2 tag pointing to this commit, replacing any previous v2 tag
git tag --force --annotate v2 --message "Update v2 tag"
# push the new v2 tag to the repo, replacing any previous v2 tag
git push origin v2 --force
```

- Review the tags on [the Tags page](https://github.com/honeycombio/gha-buildevents/tags), including the commit they reference
