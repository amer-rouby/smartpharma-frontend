import { AbstractConstructor, Constructor } from '../types/constructor.type';
import { ServiceNameContract } from '../interfaces/service-name-contract.interface';
import { ServiceRegistry } from '../classes/service-registry';

export function RegisterServiceMixin<Service extends AbstractConstructor<object>>(service: Service): Service;
export function RegisterServiceMixin<Service extends Constructor<object>>(service: Service): Service {
  return class extends service implements ServiceNameContract {
    declare $$serviceName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.$$__init__$$();
    }

    $$__init__$$(): void {
      // Deferred so the concrete subclass constructor (which sets $$serviceName) finishes first.
      Promise.resolve().then(() => {
        ServiceRegistry.set(this.$$serviceName, this);
      });
    }
  };
}
