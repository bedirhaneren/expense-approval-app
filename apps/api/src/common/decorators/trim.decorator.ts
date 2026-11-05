import { Transform } from 'class-transformer';

/** Trims surrounding whitespace so that "   " fails @IsNotEmpty. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
