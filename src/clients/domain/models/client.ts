import { DateTime } from 'luxon';
import { Address } from '../../../shared/domain/address';
import { Identifier } from '../../../shared/domain/identifier';
import type { DomainEvent } from '../../../shared/domain/events';
import type { UUID } from 'node:crypto';
import { ClientCreated } from '../events/ClientCreated';

export class Client {
  private _domainEvents: DomainEvent[] = [];

  private constructor(
    private readonly _id: Identifier,
    private _name: string,
    private _email: string,
    private _phone: string | null,
    private _billingAddress: Address,
    private readonly _createdAt: DateTime,
    private _updatedAt: DateTime,
  ) {}

  static create(params: {
    name: string;
    email: string;
    phone?: string | null;
    billingAddress: Address;
    id?: Identifier | UUID;
  }): Client {
    Client.validateCreate(params);
    const now = DateTime.now();
    const id =
      params.id !== undefined
        ? params.id instanceof Identifier
          ? params.id
          : Identifier.create(params.id)
        : Identifier.generate();

    const client = new Client(
      id,
      params.name.trim(),
      params.email.trim().toLowerCase(),
      params.phone?.trim() ?? null,
      params.billingAddress,
      now,
      now,
    );
    client.recordEvent(
      new ClientCreated(client._id, client._name, client._email, now),
    );
    return client;
  }

  private static validateCreate(params: {
    name: string;
    email: string;
  }): void {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Client name is required');
    }
    if (!params.email || params.email.trim().length === 0) {
      throw new Error('Client email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email.trim())) {
      throw new Error('Invalid email format');
    }
  }

  updateContact(params: { name?: string; email?: string; phone?: string | null }): void {
    if (params.name !== undefined) {
      if (!params.name || params.name.trim().length === 0) {
        throw new Error('Client name cannot be empty');
      }
      this._name = params.name.trim();
    }
    if (params.email !== undefined) {
      if (!params.email || params.email.trim().length === 0) {
        throw new Error('Client email cannot be empty');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.email.trim())) {
        throw new Error('Invalid email format');
      }
      this._email = params.email.trim().toLowerCase();
    }
    if (params.phone !== undefined) {
      this._phone = params.phone?.trim() ?? null;
    }
    this._updatedAt = DateTime.now();
  }

  updateBillingAddress(address: Address): void {
    this._billingAddress = address;
    this._updatedAt = DateTime.now();
  }

  /** Records a domain event to be dispatched after persistence. */
  protected recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /** Returns and clears all recorded domain events. Call after save. */
  releaseEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  get id(): Identifier {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get billingAddress(): Address {
    return this._billingAddress;
  }

  get createdAt(): DateTime {
    return this._createdAt;
  }

  get updatedAt(): DateTime {
    return this._updatedAt;
  }
}
