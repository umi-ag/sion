import * as issuerOld from "./issuer-old/structs";
import * as vc from "./vc/structs";
import {StructClassLoader} from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) { loader.register(issuerOld.VC);
loader.register(vc.VC);
 }
