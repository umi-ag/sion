import * as issuerOld from "./issuer-old/structs";
import * as membershipRegistry from "./membership-registry/structs";
import * as publicInputs from "./public-inputs/structs";
import * as vcOld from "./vc-old/structs";
import * as vc from "./vc/structs";
import * as verifier from "./verifier/structs";
import {StructClassLoader} from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) { loader.register(issuerOld.VC);
loader.register(publicInputs.PublicInputsArgs);
loader.register(verifier.Groth16VerificationEvent);
loader.register(vc.VC);
loader.register(vc.ContainsClaimEvent);
loader.register(vc.BoundCheckEvent);
loader.register(membershipRegistry.MembershipRegistry);
loader.register(vcOld.VC);
 }
