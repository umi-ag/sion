import * as package_1 from "../_dependencies/onchain/0x1/init";
import * as package_2 from "../_dependencies/onchain/0x2/init";
import * as package_522fba54d6e08b32c25f3819629000ea08f8e2986bd610f56326e06549c4f695 from "../sion/init";
import {structClassLoaderOnchain as structClassLoader} from "./loader";

let initialized = false; export function initLoaderIfNeeded() { if (initialized) { return } initialized = true; package_1.registerClasses(structClassLoader);
package_2.registerClasses(structClassLoader);
package_522fba54d6e08b32c25f3819629000ea08f8e2986bd610f56326e06549c4f695.registerClasses(structClassLoader);
 }
