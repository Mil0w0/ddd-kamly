import { beforeEach, describe, expect, it } from '@jest/globals';
import { Address } from '../../../../src/shared/domain/address';

describe('Address Value object', () => {
  let validParams: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    additionalInformation: string | undefined;
  };

  beforeEach(() => {
    validParams = {
      street: '123 Main St',
      city: 'Paris',
      zipCode: '75001',
      country: 'France',
      additionalInformation: '7 étage',
    };
  });

  describe('create', () => {
    it('should create an address', () => {
      const address = Address.create(validParams);
      const expectedString = '123 Main St, 7 étage, 75001 Paris, France';

      expect(address).toBeInstanceOf(Address);
      expect(address.toString()).toBe(expectedString);
    });

    it('should prevent creation of an address on missing STREET', () => {
      validParams.street = '';

      expect(() => Address.create(validParams)).toThrow('Street is required');
    });
    it('should prevent creation of an address on missing CITY', () => {
      validParams.city = '';

      expect(() => Address.create(validParams)).toThrow('City is required');
    });
    it('should prevent creation of an address on missing ZIPCODE', () => {
      validParams.zipCode = '';

      expect(() => Address.create(validParams)).toThrow('Zip code is required');
    });
    it('should prevent creation of an address on missing COUNTRY', () => {
      validParams.country = '';

      expect(() => Address.create(validParams)).toThrow('Country is required');
    });
  });

  describe('equals', () => {
    it('should return true if addresses are equal', () => {
      const address1 = Address.create(validParams);
      const address2 = Address.create(validParams);

      expect(address1.equals(address2)).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return street', () => {
      const address = Address.create(validParams);
      expect(address.street).toBe('123 Main St');
    });

    it('should return city', () => {
      const address = Address.create(validParams);
      expect(address.city).toBe('Paris');
    });

    it('should return zipCode', () => {
      const address = Address.create(validParams);
      expect(address.zipCode).toBe('75001');
    });

    it('should return country', () => {
      const address = Address.create(validParams);
      expect(address.country).toBe('France');
    });

    it('should return additionalInformation when provided', () => {
      const address = Address.create(validParams);
      expect(address.additionalInformation).toBe('7 étage');
    });

    it('should return undefined for additionalInformation when not provided', () => {
      const address = Address.create({
        street: validParams.street,
        city: validParams.city,
        zipCode: validParams.zipCode,
        country: validParams.country,
      });
      expect(address.additionalInformation).toBeUndefined();
    });
  });
});
