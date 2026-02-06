import { beforeEach, describe, expect, it } from '@jest/globals';
import { Address } from '../../../src/shared/domain/address';

describe('Address Value object', () => {
  let validParams: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    additionalInformations: string | undefined;
  };

  beforeEach(() => {
    validParams = {
      street: '123 Main St',
      city: 'Paris',
      zipCode: '75001',
      country: 'France',
      additionalInformations: '7 étage',
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
});
