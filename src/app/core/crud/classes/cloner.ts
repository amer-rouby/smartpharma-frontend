export interface ClonerContract {
  clone<T extends object>(overrides?: Partial<T>): T;
}

export class Cloner implements ClonerContract {
  clone<T extends object>(overrides?: Partial<T>): T {
    const instance = new (this.constructor as new () => T)();
    Object.assign(instance, this, overrides);
    return instance;
  }
}
