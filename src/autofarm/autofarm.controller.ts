import { Controller, Get, Param } from '@nestjs/common';
import { AutofarmService } from './autofarm.service';

@Controller('autofarm')
export class AutofarmController {
    constructor(private readonly autofarmService: AutofarmService){}

    @Get('/cache/update')
    async updateCache(): Promise<string>{
        return await this.autofarmService.updateCache();
    }

    @Get(':address')
    async getStakedBalance(
        @Param('address')
        address: string
    ): Promise<string>{
        return await this.autofarmService.getAddressInformation(address);
    }
}
