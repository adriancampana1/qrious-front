export interface ImportErrorDto {
  position: number;
  message: string;
  rawData?: string;
}

export interface ImportResultDto {
  total: number;
  successful: number;
  failed: number;
  errors: ImportErrorDto[];
}
