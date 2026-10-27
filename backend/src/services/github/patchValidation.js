import { createHash } from "node:crypto";

const MAX_FILE_BYTES = 250_000;

const ALLOWED_EXTENSIONS = /\.(jsx|tsx|js|ts|html|css|scss|vue|svelte)$/i;

export function validateSourcePath(path) {
  if (
    typeof path !== "string" ||
    path.length > 500 ||
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path.includes("\0") ||
    path.split("/").some((part) => part === ".." || part === ".")
  ) {
    throw new Error("Invalid repository file path.");
  }

  if (!ALLOWED_EXTENSIONS.test(path)) {
    throw new Error("Unsupported source file type.");
  }

  if (
    path
      .split("/")
      .some((part) => [".git", "node_modules", "dist", "build"].includes(part))
  ) {
    throw new Error("This repository path cannot be modified.");
  }

  return path;
}

export function hashContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function buildReviewedPatch({
  path,
  originalContent,
  originalSnippet,
  replacementSnippet,
  expectedHash,
}) {
  validateSourcePath(path);

  if (
    typeof originalContent !== "string" ||
    typeof originalSnippet !== "string" ||
    typeof replacementSnippet !== "string" ||
    !originalSnippet.trim() ||
    !replacementSnippet.trim()
  ) {
    throw new Error("A valid source replacement is required.");
  }

  if (Buffer.byteLength(originalContent) > MAX_FILE_BYTES) {
    throw new Error("Source file exceeds the patch size limit.");
  }

  const actualHash = hashContent(originalContent);

  if (actualHash !== expectedHash) {
    throw new Error("The source file changed. Regenerate the patch.");
  }

  const first = originalContent.indexOf(originalSnippet);

  if (
    first === -1 ||
    originalContent.indexOf(originalSnippet, first + originalSnippet.length) !==
      -1
  ) {
    throw new Error(
      "The source snippet is missing or ambiguous. Manual mapping is required.",
    );
  }

  const updatedContent =
    originalContent.slice(0, first) +
    replacementSnippet +
    originalContent.slice(first + originalSnippet.length);

  if (updatedContent === originalContent) {
    throw new Error("The proposed patch makes no changes.");
  }

  return {
    path,
    originalHash: actualHash,
    updatedHash: hashContent(updatedContent),
    originalContent,
    updatedContent,
    approved: false,
  };
}
