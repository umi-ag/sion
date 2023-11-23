import { decode, encode } from "cbor-x";

const json = { hello: "world", number: 123 };
{
  let serializedAsBuffer = encode(json);
  let data = decode(serializedAsBuffer);
  console.log(data);
}
{
  let serializedAsBuffer = encode(json);
  let hex = serializedAsBuffer.toString("hex");
  let bytes = Buffer.from(hex, "hex");
  let data = decode(bytes);
  console.log(data);
}
