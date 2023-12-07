import fetch from 'cross-fetch';
globalThis.fetch = fetch;

export class ProverClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  boundCheck = async (args: {
    value: bigint;
    lowerBoundGte: bigint;
    upperBoundLt: bigint;
  }) => {
    const response = await fetch(`${this.baseUrl}/gen-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: args.value.toString(),
        lowerBoundGte: args.lowerBoundGte.toString(),
        upperBoundLt: args.upperBoundLt.toString(),
      }),
    })
      .then((response) => response.json())
      .catch((error) => console.error('Error:', error));

    return response as unknown as {
      vk: string;
      public_inputs: string;
      proof: string;
    };
  };
}
