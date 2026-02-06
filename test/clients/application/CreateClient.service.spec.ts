import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateClientService, CreateClientCommand } from '../../../src/clients/application/CreateClient.service';
import type { ClientRepositoryInterface } from '../../../src/clients/domain/repository/ClientRepository.interface';
import { Client } from '../../../src/clients/domain/models/client';
import { Address } from '../../../src/shared/domain/address';

describe('CreateClientService', () => {
    let service: CreateClientService;
    let clientRepositoryMock: jest.Mocked<ClientRepositoryInterface>;

    beforeEach(() => {
        clientRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
        } as unknown as jest.Mocked<ClientRepositoryInterface>;

        service = new CreateClientService(clientRepositoryMock);
    });

    it('should create and save a new client', async () => {
        // Arrange
        const command: CreateClientCommand = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '0123456789',
            billingAddress: {
                street: '123 Main St',
                city: 'Paris',
                zipCode: '75001',
                country: 'France',
                additionalInformation: 'Apt 4B',
            },
        };

        // Act
        const result = await service.execute(command);

        // Assert
        expect(result).toBeInstanceOf(Client);
        expect(result.name).toBe(command.name);
        expect(result.email).toBe(command.email);
        expect(result.phone).toBe(command.phone);

        expect(result.billingAddress).toBeInstanceOf(Address);
        expect(result.billingAddress.street).toBe(command.billingAddress.street);

        expect(clientRepositoryMock.save).toHaveBeenCalledTimes(1);
        expect(clientRepositoryMock.save).toHaveBeenCalledWith(result);
    });

    it('should throw error if address is invalid', async () => {
        // Arrange
        const command: CreateClientCommand = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '0123456789',
            billingAddress: {
                street: '', // Invalid street
                city: 'Paris',
                zipCode: '75001',
                country: 'France',
            },
        };

        // Act & Assert
        await expect(service.execute(command)).rejects.toThrow();
        expect(clientRepositoryMock.save).not.toHaveBeenCalled();
    });
});
