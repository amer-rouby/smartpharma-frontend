export interface ModelHasService {
  $$service: string;
  $$getService<Service>(): Service;
}
