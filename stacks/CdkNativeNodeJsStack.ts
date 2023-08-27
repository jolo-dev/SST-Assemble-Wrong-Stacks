import { Construct } from 'constructs';
import { Stack } from 'sst/constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export class CdkNativeNodeJsStack extends Stack {
  constructor( scope: Construct, id: string ) {
    super( scope, id );

    const lambda = new NodejsFunction( this, 'NodeJsFunction', {
      bundling: {
        format: OutputFormat.ESM,
      },
      entry: 'packages/functions/src/cdkLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
    } );

    new LambdaRestApi( this, 'myapi', {
      handler: lambda,
    } );
  }
}
