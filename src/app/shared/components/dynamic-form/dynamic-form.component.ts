import { Component, computed, effect, inject, input, model, output, signal, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { PageFormConfig } from '../../models/form.models';
import { ConditionService } from '../../services/condition.service';
import { DynamicFormService } from '../../services/dynamic-form.service';
import { CommonModule } from '@angular/common';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, CommonModule, DynamicFieldComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  config = input.required<PageFormConfig>();
  initialData = input<Record<string, unknown> | null>(null);
  submitButtonText = input('Guardar');
  showReset = input(false);
  saveOnSubmit = input(true);

  formValid = model(false);

  formSubmit = output<Record<string, unknown>>();
  formCancel = output<void>();
  formReset = output<void>();
  fieldChange = output<{ field: string, value: unknown }>();

  private formService = inject(DynamicFormService);
  private conditionService = inject(ConditionService);

  form!: FormGroup;
  fieldVisibility = signal<Record<string, boolean>>({});
  sectionVisibility = signal<Record<string, boolean>>({});
  rowVisibility = signal<Record<string, boolean>>({});
  collapsedSections = signal<Set<string>>(new Set());

  private isValidating = false;

  formValues = computed(() => this.form?.getRawValue() as Record<string, unknown>);
  formDirty = computed(() => this.form?.dirty || false);
  formTouched = computed(() => this.form?.touched || false);

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data && this.form) {
        this.updateFormValues(data);
        this.form.markAsPristine();
      }
    });

    effect(() => {
      if (this.form) {
        this.formValid.set(this.form.valid);
      }
    });
  }

  ngOnInit(): void {
    try {
      const formConfig = this.config();
      if (formConfig) {
        this.initForm(formConfig);

        const collapsed = new Set<string>();
        formConfig.sections.forEach(section => {
          if (section.collapsible && section.collapsed) {
            collapsed.add(section.id);
          }
        });
        this.collapsedSections.set(collapsed);
      }
    } catch (error) {
      console.error('Error durante la inicialización en ngOnInit:', error);
    }
  }

  private initForm(config: PageFormConfig): void {
    try {
      this.form = this.formService.createFormGroup(config);

      const initialValues = this.form.getRawValue();
      this.updateVisibility(initialValues as Record<string, unknown>);

      this.formValid.set(this.form.valid);

      this.form.valueChanges.subscribe({
        next: (values) => {
          try {
            this.updateVisibility(values as Record<string, unknown>);

            if (!this.isValidating) {
              this.formValid.set(this.form.valid);
            }

            this.fieldChange.emit({
              field: '_formValues',
              value: values
            });
          } catch (error) {
            console.error('Error en el manejo de valueChanges:', error);
          }
        },
        error: (error) => console.error('Error en valueChanges:', error)
      });

      this.form.statusChanges.subscribe(status => {
        console.log('Cambio de estado del formulario:', status);
        this.formValid.set(status === 'VALID');
      });
    } catch (error) {
      console.error('Error en initForm completo:', error);
    }
  }

  validateAllFormFields(): void {
    if (!this.form || this.isValidating) return;

    this.isValidating = true;

    try {
      Object.keys(this.form.controls).forEach(field => {
        const control = this.form.get(field);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });

      this.form.updateValueAndValidity({ emitEvent: false });
      this.formValid.set(this.form.valid);
    } finally {
      this.isValidating = false;
    }
  }

  private updateFormValues(data: Record<string, unknown>): void {
    if (!data) return;

    try {
      this.isValidating = true;

      Object.keys(data).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.setValue(data[key], { emitEvent: false });
        }
      });

      this.form.updateValueAndValidity({ emitEvent: false });

      this.updateVisibility(this.form.getRawValue());

      this.formValid.set(this.form.valid);
    } catch (error) {
      console.error('Error al actualizar valores del formulario:', error);
    } finally {
      this.isValidating = false;
    }
  }

  private updateVisibility(formValues: Record<string, unknown>): void {
    try {
      const config = this.config();

      const sectionsMap: Record<string, boolean> = {};
      config.sections.forEach(section => {
        sectionsMap[section.id] = this.conditionService.shouldDisplay(section.visibleWhen, formValues);
      });
      this.sectionVisibility.set(sectionsMap);

      const rowsMap: Record<string, boolean> = {};
      config.sections.forEach(section => {
        const isSectionVisible = sectionsMap[section.id];

        section.rows.forEach(row => {
          rowsMap[row.id] = isSectionVisible &&
            this.conditionService.shouldDisplay(row.visibleWhen, formValues);
        });
      });
      this.rowVisibility.set(rowsMap);

      const fieldsMap: Record<string, boolean> = {};
      const controlChanges: { control: any, enable: boolean }[] = [];

      config.sections.forEach(section => {
        const isSectionVisible = sectionsMap[section.id];

        section.rows.forEach(row => {
          const isRowVisible = rowsMap[row.id];

          row.fields.forEach(field => {
            const isVisible = isRowVisible &&
              this.conditionService.shouldDisplay(field.visibleWhen, formValues);

            fieldsMap[field.name] = isVisible;

            const control = this.form.get(field.name);
            if (control) {
              controlChanges.push({ control, enable: isVisible });
            }
          });
        });
      });

      this.fieldVisibility.set(fieldsMap);

      this.isValidating = true;

      try {
        if (controlChanges.length > 0) {
          controlChanges.forEach(change => {
            if (change.enable) {
              if (change.control.disabled) {
                change.control.enable({ emitEvent: false });
              }
            } else {
              if (change.control.enabled) {
                change.control.disable({ emitEvent: false });
              }
            }
          });

          this.form.updateValueAndValidity({ emitEvent: false });
          this.formValid.set(this.form.valid);
        }
      } finally {
        this.isValidating = false;
      }
    } catch (error) {
      console.error('Error en updateVisibility:', error);
    }
  }

  toggleSectionCollapse(sectionId: string): void {
    try {
      this.collapsedSections.update(sections => {
        const newSections = new Set(sections);
        if (newSections.has(sectionId)) {
          newSections.delete(sectionId);
        } else {
          newSections.add(sectionId);
        }
        return newSections;
      });
    } catch (error) {
      console.error('Error al alternar colapso de sección:', error);
    }
  }

  onFieldValueChange(event: { field: string, value: unknown }): void {
    try {
      this.fieldChange.emit(event);
    } catch (error) {
      console.error('Error en onFieldValueChange:', error);
    }
  }

  onSubmit(): void {
    try {
      console.log('onSubmit llamado, estado del formulario:', this.form.valid);

      if (!this.form.valid) {
        this.markFieldsAsTouched();
        return;
      }

      const formData = this.form.getRawValue();

      if (this.saveOnSubmit()) {
        const endpoint = this.config().apiEndpoints?.save;
        if (endpoint) {
          this.formService.submitForm(endpoint, formData).subscribe({
            next: (response) => {
              this.formSubmit.emit(formData);
              this.form.markAsPristine();
            },
            error: (error) => {
              console.error('Error al guardar:', error);
            }
          });
        } else {
          this.formSubmit.emit(formData);
        }
      } else {
        this.formSubmit.emit(formData);
      }
    } catch (error) {
      console.error('Error en onSubmit:', error);
    }
  }

  markFieldsAsTouched(): void {
    if (!this.form) return;

    this.isValidating = true;

    try {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });

      this.form.updateValueAndValidity({ emitEvent: false });

      this.formValid.set(this.form.valid);
    } finally {
      this.isValidating = false;
    }
  }

  onCancel(): void {
    try {
      this.formCancel.emit();
    } catch (error) {
      console.error('Error en onCancel:', error);
    }
  }

  onReset(): void {
    try {
      this.isValidating = true;

      try {
        if (this.initialData()) {
          Object.keys(this.initialData()!).forEach(key => {
            const control = this.form.get(key);
            if (control) {
              control.setValue(this.initialData()![key], { emitEvent: false });
            }
          });
        } else {
          this.form.reset({}, { emitEvent: false });
        }

        this.form.markAsPristine();
        this.form.updateValueAndValidity({ emitEvent: false });
        this.formReset.emit();
      } finally {
        this.isValidating = false;
      }
    } catch (error) {
      console.error('Error en onReset:', error);
    }
  }
}