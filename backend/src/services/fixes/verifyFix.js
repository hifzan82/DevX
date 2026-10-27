import { verifyFixDetailed } from "./previewVerify.js";

export async function verifyFix(payload = {}) {
  return verifyFixDetailed(payload);
}
