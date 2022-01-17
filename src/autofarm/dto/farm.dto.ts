export interface TokenDto {
    symbol: string,
    address: string,
    balance: number
}

export interface FarmDto {
    tokens: TokenDto[],
    balance: number,
    lpAddress?: string,
    rewards: TokenDto[],
    poolAddress: string,
}