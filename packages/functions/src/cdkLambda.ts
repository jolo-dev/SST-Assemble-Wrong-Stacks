export async function handler() {
    return {
        statusCode: 200,
        body: JSON.stringify( 'This is a CDK Native Lambda' ),
    };
}