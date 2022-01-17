export interface Token {
    address: string,
    decimal: number,
    symbol: string
}

export enum TokenType {
    LP = "lp",
    Single = "single"
}
export interface Pool {
    poolId: number,
    strat?: string,

    // LP
    lpAddress?: string,
    lpDecimals?: number,

    // Token
    token?: Token,
    token0?: Token,
    token1?: Token,

    type?: TokenType
}