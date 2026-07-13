import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { JwtPayload } from '../auth/jwt.strategy';
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

const leadCaller: JwtPayload = {
  sub: 'lead-1',
  iss: 'x',
  exp: 0,
  role: 'lead',
};

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
    assignedRep: null,
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

    const result = await service.create(
      customer.id,
      { name: 'Jane' },
      leadCaller,
    );

    expect(customers.findOne).toHaveBeenCalledWith(customer.id, leadCaller);
    expect(repo.create).toHaveBeenCalledWith({
      name: 'Jane',
      customerId: customer.id,
    });
    expect(result).toEqual(persona);
  });

  it('propagates NotFoundException when the customer does not exist', async () => {
    customers.findOne.mockRejectedValue(new NotFoundException());

    await expect(
      service.create('missing', { name: 'Jane' }, leadCaller),
    ).rejects.toThrow(NotFoundException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('propagates NotFoundException from findAll when the caller cannot access the customer', async () => {
    customers.findOne.mockRejectedValue(new NotFoundException());

    await expect(service.findAll('missing', leadCaller)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.find).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the persona does not exist for the customer', async () => {
    customers.findOne.mockResolvedValue(customer);
    repo.findOneBy.mockResolvedValue(null);

    await expect(
      service.findOne(customer.id, 'missing', leadCaller),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes an existing persona', async () => {
    customers.findOne.mockResolvedValue(customer);
    repo.findOneBy.mockResolvedValue(persona);

    await service.remove(customer.id, '1', leadCaller);

    expect(repo.remove).toHaveBeenCalledWith(persona);
  });
});
