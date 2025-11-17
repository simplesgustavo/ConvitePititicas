declare module "bcryptjs" {
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function compare(
    data: string | Buffer,
    encrypted: string,
    callback: (error: Error | null, same: boolean) => void
  ): void;

  export function hash(data: string | Buffer, salt: string | number): Promise<string>;
  export function hash(
    data: string | Buffer,
    salt: string | number,
    callback: (error: Error | null, encrypted: string) => void
  ): void;

  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number, callback: (error: Error | null, salt: string) => void): void;

  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  export function hashSync(data: string | Buffer, salt: string | number): string;
  export function genSaltSync(rounds?: number): string;
}
