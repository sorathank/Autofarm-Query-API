import { Controller, Get, Param } from '@nestjs/common';
import { AutofarmService } from './autofarm.service';

@Controller('autofarm')
export class AutofarmController {
    constructor(private readonly autofarmService: AutofarmService){}

    @Get('/cache/update')
    async updateCache(): Promise<string>{
        return "Cache Updated"
    }

    @Get(':address')
    async getStakedBalance(
        @Param('address')
        address: string
    ): Promise<string>{
        return address
    }
}
