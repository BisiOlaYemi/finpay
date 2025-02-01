import { 
  Body,
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  UseGuards,
  Request 
} from "@nestjs/common";
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam 
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { VirtualCardsService } from "./virtual-cards.service";
import { CreateVirtualCardDto } from "./dto/create-virtual-card.dto";
import { VirtualCardResponseDto } from "./dto/virtual-card.response.dto";

@ApiTags('virtual-cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('virtual-cards')
export class VirtualCardsController {
constructor(private readonly virtualCardsService: VirtualCardsService) {}

@Post()
@ApiOperation({ summary: 'Create a new virtual card' })
@ApiResponse({ 
  status: 201, 
  description: 'The virtual card has been successfully created.',
  type: VirtualCardResponseDto
})
createVirtualCard(
  @Request() req, 
  @Body() createVirtualCardDto: CreateVirtualCardDto
) {
  return this.virtualCardsService.createVirtualCard(req.user, createVirtualCardDto);
}

@Get()
@ApiOperation({ summary: 'Get all virtual cards for the authenticated user' })
@ApiResponse({ 
  status: 200, 
  description: 'List of virtual cards',
  type: [VirtualCardResponseDto]
})
getUserVirtualCards(@Request() req) {
  return this.virtualCardsService.findUserVirtualCards(req.user.id);
}

@Patch(':id/block')
@ApiOperation({ summary: 'Block a virtual card' })
@ApiParam({ name: 'id', description: 'Virtual card ID' })
@ApiResponse({ 
  status: 200, 
  description: 'The virtual card has been successfully blocked.',
  type: VirtualCardResponseDto
})
blockVirtualCard(
  @Param('id') cardId: string,
  @Request() req
) {
  return this.virtualCardsService.blockVirtualCard(cardId, req.user.id);
}
}