import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import {
  FieldConfig, TextFieldConfig, NumberFieldConfig, SelectFieldConfig,
  CheckboxFieldConfig, DateFieldConfig, TextareaFieldConfig, RadioFieldConfig,
  FieldValidator
} from '../../models/form.models';

interface ErrorMessages {
  required?: string;
  email?: string;
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  [key: string]: string | undefined;
}


@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
  host: {
    '[class]': '"col-" + config().colSpan'
  }
})
export class DynamicFieldComponent {
  // Input para la configuración del campo
  config = input.required<FieldConfig>();
  fieldChange = output<{ field: string, value: unknown }>();

  // Obtener contexto del formulario usando linkedSignal
  private formDirective = inject(FormGroupDirective);
  formGroup = computed(() => this.formDirective.form);

  // Señales computadas para el control actual
  private control = computed(() => this.formGroup().get(this.config().name));

  // Señales computadas para el estado del control
  controlInvalid = computed(() => {
    const ctrl = this.control();
    return !!ctrl && ctrl.invalid;
  });

  controlTouched = computed(() => {
    const ctrl = this.control();
    return !!ctrl && ctrl.touched;
  });

  // Señales computadas para tipos específicos de campos
  textConfig = computed(() => this.config() as TextFieldConfig);
  numberConfig = computed(() => this.config() as NumberFieldConfig);
  selectConfig = computed(() => this.config() as SelectFieldConfig);
  checkboxConfig = computed(() => this.config() as CheckboxFieldConfig);
  dateConfig = computed(() => this.config() as DateFieldConfig);
  textareaConfig = computed(() => this.config() as TextareaFieldConfig);
  radioConfig = computed(() => this.config() as RadioFieldConfig);

  // Señal computada para el texto de error
  errorText = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    // Obtener mensajes personalizados
    const customMessages = this.getCustomErrorMessages(this.config().validators);

    // Errores estándar
    if (ctrl.errors['required']) {
      return customMessages?.['required'] || 'Este campo es obligatorio';
    }

    if (ctrl.errors['email']) {
      return customMessages?.['email'] || 'Ingrese un correo electrónico válido';
    }

    if (ctrl.errors['min']) {
      return customMessages?.['min'] ||
        `El valor mínimo es ${ctrl.errors['min'].min}`;
    }

    if (ctrl.errors['max']) {
      return customMessages?.['max'] ||
        `El valor máximo es ${ctrl.errors['max'].max}`;
    }

    if (ctrl.errors['minlength']) {
      return customMessages?.['minLength'] ||
        `Debe tener al menos ${ctrl.errors['minlength'].requiredLength} caracteres`;
    }

    if (ctrl.errors['maxlength']) {
      return customMessages?.['maxLength'] ||
        `No debe exceder ${ctrl.errors['maxlength'].requiredLength} caracteres`;
    }

    if (ctrl.errors['pattern']) {
      return customMessages?.['pattern'] || 'Formato no válido';
    }

    return 'Campo inválido';
  });

  // Obtener mensajes personalizados de validadores (función privada)
  private getCustomErrorMessages(validators?: FieldValidator[]): ErrorMessages | undefined {
    if (!validators || validators.length === 0) return undefined;

    return validators.reduce((acc: ErrorMessages, validator) => {
      if (validator.message) {
        acc[validator.type] = validator.message;
      }
      return acc;
    }, {});
  }

  // Manejar cambios en el campo
  onFieldChange(): void {
    const fieldName = this.config().name;
    const ctrl = this.control();

    if (ctrl) {
      this.fieldChange.emit({
        field: fieldName,
        value: ctrl.value
      });
    }
  }
}
