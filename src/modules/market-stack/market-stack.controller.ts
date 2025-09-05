import { UpdateHoldingDto } from '@App/modules/market-stack/dto/update-holding.dto';
import { IUpdateHoldingResponse } from '@App/modules/market-stack/interface/holding.interface';
import { IPortfolioResponse } from '@App/modules/market-stack/interface/portfolio.interface';
import { MarketStackService } from '@App/modules/market-stack/market-stack.service';
import { swaggerTags } from '@App/shared/constant/swagger.tags.constant';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiHeader } from '@nestjs/swagger';

@ApiTags(swaggerTags.Market_Stack)
@Controller({ path: '/market-stack', version: ['1'] })
export class MarketStackController {
  constructor(private readonly marketStackService: MarketStackService) {}

  @ApiOperation({ summary: 'Update a specific user’s holding allocation' })
  @ApiParam({ name: 'userId', description: 'User identifier', example: 'f9e6ae96-36d2-42cd-81ef-af559e6a5802' })
  @ApiResponse({ status: 200, description: 'Holding updated successfully' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @Put(':userId/holdings')
  @UseGuards(AuthGuard('api-key'))
  updateHolding(@Param('userId') userId: string, @Body() dto: UpdateHoldingDto): Promise<IUpdateHoldingResponse> {
    return this.marketStackService.updateUserHolding(userId, dto);
  }

  @ApiOperation({ summary: 'Fetch a specific user’s holding' })
  @ApiParam({ name: 'userId', description: 'User identifier', example: 'f9e6ae96-36d2-42cd-81ef-af559e6a5802' })
  @ApiResponse({ status: 200, description: 'Holding Portfolio Fetched successfully' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'my-secret-key',
  })
  @Get(':userId/portfolio')
  @UseGuards(AuthGuard('api-key'))
  async getUserPortfolio(@Param('userId') userId: string): Promise<IPortfolioResponse> {
    return this.marketStackService.getUserPortfolio(userId);
  }
}
