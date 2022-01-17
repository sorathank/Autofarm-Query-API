import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Contract, ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json'
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import * as multicall from 'ethers-multicall'
import { ChainConnectorService } from 'src/chain-connector/chain-connector.service';
import { getAutofarmMasterChefAddr } from 'src/config/rpc.config';
import { Pool, Token, TokenType } from './entities/pool.entity';
import { FarmDto, TokenDto } from './dto/farm.dto';
import { hexToNumber } from 'src/utils/utils';
import { lookup } from 'dns';

@Injectable()
export class AutofarmService {
    private masterchef: Contract;

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private chainConnector: ChainConnectorService,
    ) {
        this.masterchef = this.chainConnector.getContract(getAutofarmMasterChefAddr(), MASTERCHEF_ABI);
    }

    async updateCache() {
        const latestPoolLength = await this.getPoolLength();
        var pools = Array.from({length: latestPoolLength - 1}, (_, i) => i + 1).map(
            poolId => this.fetchPoolInfo(poolId)
        );
        
        var resp = await Promise.allSettled(pools);
        var cache = Promise.allSettled(resp.map((pool, idx) => {
            if (pool.status === 'fulfilled') {
                return this.fetchTokenInfo(pool.value, idx)
            }
            return
        }))

        const cachedData: Pool[] = (await cache).map(pool => pool.status === 'fulfilled' && pool.value)
        
        this.cacheManager.set('autofarmPools', cachedData);
        return cachedData;
    }

    async getCache(): Promise<Pool[]>{
        return (await this.cacheManager.get('autofarmPools'));
    }

    async getAddressInformation(addr: string): Promise<FarmDto[]> {
        const cache: Pool[] = await this.getCache();
        var farmsDto: Promise<FarmDto>[] = [];
        farmsDto = cache.map(async pool => {
            if (pool) {
                const stakedToken = hexToNumber(await this.masterchef.stakedWantTokens(pool.poolId, addr));
                if (stakedToken > 0) {
                    return this.fetchFarmingAsset(pool, stakedToken, addr)
                }
            }
        })

        const res = ((await Promise.allSettled(farmsDto)).map(x => x.status === 'fulfilled' && x.value))
        return res.filter(x => !!x);
    }

    private async getPoolLength(): Promise<number> {
        return parseInt((await this.masterchef.poolLength())._hex, 16);
    }

    private async fetchPoolInfo(n: number) {
        return this.masterchef.poolInfo(n);
    }

    private async fetchTokenInfo(poolInfo, poolId: number) {
        const addr: string = poolInfo.want;
        const strat: string = poolInfo.strat;
        var pool: Pool = {
            poolId: poolId + 1,
            strat: strat
        };
        const lpContract: Contract = this.chainConnector.getContract(addr, CAKELP_ABI)
        const tokens = await Promise.allSettled([lpContract.token0(), lpContract.token1()]);
        if (tokens[0].status === 'fulfilled' && tokens[1].status === 'fulfilled') {
            const tokenAddresses = await Promise.allSettled(tokens.map(async x => {
                if (x.status === 'fulfilled'){
                    return await this.fetchERC20Info(x.value);
                }
            }))
            
            const tokenInfos = tokenAddresses.map(token => (token.status === 'fulfilled' && (token.value)));
            pool.lpAddress = addr;
            pool.lpDecimals = await lpContract.decimals();
            pool.token0 = tokenInfos[0];
            pool.token1 = tokenInfos[1];
            pool.type = TokenType.LP;
            
        }
        else {
            pool.token = await this.fetchERC20Info(addr)
            pool.type = TokenType.Single;
        }
        return pool;
            
    }

    private async fetchERC20Info(addr: string): Promise<Token>{
        const erc20Token: Contract = this.chainConnector.getContract(addr, ERC20_ABI);
        
        try {
            var token: Token = {
                address: addr,
                decimal: await erc20Token.decimals(),
                symbol: await erc20Token.symbol()
            };
            return token
        }
        catch(e){
            console.log('-- [WARNING]: Cannot Fetch', addr, 'With data', e.error.requestBody.params[0].data)
            return null
        }
    }

    private async fetchFarmingAsset(pool: Pool, stakedToken: number, addr: string) {
        const multicallMasterChef: multicall.Contract = this.chainConnector.getMulticallContract(this.masterchef.address, MASTERCHEF_ABI);
        const provider: multicall.Provider = this.chainConnector.getMulticallProvider();
        if (pool.type === TokenType.LP){
            const lpContract: multicall.Contract = this.chainConnector.getMulticallContract(pool.lpAddress, CAKELP_ABI);
            const token0Contract: multicall.Contract = this.chainConnector.getMulticallContract(pool.token0.address, ERC20_ABI);
            const token1Contract: multicall.Contract = this.chainConnector.getMulticallContract(pool.token1.address, ERC20_ABI);
            const [
                lpTotalSupply, 
                lpToken0Balance, 
                lpToken1Balance,
                pendingReward] = await provider.all(
                    [
                        lpContract.totalSupply(),
                        token0Contract.balanceOf(pool.lpAddress),
                        token1Contract.balanceOf(pool.lpAddress),
                        multicallMasterChef.pendingAUTO(pool.poolId, addr)
                    ]
                )
            
            const shareRatio = stakedToken/lpTotalSupply
            const token0Dto: TokenDto = {
                symbol: pool.token0.symbol,
                address: pool.token0.address,
                balance: shareRatio * lpToken0Balance / 10**(pool.token0.decimal)
            }
            const token1Dto: TokenDto = {
                symbol: pool.token1.symbol,
                address: pool.token1.address,
                balance: shareRatio * lpToken1Balance / 10**(pool.token1.decimal)
            }

            const rewards: TokenDto[] = pendingReward == 0? [] : [{
                symbol: "AUTO",
                address: "0xa184088a740c695e156f91f5cc086a06bb78b827",
                balance: pendingReward
            }]

            const res: FarmDto = {
                tokens: [token0Dto, token1Dto],
                balance: stakedToken / 10**pool.lpDecimals,
                lpAddress: pool.lpAddress,
                rewards: rewards,
                poolAddress: '0x0895196562C7868C5Be92459FaE7f877ED450452'
            }

            return res
        }
        else if (pool.type == TokenType.Single){
            const [pendingReward] = await provider.all([multicallMasterChef.pendingAUTO(pool.poolId, addr)])

            const rewards: TokenDto[] = pendingReward == 0? [] : [{
                symbol: "AUTO",
                address: "0xa184088a740c695e156f91f5cc086a06bb78b827",
                balance: pendingReward
            }]

            const tokenDto: TokenDto = {
                symbol: pool.token.symbol,
                address: pool.token.address,
                balance: stakedToken / 10**pool.token.decimal,
            }
            
            const res: FarmDto = {
                tokens: [tokenDto],
                balance: stakedToken / 10**pool.token.decimal,
                rewards: rewards,
                poolAddress: '0x0895196562C7868C5Be92459FaE7f877ED450452'
            }
            return res;
            
        }

    }
}
