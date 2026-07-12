import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer, CustomerStatus } from './entities/customer.entity';
import { Persona } from './entities/persona.entity';
import { PersonasService } from './personas.service';

// See customers.service.spec.ts for why these are typed as plain jest.fn()s rather
// than jest.Mocked<Repository<Persona>>/jest.Mocked<CustomersService>.
interface MockPersonaRepo {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
  merge: jest.Mock;
  remove: jest.Mock;
}

interface MockCustomersService {
  findOne: jest.Mock;
}

describe('PersonasService', () => {
  let service: PersonasService;
  let repo: MockPersonaRepo;
  let customers: MockCustomersService;

  const customer: Customer = {
    id: 'customer-1',
    name: 'Acme',
    domain: null,
    industry: null,
    employeeCount: null,
    status: CustomerStatus.PROSPECT,
    personas: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const persona: Persona = {
    id: '1',
    customerId: customer.id,
    customer,
    name: 'Jane',
    email: null,
    title: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonasService,
        {
          provide: getRepositoryToken(Persona),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CustomersService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(PersonasService);
    repo = module.get(getRepositoryToken(Persona));
    customers = module.get<MockCustomersService>(CustomersService);
  });

  it('creates a persona once the customer is confirmed to exist', async () => {
    customers.findOne.mockResolvedValue(customer);
    repo.create.mockReturnValue(persona);
    repo.save.mockResolvedValue(persona);

    const result = await service.create(customer.id, { name: 'Jane' });

    expect(customers.findOne).toHaveBeenCalledWith(customer.id);
    expect(repo.create).toHaveBeenCalledWith({
      name: 'Jane',
      customerId: customer.id,
    });
    expect(result).toEqual(persona);
  });

  it('propagates NotFoundException when the customer does not exist', async () => {
    customers.findOne.mockRejectedValue(new NotFoundException());

    await expect(service.create('missing', { name: 'Jane' })).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the persona does not exist for the customer', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(customer.id, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('removes an existing persona', async () => {
    repo.findOneBy.mockResolvedValue(persona);

    await service.remove(customer.id, '1');

    expect(repo.remove).toHaveBeenCalledWith(persona);
  });
});
