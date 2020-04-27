# `gha-buildevents` Action

![Integration](https://github.com/kvrhdn/gha-buildevents/workflows/Integration/badge.svg)

This GitHub Action installs and initializes [Honeycomb's buildevents tool][buildevents]. It populates the trace with metadata from the workflow and will always send a span for the entire build, even if the build failed.

To learn more about buildevents and how to use it properly, checkout [honeycombio/buildevents][buildevents].

⚠️ This action is still in development, for now use the version from the master branch `kvrhdn/gha-buildevents@master`. I plan to introduce a `v1` tag eventually.

[buildevents]: https://github.com/honeycombio/buildevents

## TODO

- [ ] add a parameter to disable sending a span on success
- [ ] add a parameter to customize build ID
- [ ] provide a mechanism to provide additional fields (through the BUILDEVENT_FILE env variable)

## How to use it

Run the action somewhere in the beginning of your worflow. `gha-buildevents` needs an API key to send traces to Honeycomb.

```yaml
- uses: kvrhdn/gha-buildevents@master
  with:
    apikey: ${{ secrets.BUILDEVENTS_APIKEY }}
    dataset: gha-buildevents_integration

... the rest of your job ...

  # At this to the end of your job
- run: echo ::set-env name::BUILD_SUCCESS::true

  # 'buildevents build' will automatically run as a post action
```

From then on `buildevents` is present on the path. `gha-buildevents` sets an environment varible `BUILD_ID` (this currently defaults to the run number). The build ID should be used with all buildevents commands to ensure the trace is continued.

```yaml
  # Set the step ID that will be used for all cmds that are part of this step and record when the step started
- run: |
    echo ::set-env name=STEP_ID::0
    echo ::set-env name=STEP_START::$(date +%s)

  # Wrap the commands that should be traced with 'buildevents cmd'
- run: |
    buildevents cmd $BUILD_ID $STEP_ID sleep-5 -- sleep 5

  # Wrap up the step
- run: |
    buildevents step $BUILD_ID $STEP_ID $STEP_START 'step 1'
```

## Example

This repository has its own workflow which will run every 15 minutes. See [.github/workflows/integration.yaml](./.github/workflows/integration.yaml).

This workflow will create the following trace in Honeycomb:

![Trace created in Honeycomb](./example-trace.png)

### Inputs

Name      | Required | Description                                         | Type   | Default
----------|----------|-----------------------------------------------------|--------|--------
`apikey`  | yes      | API key used to communicate with the Honeycomb API. | string | 
`dataset` | no       | Honeycomb dataset to use.                           | string |

### Outputs

No outputs are set, but the following environment variables are set:

- `BUILD_ID`: the build ID used, this defaults to the run number and should used in all invocation of `buildevents`

## License

This Action is distributed under the terms of the MIT license, see [LICENSE](./LICENSE) for details.
