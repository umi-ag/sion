import * as package_1 from "../_dependencies/onchain/0x1/init";
import * as package_2 from "../_dependencies/onchain/0x2/init";
import * as package_773580dec6d115c6cceb88b727e6cc14db88294e8f7294a6caf1cbc2c1f76c7c from "../sion/init";
import {structClassLoaderOnchain as structClassLoader} from "./loader";

let initialized = false; export function initLoaderIfNeeded() { if (initialized) { return }; initialized = true; package_1.registerClasses(structClassLoader);
package_2.registerClasses(structClassLoader);
package_773580dec6d115c6cceb88b727e6cc14db88294e8f7294a6caf1cbc2c1f76c7c.registerClasses(structClassLoader);
 }
