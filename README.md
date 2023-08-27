# SST Assemble Wrong Stacks

This is an example repository to show a potential bug.

## CDK Pipeline

The aim is to use [CDK-pipelines](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html) in order to deploy the SST.

SST's CLI has a `--to`- flag which is used to use CDK-pipelines properly
because the `CodeBuildStep` inside the `stacks/PipelineStack.ts` needs to produce a `cdk.out` (see [here](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html#defining-the-pipeline)).
From there it will be consumed by the `Codepipeline`.

## The bug?

The Stack which CDK pipeline should deploy is a REST API consists of one Lambda (simplified here, see `stacks/SstApiStack`).
However, when synthesizing to Cloudformation, the Lambda Function contains not the content but the one below instead:

```json
"Code": {
    "ZipFile": "export function placeholder() {}"
}
```

But when only synthesize, then Cloudformation Template points to the Lambda correctly:

```json
"Code": {
    "S3Bucket": "cdk-hnb659fds-assets-123456789098-eu-central-1",
    "S3Key": "da38819d54f8498559312c94dd501165ed6330daf207b62e4df9fb1d3e7b2d23.zip"
}
```

However, if I use CDK pipelines with native CDK (see `stacks/CdkNativeNodeJsStack.ts`), I get the correct result.

## Reproduce

This repo is to reproduce the issue.
I use [`pnpm`](https://pnpm.io/).

```sh
pnpm install
```

It might that you need to append `--profile my-aws-profile` to each command below.

Each of them will just synthesize Cloudformation to `cdk.out`. If you want to deploy, you can run `npx sst deploy --stage name-from-below`.

### SST with CDK pipelines

```sh
pnpm sst-pipeline # --profile my-aws-profile
```

### SST without CDK pipelines

```sh
pnpm sst-no-pipeline # --profile my-aws-profile
```

### Native CDK with CDK pipelines

```sh
pnpm cdk-pipeline # --profile my-aws-profile
```

The expected result should be similar to [CDK-pipeline output](#native-cdk-with-cdk-pipelines).
