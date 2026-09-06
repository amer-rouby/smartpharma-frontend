import { AbstractConstructor, Constructor } from '../types/constructor.type';
import { ModelHasService } from '../interfaces/model-has-service.interface';
import { ServiceRegistry } from '../classes/service-registry';

type CanGetService = Constructor<ModelHasService> & AbstractConstructor<ModelHasService>;

export function ModelServiceMixin<Model extends AbstractConstructor<object>>(Base: Model): CanGetService & Model;
export function ModelServiceMixin<Model extends Constructor<object>>(Base: Model): CanGetService & Model {
  return class extends Base implements ModelHasService {
    declare $$service: string;
    $$getService<Service>(): Service {
      return ServiceRegistry.get<Service>(this.$$service);
    }
  };
}
