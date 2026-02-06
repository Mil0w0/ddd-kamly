import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ClientsController } from '../../../../src/clients/infrastructure/controllers/Clients.controller';
import { CreateClientService } from '../../../../src/clients/application/CreateClient.service';
import { GetClientByIdService } from '../../../../src/clients/application/GetClientById.service';
import { Client } from '../../../../src/clients/domain/models/client';
import { Identifier } from '../../../../src/shared/domain/identifier';
import { Address } from '../../../../src/shared/domain/address';
import { DateTime } from 'luxon';

describe('ClientsController', () => {
    let controller: ClientsController;
    let createClientServiceMock: jest.Mocked<CreateClientService>;
    let getClientByIdServiceMock: jest.Mocked<GetClientByIdService>;

    beforeEach(() => {
        createClientServiceMock = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<CreateClientService>;

        getClientByIdServiceMock = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<GetClientByIdService>;

        controller = new ClientsController(
            createClientServiceMock,
            getClientByIdServiceMock,
        );
    });

    const mockAddress = Address.create({
        street: 'Street',
        city: 'City',
        zipCode: '12345',
        country: 'Country',
    });

    const mockClient = {
        id: Identifier.generate(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        billingAddress: mockAddress,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
    } as unknown as Client;

    it('should create a client', async () => {
        // Arrange
        const body = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123456789',
            billingAddress: {
                street: 'Street',
                city: 'City',
                zipCode: '12345',
                country: 'Country',
            },
        };

        createClientServiceMock.execute.mockResolvedValue(mockClient);

        // Act
        const result = await controller.create(body);

        // Assert
        expect(createClientServiceMock.execute).toHaveBeenCalledWith(body);
        expect(result).toEqual({
            id: mockClient.id.toString(),
            name: mockClient.name,
            email: mockClient.email,
            phone: mockClient.phone,
            billingAddress: {
                street: mockClient.billingAddress.street,
                city: mockClient.billingAddress.city,
                zipCode: mockClient.billingAddress.zipCode,
                country: mockClient.billingAddress.country,
                additionalInformation: mockClient.billingAddress.additionalInformation,
            },
            createdAt: mockClient.createdAt.toISO(),
            updatedAt: mockClient.updatedAt.toISO(),
        });
    });

    it('should get a client by id', async () => {
        // Arrange
        const id = mockClient.id.value;
        getClientByIdServiceMock.execute.mockResolvedValue(mockClient);

        // Act
        const result = await controller.getById(id);

        // Assert
        expect(getClientByIdServiceMock.execute).toHaveBeenCalledWith(
            expect.any(Identifier),
        );
        expect(result).toEqual({
            id: mockClient.id.toString(),
            name: mockClient.name,
            email: mockClient.email,
            phone: mockClient.phone,
            billingAddress: {
                street: mockClient.billingAddress.street,
                city: mockClient.billingAddress.city,
                zipCode: mockClient.billingAddress.zipCode,
                country: mockClient.billingAddress.country,
                additionalInformation: mockClient.billingAddress.additionalInformation,
            },
            createdAt: mockClient.createdAt.toISO(),
            updatedAt: mockClient.updatedAt.toISO(),
        });
    });
});
