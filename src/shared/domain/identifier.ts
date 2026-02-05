import { randomUUID, type UUID } from 'node:crypto';

export class Identifier {
  private constructor(private readonly _value: UUID) {}

  static create(value: UUID): Identifier {
    return new Identifier(value);
  }

  static generate(): Identifier {
    return new Identifier(randomUUID());
  }

  get value(): UUID {
    return this._value;
  }

  equals(other: Identifier): boolean {
    return (
      other !== null && other !== undefined && this._value === other._value
    );
  }

  toString(): string {
    return this._value;
  }
}
