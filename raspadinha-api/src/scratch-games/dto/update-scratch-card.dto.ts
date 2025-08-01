import { PartialType } from "@nestjs/mapped-types"
import { CreateScratchCardDto } from "./create-scratch-card.dto"

export class UpdateScratchCardDto extends PartialType(CreateScratchCardDto) {}
