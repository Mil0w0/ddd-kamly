import { beforeEach, describe, expect, it } from '@jest/globals';
import { UUID } from 'node:crypto';
import { Address } from '../../../src/shared/domain/address';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Client } from '../../../src/clients/domain/models/client';
import { ClientCreated } from '../../../src/clients/domain/events/ClientCreated';

describe('Client Entity', () => {
  let validParams: {
    name: string;
    email: string;
    phone?: string | null;
    billingAddress: Address;
  };

  beforeEach(() => {
    validParams = {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      billingAddress: Address.create({
        street: '123 Main St',
        city: 'Paris',
        zipCode: '75001',
        country: 'France',
      }),
    };
  });

  describe('create', () => {
    it('should create a client with required fields', () => {
      const client = Client.create(validParams);

      expect(client).toBeInstanceOf(Client);
      expect(client.name).toBe('Acme Corp');
      expect(client.email).toBe('contact@acme.com');
      expect(client.billingAddress).toBe(validParams.billingAddress);
    });

    it('should generate an id when not provided', () => {
      const client = Client.create(validParams);

      expect(client.id).toBeInstanceOf(Identifier);
      expect(client.id.value).toBeDefined();
      expect(client.id.toString()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should accept an optional id', () => {
      const id = Identifier.generate();
      const client = Client.create({ ...validParams, id });

      expect(client.id.value).toBe(id.value);
    });

    it('should accept an optional phone', () => {
      const client = Client.create({ ...validParams, phone: '+33 1 23 45 67 89' });

      expect(client.phone).toBe('+33 1 23 45 67 89');
    });

    it('should set phone to null when not provided', () => {
      const client = Client.create(validParams);

      expect(client.phone).toBeNull();
    });

    it('should trim name and email and normalize email to lowercase', () => {
      const client = Client.create({
        name: '  Acme Corp  ',
        email: '  Contact@Acme.COM  ',
        billingAddress: validParams.billingAddress,
      });

      expect(client.name).toBe('Acme Corp');
      expect(client.email).toBe('contact@acme.com');
    });

    it('should trim optional phone', () => {
      const client = Client.create({
        ...validParams,
        phone: '  0612345678  ',
      });

      expect(client.phone).toBe('0612345678');
    });

    it('should set createdAt and updatedAt', () => {
      const client = Client.create(validParams);

      expect(client.createdAt).toBeDefined();
      expect(client.updatedAt).toBeDefined();
      expect(client.createdAt.toMillis()).toBe(client.updatedAt.toMillis());
    });
  });

  describe('create validation', () => {
    it('should throw when name is empty', () => {
      expect(() =>
        Client.create({ ...validParams, name: '' }),
      ).toThrow('Client name is required');
    });

    it('should throw when name is only whitespace', () => {
      expect(() =>
        Client.create({ ...validParams, name: '   ' }),
      ).toThrow('Client name is required');
    });

    it('should throw when email is empty', () => {
      expect(() =>
        Client.create({ ...validParams, email: '' }),
      ).toThrow('Client email is required');
    });

    it('should throw when email is only whitespace', () => {
      expect(() =>
        Client.create({ ...validParams, email: '   ' }),
      ).toThrow('Client email is required');
    });

    it('should throw when email format is invalid', () => {
      expect(() =>
        Client.create({ ...validParams, email: 'not-an-email' }),
      ).toThrow('Invalid email format');

      expect(() =>
        Client.create({ ...validParams, email: 'missing@domain' }),
      ).toThrow('Invalid email format');

      expect(() =>
        Client.create({ ...validParams, email: '@nodomain.com' }),
      ).toThrow('Invalid email format');
    });
  });

  describe('updateContact', () => {
    it('should update name', () => {
      const client = Client.create(validParams);

      client.updateContact({ name: 'New Name' });

      expect(client.name).toBe('New Name');
      expect(client.email).toBe('contact@acme.com');
    });

    it('should update email and normalize to lowercase', () => {
      const client = Client.create(validParams);

      client.updateContact({ email: 'New@Acme.COM' });

      expect(client.email).toBe('new@acme.com');
    });

    it('should update phone', () => {
      const client = Client.create(validParams);

      client.updateContact({ phone: '+33 6 12 34 56 78' });

      expect(client.phone).toBe('+33 6 12 34 56 78');
    });

    it('should set phone to null when passed null', () => {
      const client = Client.create({ ...validParams, phone: '0612345678' });

      client.updateContact({ phone: null });

      expect(client.phone).toBeNull();
    });

    it('should update updatedAt when any field changes', () => {
      const client = Client.create(validParams);
      const originalUpdatedAt = client.updatedAt;

      client.updateContact({ name: 'Updated' });

      expect(client.updatedAt.toMillis()).toBeGreaterThanOrEqual(
        originalUpdatedAt.toMillis(),
      );
    });

    it('should not change createdAt', () => {
      const client = Client.create(validParams);
      const originalCreatedAt = client.createdAt;

      client.updateContact({ name: 'Updated' });

      expect(client.createdAt).toBe(originalCreatedAt);
    });

    it('should throw when updating name to empty', () => {
      const client = Client.create(validParams);

      expect(() => client.updateContact({ name: '' })).toThrow(
        'Client name cannot be empty',
      );
      expect(() => client.updateContact({ name: '   ' })).toThrow(
        'Client name cannot be empty',
      );
    });

    it('should throw when updating email to empty', () => {
      const client = Client.create(validParams);

      expect(() => client.updateContact({ email: '' })).toThrow(
        'Client email cannot be empty',
      );
    });

    it('should throw when updating email to invalid format', () => {
      const client = Client.create(validParams);

      expect(() => client.updateContact({ email: 'invalid' })).toThrow(
        'Invalid email format',
      );
    });
  });

  describe('updateBillingAddress', () => {
    it('should update billing address', () => {
      const client = Client.create(validParams);
      const newAddress = Address.create({
        street: '456 Other St',
        city: 'Lyon',
        zipCode: '69001',
        country: 'France',
      });

      client.updateBillingAddress(newAddress);

      expect(client.billingAddress).toBe(newAddress);
      expect(client.billingAddress.street).toBe('456 Other St');
      expect(client.billingAddress.city).toBe('Lyon');
    });

    it('should update updatedAt', () => {
      const client = Client.create(validParams);
      const newAddress = Address.create({
        street: '456 Other St',
        city: 'Lyon',
        zipCode: '69001',
        country: 'France',
      });
      const originalUpdatedAt = client.updatedAt;

      client.updateBillingAddress(newAddress);

      expect(client.updatedAt.toMillis()).toBeGreaterThanOrEqual(
        originalUpdatedAt.toMillis(),
      );
    });
  });

  describe('Domain Events', () => {
    it('should record ClientCreated when created', () => {
      const client = Client.create(validParams);
      const events = client.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ClientCreated);
      const created = events[0] as ClientCreated;
      expect(created.clientId.value).toBe(client.id.value);
      expect(created.name).toBe('Acme Corp');
      expect(created.email).toBe('contact@acme.com');
    });

    it('should clear events after releaseEvents()', () => {
      const client = Client.create(validParams);

      expect(client.releaseEvents()).toHaveLength(1);
      expect(client.releaseEvents()).toHaveLength(0);
    });
  });
});
