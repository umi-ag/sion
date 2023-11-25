import * as package_1 from '../_dependencies/onchain/0x1/init';
import * as package_2 from '../_dependencies/onchain/0x2/init';
import * as package_eb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0 from '../sion/init';
import { structClassLoaderOnchain as structClassLoader } from './loader';

let initialized = false;
export function initLoaderIfNeeded() {
  if (initialized) {
    return;
  }
  initialized = true;
  package_1.registerClasses(structClassLoader);
  package_2.registerClasses(structClassLoader);
  package_eb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0.registerClasses(
    structClassLoader,
  );
}
