import { BadRequestException, CACHE_MANAGER, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json'
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { ChainConnectorService } from 'src/chain-connector/chain-connector.service';
import { getAutofarmMasterChefAddr } from 'src/config/rpc.config';
import { Pool, Token, TokenType } from './entities/pool.entity';
import { FarmDto, TokenDto } from './dto/farm.dto';
import { isAddress } from 'ethers/lib/utils';
import { Contract, Provider } from 'ethers-multicall';

@Injectable()
export class AutofarmService {
    private masterchef: Contract;
    private provider: Provider;

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private chainConnector: ChainConnectorService,
    ) {
        this.provider = this.chainConnector.getMulticallProvider();
        this.masterchef = this.chainConnector.getMulticallContract(getAutofarmMasterChefAddr(), MASTERCHEF_ABI);
    }

    async updateCache() {
        const latestPoolLength = await this.getPoolLength();
        var poolIds = Array.from({length: latestPoolLength - 1}, (_, i) => i + 1).map(
            poolId => this.masterchef.poolInfo(poolId)
        );
        const pools = await this.provider.all(poolIds)
        const fetchList: Promise<Pool>[] = pools.map((pool, idx) => 
            pool && this.fetchTokenInfo(pool, idx + 1)
        )
        var cache = await Promise.allSettled(fetchList);
        const cachedData: Pool[] =  cache.map(pool => pool.status === 'fulfilled' && pool.value)
        this.cacheManager.set('autofarmPools', cachedData);
        return cachedData;
    }

    async getCache(): Promise<Pool[]>{
        return (await this.cacheManager.get('autofarmPools'));
    }

    async validateCacheAndInput(addr: string): Promise<boolean> {
        const cache: Pool[] = await this.getCache();
        if (cache == null) {
            throw new ServiceUnavailableException("Cache is empty.")
        }

        if (!isAddress(addr)) {
            throw new BadRequestException("Invalid Address")
        }
        return true;
    }

    async getAddressInformation(addr: string): Promise<FarmDto[]> {
        const cache: Pool[] = await this.getCache();
        
        var farmsDto: Promise<FarmDto>[] = [];

        farmsDto = cache.map(async pool => {
            if (pool) {
                const balanceOfStaked = await this.provider.all([this.masterchef.stakedWantTokens(pool.poolId, addr)])
                const stakedToken = parseInt(balanceOfStaked[0]._hex, 16);
                if (stakedToken > 0) {
                    return this.fetchFarmingAsset(pool, stakedToken, addr)
                }
            }
        })

        const res = ((await Promise.allSettled(farmsDto)).map(x => x.status === 'fulfilled' && x.value))
        return res.filter(x => !!x);
    }

    private async getPoolLength(): Promise<number> {
        const length = (await this.provider.all([this.masterchef.poolLength()]))[0]._hex;
        return parseInt(length, 16);
    }

    private async fetchTokenInfo(poolInfo, poolId: number) {
        const addr: string = poolInfo.want;
        const strat: string = poolInfo.strat;
        var pool: Pool = {
            poolId: poolId,
            strat: strat
        };
        const lpMulticall: Contract = this.chainConnector.getMulticallContract(addr, CAKELP_ABI)
        const multicallProvider: Provider = this.chainConnector.getMulticallProvider();
        try {
            const [token0, token1, lpDecimals] = await multicallProvider.all([
                lpMulticall.token0(),
                lpMulticall.token1(),
                lpMulticall.decimals()
            ]);

            const tokens = [token0, token1]
            const fetchList = tokens.map(x => this.fetchERC20Info(x))
            const fetchedTokens = await Promise.allSettled(fetchList);
            
            const tokenInfos = fetchedTokens.map(token => (token.status === 'fulfilled' && (token.value)));
            pool.lpAddress = addr;
            pool.lpDecimals = lpDecimals;
            pool.token0 = tokenInfos[0];
            pool.token1 = tokenInfos[1];
            pool.type = TokenType.LP;
                
            
        }catch(e) {
            pool.token = await this.fetchERC20Info(addr)
            pool.type = TokenType.Single;
        }
        
        return pool;
            
    }

    private async fetchERC20Info(addr: string): Promise<Token>{
        const erc20Token: Contract = this.chainConnector.getMulticallContract(addr, ERC20_ABI);
        const provider: Provider = this.chainConnector.getMulticallProvider();
        
        try {
            const [decimal, symbol] = await provider.all([erc20Token.decimals(), erc20Token.symbol()]);
            var token: Token = {
                address: addr,
                decimal: decimal,
                symbol: symbol
            };
            return token
        }
        catch(e){
            console.log('-- [WARNING]: Cannot Fetch', addr, 'With data', e.error.requestBody.params[0].data)
            return null
        }
    }

    private async fetchFarmingAsset(pool: Pool, stakedToken: number, addr: string) {
        if (pool.type === TokenType.LP){
            const lpContract: Contract = this.chainConnector.getMulticallContract(pool.lpAddress, CAKELP_ABI);
            const token0Contract: Contract = this.chainConnector.getMulticallContract(pool.token0.address, ERC20_ABI);
            const token1Contract: Contract = this.chainConnector.getMulticallContract(pool.token1.address, ERC20_ABI);
            const [
                lpTotalSupply, 
                lpToken0Balance, 
                lpToken1Balance,
                pendingReward] = await this.provider.all(
                    [
                        lpContract.totalSupply(),
                        token0Contract.balanceOf(pool.lpAddress),
                        token1Contract.balanceOf(pool.lpAddress),
                        this.masterchef.pendingAUTO(pool.poolId, addr)
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
            const [pendingReward] = await this.provider.all([this.masterchef.pendingAUTO(pool.poolId, addr)])

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
