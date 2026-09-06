import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

type FormControlConfig = [unknown, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, AsyncValidatorFn?];

export interface HasForm {
  buildForm(): Record<string, FormControlConfig | unknown>;
}
