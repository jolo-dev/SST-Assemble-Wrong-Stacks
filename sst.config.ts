import { SSTConfig } from "sst";
import { MyStack, PipelineStack } from './stacks/PipelineStack';
import { CdkNativeNodeJsStack } from './stacks/CdkNativeNodeJsStack';
import { StackProps } from 'sst/constructs';
import { SstApiStack } from './stacks/SstApiStack';

export default {
  config( _input ) {
    return {
      name: "SST-Assemble-Wrong-Stacks",
      region: "eu-central-1",
    };
  },
  stacks( app ) {
    const foo = new PipelineStack( app, "PipelineStack", {
      branch: 'main',
      pipelineName: 'SST-Assemble-Wrong-Stacks',
    } )

    if ( app.stage === 'cdk-pipeline' ) {
      foo.pipeline.addStage( new MyStack<CdkNativeNodeJsStack, StackProps>( app, 'CdkNativeNodeJsStack', {
        props: {},
        stack: CdkNativeNodeJsStack,
      } ) )
    }

    if ( app.stage === 'sst-no-pipeline' ) {
      new SstApiStack( app, 'SstApiStack' )
    }

    if ( app.stage === 'sst-pipeline' ) {
      foo.pipeline.addStage( new MyStack<SstApiStack, StackProps>( app, 'SstApiStack', {
        props: {},
        stack: SstApiStack,
      } ) )
    }
  }
} satisfies SSTConfig;
