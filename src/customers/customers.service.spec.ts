import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer, CustomerStatus } from './entities/customer.entity';

// Typed as plain jest.fn()s rather than jest.Mocked<Repository<Customer>> --
// referencing the real Repository class's methods trips @typescript-eslint/unbound-method,
// which doesn't know jest.fn() mocks don't need `this` binding.
interface MockCustomerRepo {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
  merge: jest.Mock;
  remove: jest.Mock;
}

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: MockCustomerRepo;

  const customer: Customer = {
    id: '1',
    name: 'Acme',
    domain: null,
    industry: null,
    employeeCount: null,
    status: CustomerStatus.PROSPECT,
    personas: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CustomersService);
    repo = module.get(getRepositoryToken(Customer));
  });

  it('creates a customer', async () => {
    repo.create.mockReturnValue(customer);
    repo.save.mockResolvedValue(customer);

    const result = await service.create({ name: 'Acme' });

    expect(repo.create).toHaveBeenCalledWith({ name: 'Acme' });
    expect(result).toEqual(customer);
  });

  it('returns a customer by id', async () => {
    repo.findOneBy.mockResolvedValue(customer);

    await expect(service.findOne('1')).resolves.toEqual(customer);
  });

  it('throws NotFoundException when the customer does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('merges and saves on update', async () => {
    const updated = { ...customer, name: 'Acme Corp' };
    repo.findOneBy.mockResolvedValue(customer);
    repo.merge.mockReturnValue(updated);
    repo.save.mockResolvedValue(updated);

    const result = await service.update('1', { name: 'Acme Corp' });

    expect(repo.merge).toHaveBeenCalledWith(customer, { name: 'Acme Corp' });
    expect(result).toEqual(updated);
  });

  it('throws NotFoundException on update when the customer does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removes an existing customer', async () => {
    repo.findOneBy.mockResolvedValue(customer);

    await service.remove('1');

    expect(repo.remove).toHaveBeenCalledWith(customer);
  });
});
