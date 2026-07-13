import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { JwtPayload } from '../auth/jwt.strategy';
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

const leadCaller: JwtPayload = {
  sub: 'lead-1',
  iss: 'x',
  exp: 0,
  role: 'lead',
};
const appCaller: JwtPayload = { sub: 'app-1', iss: 'x', exp: 0 };
const ownerCaller: JwtPayload = {
  sub: 'rep-1',
  iss: 'x',
  exp: 0,
  role: 'member',
};
const otherMemberCaller: JwtPayload = {
  sub: 'rep-2',
  iss: 'x',
  exp: 0,
  role: 'member',
};

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
    assignedRep: 'rep-1',
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

  describe('findAll', () => {
    it('does not filter for a lead', async () => {
      repo.find.mockResolvedValue([customer]);

      await service.findAll(leadCaller);

      expect(repo.find).toHaveBeenCalledWith();
    });

    it('does not filter for an application token (no role claim)', async () => {
      repo.find.mockResolvedValue([customer]);

      await service.findAll(appCaller);

      expect(repo.find).toHaveBeenCalledWith();
    });

    it('filters by assignedRep for a member', async () => {
      repo.find.mockResolvedValue([customer]);

      await service.findAll(ownerCaller);

      expect(repo.find).toHaveBeenCalledWith({
        where: { assignedRep: 'rep-1' },
      });
    });
  });

  describe('findOne', () => {
    it('returns a customer by id for a lead', async () => {
      repo.findOneBy.mockResolvedValue(customer);

      await expect(service.findOne('1', leadCaller)).resolves.toEqual(customer);
    });

    it('returns a customer by id for its assigned member', async () => {
      repo.findOneBy.mockResolvedValue(customer);

      await expect(service.findOne('1', ownerCaller)).resolves.toEqual(
        customer,
      );
    });

    it('throws NotFoundException when the customer does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing', leadCaller)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when a member requests a customer assigned to someone else', async () => {
      repo.findOneBy.mockResolvedValue(customer);

      await expect(service.findOne('1', otherMemberCaller)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('merges and saves on update', async () => {
    const updated = { ...customer, name: 'Acme Corp' };
    repo.findOneBy.mockResolvedValue(customer);
    repo.merge.mockReturnValue(updated);
    repo.save.mockResolvedValue(updated);

    const result = await service.update('1', { name: 'Acme Corp' }, leadCaller);

    expect(repo.merge).toHaveBeenCalledWith(customer, { name: 'Acme Corp' });
    expect(result).toEqual(updated);
  });

  it('throws NotFoundException on update when the customer does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(
      service.update('missing', { name: 'x' }, leadCaller),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException on update when a member does not own the customer', async () => {
    repo.findOneBy.mockResolvedValue(customer);

    await expect(
      service.update('1', { name: 'x' }, otherMemberCaller),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes an existing customer', async () => {
    repo.findOneBy.mockResolvedValue(customer);

    await service.remove('1', leadCaller);

    expect(repo.remove).toHaveBeenCalledWith(customer);
  });
});
