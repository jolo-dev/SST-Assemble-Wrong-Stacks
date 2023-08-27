import { Construct } from 'constructs';
import { Api, Stack } from 'sst/constructs';

export class SstApiStack extends Stack {
  constructor( scope: Construct, id: string ) {
    super( scope, id );

    new Api( this, 'Api', {
      routes: {
        'GET /': 'packages/functions/src/sstLambda.handler',
      }
    } )
  }
}
