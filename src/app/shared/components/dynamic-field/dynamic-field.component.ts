import { Component, input, output, inject, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormGroupDirective, ValidationErrors } from '@angular/forms';
import {
  FieldConfig, TextFieldConfig, NumberFieldConfig, SelectFieldConfig,
  CheckboxFieldConfig, DateFieldConfig, TextareaFieldConfig, RadioFieldConfig
} from '../../models/form.models';

@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
  host: {
    '[class]': '"col-" + config().colSpan'
  }
})
export class DynamicFieldComponent implements OnInit {
  @ViewChild('inputElement') inputElement?: ElementRef;
  @ViewChild('errorElement') errorElement?: ElementRef;

  // Input para la configuración del campo
  config = input.required<FieldConfig>();
  fieldChange = output<{ field: string, value: unknown }>();

  // Obtener contexto del formulario usando inject
  private formDirective = inject(FormGroupDirective);
  formGroup = computed(() => this.formDirective.form);

  // Señal para el control actual
  control = computed(() => this.formGroup().get(this.config().name));

  // Estado interno 
  forceShowError = false;
  currentErrorMessage = '';

  // Señales computadas para tipos específicos de campos
  textConfig = computed(() => this.config() as TextFieldConfig);
  numberConfig = computed(() => this.config() as NumberFieldConfig);
  selectConfig = computed(() => this.config() as SelectFieldConfig);
  checkboxConfig = computed(() => this.config() as CheckboxFieldConfig);
  dateConfig = computed(() => this.config() as DateFieldConfig);
  textareaConfig = computed(() => this.config() as TextareaFieldConfig);
  radioConfig = computed(() => this.config() as RadioFieldConfig);

  // Verificación de valor vacío
  private isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value) && (value.length === 0 || (value.length === 1 && (value[0] === '' || value[0] === null)))) {
      return true;
    }
    if (typeof value === 'string' && (value.startsWith('0:') || value === '')) {
      return true;
    }
    return false;
  }

  // Señal para la clase CSS del input
  inputClass = computed(() => {
    const classes: Record<string, boolean> = {
      'form-control': this.config().type !== 'select',
      'form-select': this.config().type === 'select',
      'is-invalid': this.forceShowError
    };

    // Agregar clases personalizadas
    const customClasses = this.config().customClasses;
    if (customClasses) {
      customClasses.split(' ').forEach(cls => {
        if (cls.trim()) {
          classes[cls.trim()] = true;
        }
      });
    }

    return classes;
  });

  ngOnInit(): void {
    // Configuración inicial para campos requeridos
    const ctrl = this.control();
    if (ctrl && this.config().required) {
      if (this.isEmptyValue(ctrl.value)) {
        ctrl.setErrors({ 'required': true });
      }
    }
  }

  // Método privado para determinar y establecer el mensaje de error
  private getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Este campo es obligatorio';
    } else if (errors['email']) {
      return 'Debe ser un correo electrónico válido';
    } else if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    } else if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    } else if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    } else if (errors['maxlength']) {
      return `No debe exceder ${errors['maxlength'].requiredLength} caracteres`;
    } else if (errors['pattern']) {
      return 'El formato no es válido';
    }

    // Para otros tipos de error
    const firstErrorKey = Object.keys(errors)[0];
    return `Error de validación: ${firstErrorKey}`;
  }

  // Manejar cambios en el campo
  onFieldChange(): void {
    const ctrl = this.control();
    if (!ctrl) return;

    // Marcar como dirty (pero NO aplicamos la validación visual aquí)
    ctrl.markAsDirty();

    // Validación para campos requeridos
    if (this.config().required) {
      if (this.isEmptyValue(ctrl.value)) {
        ctrl.setErrors({ 'required': true });
      } else if (ctrl.errors && 'required' in ctrl.errors) {
        // Si ya no está vacío, quitar el error 'required' pero mantener otros
        const otherErrors = { ...ctrl.errors };
        delete otherErrors['required'];

        if (Object.keys(otherErrors).length === 0) {
          ctrl.setErrors(null);
        } else {
          ctrl.setErrors(otherErrors);
        }
      }
    }

    // Emitir evento
    this.fieldChange.emit({
      field: this.config().name,
      value: ctrl.value
    });
  }

  // Manejar pérdida de foco - AQUÍ es donde aplicamos la validación visual
  onBlur(): void {
    const ctrl = this.control();
    if (!ctrl) return;

    // Marcar como touched
    ctrl.markAsTouched();

    // Validar campo requerido vacío
    if (this.config().required && this.isEmptyValue(ctrl.value)) {
      ctrl.setErrors({ 'required': true });
    }

    // Aplicar visualización de errores SOLO cuando pierde el foco
    if (ctrl.invalid && (ctrl.touched || ctrl.dirty)) {
      this.forceShowError = true;
      this.currentErrorMessage = this.getErrorMessage(ctrl.errors || {});
    } else {
      this.forceShowError = false;
      this.currentErrorMessage = '';
    }
  }
}