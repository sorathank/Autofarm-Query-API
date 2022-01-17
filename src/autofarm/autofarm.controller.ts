import { Controller, Get, Param } from '@nestjs/common';
import { AutofarmService } from './autofarm.service';
import { FarmDto } from './dto/farm.dto';

@Controller('autofarm')
export class AutofarmController {
    constructor(private readonly autofarmService: AutofarmService){}

    @Get('/cache')
    async getCache() {
        return await this.autofarmService.getCache();
    }
    
    @Get('/cache/update')
    async updateCache() {
        return await this.autofarmService.updateCache();
    }

    @Get(':address')
    async getStakedBalance(
        @Param('address')
        address: string
    ): Promise<FarmDto[]>{
        await this.autofarmService.validateCacheAndInput(address);
        return await this.autofarmService.getAddressInformation(address);
    }

    
}
