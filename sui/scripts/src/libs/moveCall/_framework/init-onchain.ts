import * as package_1 from "../_dependencies/onchain/0x1/init";
import * as package_2 from "../_dependencies/onchain/0x2/init";
import * as package_30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725 from "../sion/init";
import {structClassLoaderOnchain as structClassLoader} from "./loader";

let initialized = false; export function initLoaderIfNeeded() { if (initialized) { return }; initialized = true; package_1.registerClasses(structClassLoader);
package_2.registerClasses(structClassLoader);
package_30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725.registerClasses(structClassLoader);
 }
