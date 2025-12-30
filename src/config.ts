function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export const config = {
  productUrl:
    "https://www.derbysf.com/ja-jp/collections/classic-derby-jacket-style-300/products/classical-derby-black",
  productJsonUrl:
    "https://www.derbysf.com/ja-jp/collections/classic-derby-jacket-style-300/products/classical-derby-black.json",
  targetVariantId: 924781853,

  pushover: {
    appToken: getEnvOrThrow("PUSHOVER_API_TOKEN"),
    userKey: getEnvOrThrow("PUSHOVER_USER_KEY"),
  },

  dryRun: process.env.DRY_RUN === "true",
};
