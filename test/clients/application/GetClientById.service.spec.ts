import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetClientByIdService } from '../../../src/clients/application/GetClientById.service';
import type { ClientRepositoryInterface } from '../../../src/clients/domain/repository/ClientRepository.interface';
import { Client } from '../../../src/clients/domain/models/client';
import { Identifier } from '../../../src/shared/domain/identifier';
import { ClientNotFoundException } from '../../../src/clients/domain/exceptions';

describe('GetClientByIdService', () => {
    let service: GetClientByIdService;
    let clientRepositoryMock: jest.Mocked<ClientRepositoryInterface>;

    beforeEach(() => {
        clientRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
        } as unknown as jest.Mocked<ClientRepositoryInterface>;

        service = new GetClientByIdService(clientRepositoryMock);
    });

    it('should return a client when found', async () => {
        // Arrange
        const id = Identifier.generate();
        const mockClient = { id } as unknown as Client;
        clientRepositoryMock.findById.mockResolvedValue(mockClient);

        // Act
        const result = await service.execute(id);

        // Assert
        expect(result).toBe(mockClient);
        expect(clientRepositoryMock.findById).toHaveBeenCalledWith(id);
    });

    it('should throw ClientNotFoundException when client not found', async () => {
        // Arrange
        const id = Identifier.generate();
        clientRepositoryMock.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(service.execute(id)).rejects.toThrow(ClientNotFoundException);
        expect(clientRepositoryMock.findById).toHaveBeenCalledWith(id);
    });
});
