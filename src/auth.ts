export function resolveApiKey(environment: NodeJS.ProcessEnv = process.env): string | undefined {
    return environment.BEE_API_KEY?.trim() || undefined;
}
