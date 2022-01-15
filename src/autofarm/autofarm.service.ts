import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AutofarmService {
    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async updateCache(): Promise<string>{
        const cache = await this.cacheManager.get("cache")
        console.log(cache)
        if (cache){
            return typeof(cache)
        } 
        return "Cache Unavailable"
    }

    async getAddressInformation(address: string): Promise<string>{
        await this.cacheManager.set("cache", "Updated")
        console.log(await this.cacheManager.get("cache"))
        return await this.cacheManager.get("cache")
    }
}
