import { Observable } from 'rxjs';
import { Cloner } from './cloner';
import { ModelServiceMixin } from '../mixins/model-service-mixin';
import { ModelHasService } from '../interfaces/model-has-service.interface';
import { CrudServiceContract } from '../interfaces/crud-service-contract.interface';

export interface CrudModelContract<Model> {
  $$primaryKey: keyof Model;
  create(): Observable<Model>;
  update(): Observable<Model>;
  delete(): Observable<void>;
  save(): Observable<Model>;
}

export abstract class CrudModel<Model, Service extends CrudServiceContract<Model, PrimaryKeyType>, PrimaryKeyType = number>
  extends ModelServiceMixin(Cloner)
  implements CrudModelContract<Model>, ModelHasService
{
  abstract $$primaryKey: keyof Model;
  abstract override $$service: string;

  create(): Observable<Model> {
    return this.$$getService<Service>().create(this as unknown as Model);
  }

  update(): Observable<Model> {
    return this.$$getService<Service>().update(this as unknown as Model);
  }

  delete(): Observable<void> {
    return this.$$getService<Service>().delete(this[this.$$primaryKey as unknown as keyof this] as unknown as PrimaryKeyType);
  }

  save(): Observable<Model> {
    return this[this.$$primaryKey as unknown as keyof this] ? this.update() : this.create();
  }
}
