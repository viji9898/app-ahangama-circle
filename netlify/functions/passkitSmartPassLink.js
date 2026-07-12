import crypto from "crypto";

function base64Url(buffer) {
  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function pkcs7Pad(buffer) {
  const padLength = 16 - (buffer.length % 16 || 16);
  const normalizedPadLength = padLength === 0 ? 16 : padLength;
  return Buffer.concat([
    buffer,
    Buffer.alloc(normalizedPadLength, normalizedPadLength),
  ]);
}

function normalizeDistributionUrl(distributionUrl) {
  return String(distributionUrl || "").replace(/\/+$/, "");
}

function createSmartPassLink({ distributionUrl, encryptionKey, fields }) {
  const normalizedDistributionUrl = normalizeDistributionUrl(distributionUrl);
  if (!normalizedDistributionUrl) {
    throw new Error("PASSKIT_DISTRIBUTION_URL is missing");
  }

  const key = Buffer.from(String(encryptionKey || "").trim(), "hex");
  if (![16, 24, 32].includes(key.length)) {
    throw new Error("PASSKIT_SMARTPASS_KEY must be a valid hex encryption key");
  }

  const iv = crypto.randomBytes(16);
  const payload = pkcs7Pad(Buffer.from(JSON.stringify(fields)));
  const cipher = crypto.createCipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);

  return `${normalizedDistributionUrl}?data=${base64Url(encrypted)}&iv=${iv.toString("hex")}`;
}

export { createSmartPassLink };
