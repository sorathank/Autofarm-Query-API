export function getJsonRPCURL(): string {
    return process.env.RPC_URL
}

export function getMasterChefContract(): string {
    return process.env.MASTERCHEF_ADDR
}