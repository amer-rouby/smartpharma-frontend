import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialModule } from '../../../shared/material.module';
import { CrudDialogDirective, CrudDialogTitleKeys } from '../../../core/crud';
import { CategoryModel } from '../models/category.model';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss',
})
export class CategoryDialogComponent extends CrudDialogDirective<CategoryModel> {
  readonly titleKeys: CrudDialogTitleKeys = {
    create: 'CATEGORIES.ADD_TITLE',
    update: 'CATEGORIES.EDIT_TITLE',
    view: 'CATEGORIES.EDIT_TITLE',
  };

  // The Ar/En name columns aren't in the form (single "name" field, like the
  // rest of the app) - fall back to it, matching the previous CategoryService flow.
  override prepareModel(): CategoryModel {
    const model = super.prepareModel();
    model.nameAr = model.nameAr || model.name;
    model.nameEn = model.nameEn || model.name;
    return model;
  }

  override afterSaveSuccess(saved: CategoryModel): void {
    this.errorHandler.showSuccess(this.isUpdateMode() ? 'CATEGORIES.UPDATE_SUCCESS' : 'CATEGORIES.ADD_SUCCESS');
    this.dialogRef.close(saved);
  }

  override afterSaveFail(error: unknown): void {
    this.saving.set(false);
    this.errorHandler.handleHttpError(error as HttpErrorResponse, this.isUpdateMode() ? 'CATEGORIES.UPDATE_ERROR' : 'CATEGORIES.ADD_ERROR');
  }
}
