import * as package_1 from "../_dependencies/onchain/0x1/init";
import * as package_2 from "../_dependencies/onchain/0x2/init";
import * as package_b905cffb978c84e2fd6c490f00a4c4659d0ee9eb25f77ae90c9f10caff9d3115 from "../sion/init";
import {structClassLoaderOnchain as structClassLoader} from "./loader";

let initialized = false; export function initLoaderIfNeeded() { if (initialized) { return }; initialized = true; package_1.registerClasses(structClassLoader);
package_2.registerClasses(structClassLoader);
package_b905cffb978c84e2fd6c490f00a4c4659d0ee9eb25f77ae90c9f10caff9d3115.registerClasses(structClassLoader);
 }
