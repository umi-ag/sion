import * as issuerOld from './issuer-old/structs';
import * as membershipPointer from './membership-pointer/structs';
import * as membershipRegistry from './membership-registry/structs';
import * as membership from './membership/structs';
import * as publicInputs from './public-inputs/structs';
import * as verifier from './verifier/structs';
import { StructClassLoader } from '../_framework/loader';

export function registerClasses(loader: StructClassLoader) {
  loader.register(membershipPointer.MembershipPointer);
  loader.register(issuerOld.Membership);
  loader.register(publicInputs.PublicInputsArgs);
  loader.register(verifier.Groth16VerificationEvent);
  loader.register(membership.Membership);
  loader.register(membership.ContainsClaimEvent);
  loader.register(membership.BoundCheckEvent);
  loader.register(membershipRegistry.MembershipRegistry);
  loader.register(membershipRegistry.ContainsMemberEvent);
}
