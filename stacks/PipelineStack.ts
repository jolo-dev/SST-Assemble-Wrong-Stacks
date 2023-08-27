import { Stage, StageProps } from 'aws-cdk-lib';
import {
  CodeBuildStep,
  CodeBuildStepProps,
  CodePipeline,
  CodePipelineProps,
  CodePipelineSource,
  IFileSetProducer,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'sst/constructs';

type MyStackProps<Props> = {
  // rome-ignore lint/suspicious/noExplicitAny: It can be generic
  stack: any;
  props: Props;
} & StageProps;

/**
 * Class to roll out stacks from the Pipeline
 * That means, it can only be used within Codepipeline when adding a stage
 * ```ts
 * pipeline.addStage(new MyStack(this, 'GenieAcsStack', {
      stack: GenieAcsStack
    }))
 * ```
 * Ref `MainStack.ts`
 */
export class MyStack<S extends Stack, Props extends StackProps> extends Stage {
  constructor( scope: Construct, id: string, props: MyStackProps<Props> ) {
    super( scope, id, props );
    this.createStack<S, Props>( props.stack, this, id, props.props );
  }

  /**
   * Entity Class Factory by using Generics
   * @param c The class you want to generate
   * @param props the properties the class contains
   * @returns a new created class
   */
  public createStack<Type extends Stack, P extends StackProps>(
    c: new ( scope: Construct, id: string, props: P ) => Type,
    scope: Construct,
    id: string,
    props: P,
  ): Type {
    return new c( scope, id, props );
  }
}

// With this type you can add StackProps as well CodePipelineProps and the region is necessary
type PipelineStackProps = Omit<StackProps, 'env'> &
  Omit<CodePipelineProps, 'crossAccountKeys' | 'synth' | 'pipelineName'> & {
    pipelineName: string;
    branch: string;
    input?: IFileSetProducer;
    commands?: string[];
    shellStepSynth?: Omit<CodeBuildStepProps, 'input' | 'commands'>;
    repositoryArn?: string;
  };

/*
  It creates a CodePipeline that pulls from a CodeCommit repository, runs a build action, and then
  deploys the build artifacts to an S3 bucket.
  Source --> Build --> Dev Deployment (TODO) --> Stage Deployment (TODO)
  --> Manual Approval (TODO) --> Integration Test (TODO)
  --> Manual Approval (TODO) --> Prod Deployment (TODO)
*/
export class PipelineStack extends Stack {
  readonly pipeline: CodePipeline;
  constructor( scope: Construct, id: string, props: PipelineStackProps ) {
    super( scope, id, props );


    const synth = new CodeBuildStep( 'Synth', {
      input:
        props.input ?? CodePipelineSource.gitHub( 'jolo-dev/SST-Assemble-Wrong-Stacks', 'main' ), // default the codecommit
      commands: props.commands ?? ['npx sst build --to cdk.out'], // default the yarn commands to install dependencies for CDK with Typescript.
      ...props.shellStepSynth,
    } );

    this.pipeline = new CodePipeline( this, `${props.pipelineName}-Pipeline`, {
      crossAccountKeys: true,
      synth,
      ...props,
    } );
  }
}
