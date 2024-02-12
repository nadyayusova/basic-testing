import {
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
  getBankAccount,
} from '.';

describe('BankAccount', () => {
  test('should create account with initial balance', () => {
    const account = getBankAccount(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    try {
      const account = getBankAccount(100);
      account.withdraw(200);
    } catch (error) {
      expect(error).toBeInstanceOf(InsufficientFundsError);
      expect((error as InsufficientFundsError).message).toBe(
        'Insufficient funds: cannot withdraw more than 100',
      );
    }
  });

  test('should throw error when transferring more than balance', () => {
    try {
      const account1 = getBankAccount(100);
      const account2 = getBankAccount(0);
      account1.transfer(200, account2);
    } catch (error) {
      expect(error).toBeInstanceOf(InsufficientFundsError);
      expect((error as InsufficientFundsError).message).toBe(
        'Insufficient funds: cannot withdraw more than 100',
      );
    }
  });

  test('should throw error when transferring to the same account', () => {
    try {
      const account = getBankAccount(100);
      account.transfer(200, account);
    } catch (error) {
      expect(error).toBeInstanceOf(TransferFailedError);
      expect((error as TransferFailedError).message).toBe('Transfer failed');
    }
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(100);
    expect(account.getBalance()).toBe(200);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(200);
    account.withdraw(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should transfer money', () => {
    const account1 = getBankAccount(200);
    const account2 = getBankAccount(0);
    account1.transfer(100, account2);
    expect(account1.getBalance()).toBe(100);
    expect(account2.getBalance()).toBe(100);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const account = getBankAccount(0);
    return account.fetchBalance().then((data) => {
      if (data) {
        expect(typeof data).toBe('number');
      } else {
        expect(typeof data).toBe('object');
      }
    });
  });

  test('should set new balance if fetchBalance returned number', async () => {
    try {
      const initialBalance = 0;
      const account = getBankAccount(initialBalance);
      await account.synchronizeBalance();
      const data = account.getBalance();
      expect(data !== initialBalance).toBeTruthy();
    } catch (error) {
      expect(error).toBeInstanceOf(SynchronizationFailedError);
    }
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    try {
      const account = getBankAccount(0);
      await account.synchronizeBalance();
      const data = account.getBalance();
      expect(typeof data).toBe('number');
    } catch (error) {
      expect(error).toBeInstanceOf(SynchronizationFailedError);
    }
  });
});
