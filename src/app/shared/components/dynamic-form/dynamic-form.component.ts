import { Component, computed, effect, inject, input, model, output, signal, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  // Inputs y outputs
  config = input.required<PageFormConfig>();
  initialData = input<Record<string, unknown> | null>(null);
  submitButtonText = input('Guardar');
  showReset = input(false);
  saveOnSubmit = input(true);

  // Two-way binding para formulario válido
  formValid = model(false);

  // Outputs
  formSubmit = output<Record<string, unknown>>();
  formCancel = output<void>();
  formReset = output<void>();
  fieldChange = output<{ field: string, value: unknown }>();

  // Servicios
  private formService = inject(DynamicFormService);
  private conditionService = inject(ConditionService);

  // Form y estado
  form!: FormGroup;
  fieldVisibility = signal<Record<string, boolean>>({});
  sectionVisibility = signal<Record<string, boolean>>({});
  rowVisibility = signal<Record<string, boolean>>({});
  collapsedSections = signal<Set<string>>(new Set());

  // Computed signals para valores derivados
  formValues = computed(() => this.form?.getRawValue() as Record<string, unknown>);
  formDirty = computed(() => this.form?.dirty || false);
  formTouched = computed(() => this.form?.touched || false);
  submitDisabled = computed(() => !this.form?.valid);
  showResetButton = computed(() => this.showReset() && this.formDirty());

  constructor() {


    // Aplicar datos iniciales cuando estén disponibles
    effect(() => {
      const data = this.initialData();
      if (data && this.form) {

        this.updateFormValues(data);
        this.form.markAsPristine();
      }
    });
  }

  ngOnInit(): void {

    try {
      const formConfig = this.config();
      if (formConfig) {

        this.initForm(formConfig);

        // Inicializar secciones colapsadas
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

  // Inicializar el formulario con manejo de errores apropiado
  private initForm(config: PageFormConfig): void {

    try {
      this.form = this.formService.createFormGroup(config);
      this.formValid.set(this.form.valid);

      // Inicializar visibilidad
      const initialValues = this.form.getRawValue();
      this.updateVisibility(initialValues as Record<string, unknown>);

      // Añadir suscripción a valueChanges

      this.form.valueChanges.subscribe({
        next: (values) => {
          try {
            this.updateVisibility(values as Record<string, unknown>);
            this.formValid.set(this.form.valid);
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


    } catch (error) {
      console.error('Error en initForm completo:', error);
    }
  }

  // Método de utilidad para actualizar los valores del formulario
  private updateFormValues(data: Record<string, unknown>): void {
    if (!data) return;

    try {
      // Actualizar los valores uno por uno para evitar problemas de tipo
      Object.keys(data).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.setValue(data[key]);
        }
      });
    } catch (error) {
      console.error('Error al actualizar valores del formulario:', error);
    }
  }

  // Actualizar la visibilidad de secciones, filas y campos
  private updateVisibility(formValues: Record<string, unknown>): void {
    try {
      const config = this.config();

      // Visibilidad de secciones
      const sectionsMap: Record<string, boolean> = {};
      config.sections.forEach(section => {
        sectionsMap[section.id] = this.conditionService.shouldDisplay(section.visibleWhen, formValues);
      });
      this.sectionVisibility.set(sectionsMap);

      // Visibilidad de filas
      const rowsMap: Record<string, boolean> = {};
      config.sections.forEach(section => {
        const isSectionVisible = sectionsMap[section.id];

        section.rows.forEach(row => {
          rowsMap[row.id] = isSectionVisible &&
            this.conditionService.shouldDisplay(row.visibleWhen, formValues);
        });
      });
      this.rowVisibility.set(rowsMap);

      // Visibilidad de campos
      const fieldsMap: Record<string, boolean> = {};
      // Recopilar primero todos los cambios de visibilidad
      const controlChanges: { control: any, enable: boolean }[] = [];

      config.sections.forEach(section => {
        const isSectionVisible = sectionsMap[section.id];

        section.rows.forEach(row => {
          const isRowVisible = rowsMap[row.id];

          row.fields.forEach(field => {
            const isVisible = isRowVisible &&
              this.conditionService.shouldDisplay(field.visibleWhen, formValues);

            fieldsMap[field.name] = isVisible;

            // Añadir a la lista de cambios pero no actualizar aún
            const control = this.form.get(field.name);
            if (control) {
              controlChanges.push({ control, enable: isVisible });
            }
          });
        });
      });

      // Actualizar la signal de visibilidad
      this.fieldVisibility.set(fieldsMap);

      // Aplicar cambios de habilitar/deshabilitar en batch sin emitir eventos
      // Esto evita el ciclo infinito de actualizaciones
      if (controlChanges.length > 0) {
        // Desactivar temporalmente las notificaciones de valueChanges
        const subscription = this.form.valueChanges.subscribe();
        subscription.unsubscribe();

        // Aplicar cambios
        controlChanges.forEach(change => {
          if (change.enable) {
            change.control.enable({ emitEvent: false, onlySelf: true });
          } else {
            change.control.disable({ emitEvent: false, onlySelf: true });
          }
        });

        // Actualizar el estado del formulario sin emitir evento
        this.form.updateValueAndValidity({ emitEvent: false });
      }
    } catch (error) {
      console.error('Error en updateVisibility:', error);
    }
  }

  // Alternar el estado de colapso de una sección
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

  // Manejar cambio de valor en un campo
  onFieldValueChange(event: { field: string, value: unknown }): void {
    try {
      // Emitir evento de cambio
      this.fieldChange.emit(event);
    } catch (error) {
      console.error('Error en onFieldValueChange:', error);
    }
  }

  // Manejar envío del formulario
  onSubmit(): void {
    try {
      if (this.form.valid) {
        const formData = this.form.getRawValue();

        // Guardar en API si está configurado
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
                // Aquí podrías manejar errores de validación del servidor
              }
            });
          } else {
            // Si no hay endpoint, solo emitir los datos
            this.formSubmit.emit(formData);
          }
        } else {
          // Si no se debe guardar automáticamente, solo emitir los datos
          this.formSubmit.emit(formData);
        }
      } else {
        // Marcar todos los campos como tocados para mostrar errores
        Object.keys(this.form.controls).forEach(key => {
          const control = this.form.get(key);
          control?.markAsTouched();
        });
      }
    } catch (error) {
      console.error('Error en onSubmit:', error);
    }
  }

  // Manejar cancelación del formulario
  onCancel(): void {
    try {
      this.formCancel.emit();
    } catch (error) {
      console.error('Error en onCancel:', error);
    }
  }

  // Manejar reset del formulario
  onReset(): void {
    try {
      // Si hay datos iniciales, volver a ellos
      if (this.initialData()) {
        this.updateFormValues(this.initialData()!);
      } else {
        // Si no, resetear a valores por defecto
        this.form.reset();
      }
      this.form.markAsPristine();
      this.formReset.emit();
    } catch (error) {
      console.error('Error en onReset:', error);
    }
  }
}