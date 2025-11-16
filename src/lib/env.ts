import "server-only";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(Missing required environment variable: ${name});
  }
  return value;
}

export const env = {
  openAiApiKey: () => requireEnv("OPENAI_API_KEY"),
  lingoApiKey: () => requireEnv("LINGODOTDEV_API_KEY"),
  lingoCliPath: () => process.env.LINGO_CLI_PATH ?? "lingo",
  tempDir: () => {
    if (process.env.SESSION_STORAGE_PATH) {
      return process.env.SESSION_STORAGE_PATH;
    }

    if (process.env.VERCEL) {
      return "/tmp/docsimplify";
    }

    return ".temp";
  }
};