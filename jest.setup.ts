import "@testing-library/jest-dom";
import { webcrypto } from "crypto";

// jsdom 環境で crypto.randomUUID を使えるようにする
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    writable: false,
  });
}
