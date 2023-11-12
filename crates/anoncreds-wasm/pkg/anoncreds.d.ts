/* tslint:disable */
/* eslint-disable */
/**
* @returns {number}
*/
export function anoncredsSetDefaultLogger(): number;
/**
* @param {string} name
* @param {string} version
* @param {string} issuer_id
* @param {any[]} attribute_names
* @returns {any}
*/
export function anoncredsCreateSchema(name: string, version: string, issuer_id: string, attribute_names: any[]): any;
/**
* @param {string} schema_id
* @param {any} schema
* @param {string} tag
* @param {string} issuer_id
* @param {string} signature_type
* @param {boolean} support_revocation
* @returns {any[]}
*/
export function anoncredsCreateCredentialDefinition(schema_id: string, schema: any, tag: string, issuer_id: string, signature_type: string, support_revocation: boolean): any[];
/**
* @param {any} json
* @returns {boolean}
*/
export function anoncredsValidateCredentialDefinitionFromJson(json: any): boolean;
/**
*/
export enum ErrorCode {
  Success = 0,
  Input = 1,
  IOError = 2,
  InvalidState = 3,
  Unexpected = 4,
  CredentialRevoked = 5,
  InvalidUserRevocId = 6,
  ProofRejected = 7,
  RevocationRegistryFull = 8,
}
