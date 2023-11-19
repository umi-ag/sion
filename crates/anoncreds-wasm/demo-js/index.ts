import { rdtsc } from "rdtsc";
import {
  anoncredsCreateCredentialDefinition,
  anoncredsCreateSchema,
  anoncredsSetDefaultLogger,
} from "anoncreds";

anoncredsSetDefaultLogger();

const nowSchema = rdtsc();
const schema = anoncredsCreateSchema("name schema", "1.0", "did:example", ["name"]);
const schemaElapsed = rdtsc() - nowSchema;
console.log(`============== ${schemaElapsed} cycles ================`);

const nowCredDef = rdtsc();
const credDef = anoncredsCreateCredentialDefinition(
  "did:example:123/schema",
  schema,
  "default",
  "did:example:123",
  "CL",
  false
);

console.log(credDef);

const elapsedCredDef = rdtsc() - nowCredDef;
console.log(`============== ${elapsedCredDef} cycles ================`);
