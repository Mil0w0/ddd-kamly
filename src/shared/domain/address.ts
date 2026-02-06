/**
 * Address Value Object
 */
export class Address {
  private constructor(
    private readonly _street: string,
    private readonly _city: string,
    private readonly _zipCode: string,
    private readonly _country: string,
    private readonly _additionalInformation?: string,
  ) {}

  static create(params: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    additionalInformation?: string;
  }): Address {
    // Validation
    this.validate(params);

    return new Address(
      params.street,
      params.city,
      params.zipCode,
      params.country,
      params.additionalInformation,
    );
  }

  private static validate(params: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    additionalInformations?: string;
  }): void {
    if (!params.street || params.street.trim().length === 0) {
      throw new Error('Street is required');
    }

    if (!params.city || params.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!params.zipCode || params.zipCode.trim().length === 0) {
      throw new Error('Zip code is required');
    }

    if (!params.country || params.country.trim().length === 0) {
      throw new Error('Country is required');
    }
  }

  equals(other: Address): boolean {
    if (!other) {
      return false;
    }

    return (
      this._street === other._street &&
      this._city === other._city &&
      this._zipCode === other._zipCode &&
      this._country === other._country &&
      this._additionalInformation === other._additionalInformation
    );
  }

  toString(): string {
    const parts = [this._street];

    if (this._additionalInformation) {
      parts.push(this._additionalInformation);
    }

    parts.push(`${this._zipCode} ${this._city}`);
    parts.push(this._country);

    return parts.join(', ');
  }

  // Getters for read-only access
  get street(): string {
    return this._street;
  }

  get city(): string {
    return this._city;
  }

  get zipCode(): string {
    return this._zipCode;
  }

  get country(): string {
    return this._country;
  }

  get additionalInformations(): string | undefined {
    return this._additionalInformation;
  }
}
