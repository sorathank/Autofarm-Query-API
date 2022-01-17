import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Contract, ethers } from 'ethers';
import * as MASTERCHEF_ABI from '../abi/autofarm/masterchef.abi.json'
import * as ERC20_ABI from '../abi/erc20.abi.json'
import * as CAKELP_ABI from '../abi/cakeLP.abi.json'
import { ChainConnectorService } from 'src/chain-connector/chain-connector.service';
import { getAutofarmMasterChefAddr } from 'src/config/rpc.config';
import { Pool, TempPool, Token, TokenType } from './entities/pool.entity';
import { warn } from 'console';

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
                return this.fetchTokenInfo(pool.value.want, idx)
            }
            return
        }))

        const cachedData = {
            pools: (await cache).map(pool => pool.status === 'fulfilled' && pool.value)
        }
        this.cacheManager.set('autofarmPools', cachedData);
        return cachedData;
    }

    async getCache(){
        return await this.cacheManager.get('autofarmPools');
    }

    async getAddressInformation(address: string): Promise<string> {
        const cache: any = await this.getCache();
        cache.pools.forEach(async pool => {
            if (pool) {
                if (pool.type === "lp"){
                    const stakedToken = this.masterchef.stakedWantTokens(pool.poolId)
                }
                else {

                }
            }
        });
        return "Hello"
    }
    /* 
    -> call masterchef.stakedWantTokens(pid, addr)

    IF LP 
    -> token0 amount = token0's balanceof(LP) * (stakedWantTokens / LP's totalSupply)
    -> token1 amount = token1's balanceof(LP) * (stakedWantTokens / LP's totalSupply)

    reward = call masterchef.userInfo(pid, addr) -> rewardDebt

    */

    private async getPoolLength(): Promise<number> {
        return parseInt((await this.masterchef.poolLength())._hex, 16);
    }

    private async fetchPoolInfo(n: number) {
        return this.masterchef.poolInfo(n);
    }

    private async fetchTokenInfo(addr: string, poolId: number) {
        var pool: Pool = {
            poolId: poolId + 1
        };
        const lpToken: Contract = this.chainConnector.getContract(addr, CAKELP_ABI)
        const tokens = await Promise.allSettled([lpToken.token0(), lpToken.token1()]);
        if (tokens[0].status === 'fulfilled' && tokens[1].status === 'fulfilled') {
            const tokenAddresses = await Promise.allSettled(tokens.map(async x => {
                if (x.status === 'fulfilled'){
                    return await this.fetchERC20Info(x.value);
                }
            }))
            
            const tokenInfos = tokenAddresses.map(token => (token.status === 'fulfilled' && (token.value)));
            pool.lpAddress = addr;
            pool.lpDecimals = await lpToken.decimals();
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
                tokenAddress: addr,
                tokenDecimal: await erc20Token.decimals(),
                tokenSymbol: await erc20Token.symbol()
            };
            return token
        }
        catch(e){
            console.log('-- [WARNING]: Cannot Fetch', addr, 'With data', e.error.requestBody.params[0].data)
            return null
        }
    }
}
