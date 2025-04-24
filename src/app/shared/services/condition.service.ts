
import { Injectable } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DisplayCondition, FieldConfig, FieldValidator, NumberFieldConfig, PageFormConfig, TextareaFieldConfig, TextFieldConfig } from '../models/form.models';

@Injectable({
    providedIn: 'root'
})
export class ConditionService {
    /**
     * Evalúa si un elemento debe mostrarse según sus condiciones
     */
    shouldDisplay(conditions: DisplayCondition[] | undefined, formValues: Record<string, unknown>): boolean {
        // Si no hay condiciones, se muestra siempre
        if (!conditions || conditions.length === 0) {
            return true;
        }

        // Debe cumplirse todas las condiciones (AND lógico)
        return conditions.every(condition => this.evaluateCondition(condition, formValues));
    }

    /**
     * Evalúa una condición individual
     */
    private evaluateCondition(condition: DisplayCondition, formValues: Record<string, unknown>): boolean {
        // Si el campo fuente no existe en los valores, la condición falla
        if (!(condition.sourceField in formValues)) {
            return false;
        }

        let sourceValue = formValues[condition.sourceField];

        if (Array.isArray(sourceValue) && sourceValue.length === 1) {
            sourceValue = sourceValue[0];
        }
        switch (condition.operator) {
            case 'equals':
                return sourceValue === condition.value;

            case 'notEquals':
                return sourceValue !== condition.value;

            case 'contains': {
                if (typeof sourceValue === 'string') {
                    return sourceValue.includes(String(condition.value || ''));
                } else if (Array.isArray(sourceValue)) {
                    return sourceValue.includes(condition.value as never);
                }
                return false;
            }

            case 'in': {
                // Si condition.value es un array, verificamos si sourceValue está en él
                if (Array.isArray(condition.value)) {
                    // Si sourceValue también es un array
                    if (Array.isArray(sourceValue)) {
                        // Verificar si hay algún valor de sourceValue que esté en condition.value
                        return sourceValue.some(value =>
                            Array.isArray(condition.value) && condition.value.includes(value as any)
                        );
                    }
                    // Si sourceValue es un valor simple
                    return Array.isArray(condition.value) && condition.value.includes(sourceValue as any);
                }
                return false;
            }

            case 'greaterThan': {
                const numValue = Number(sourceValue);
                const compareValue = Number(condition.value);
                return !isNaN(numValue) && !isNaN(compareValue) && numValue > compareValue;
            }

            case 'lessThan': {
                const numValue = Number(sourceValue);
                const compareValue = Number(condition.value);
                return !isNaN(numValue) && !isNaN(compareValue) && numValue < compareValue;
            }

            case 'isEmpty':
                return sourceValue === null || sourceValue === undefined ||
                    sourceValue === '' || (Array.isArray(sourceValue) && sourceValue.length === 0);

            case 'isNotEmpty':
                return sourceValue !== null && sourceValue !== undefined &&
                    sourceValue !== '' && (!Array.isArray(sourceValue) || sourceValue.length > 0);

            default:
                console.warn(`Operador '${condition.operator}' no soportado`);
                return false;
        }
    }

    /**
     * Actualiza la visibilidad de todos los campos en el formulario
     */
    updateFieldVisibility(config: PageFormConfig, formValues: Record<string, unknown>): Record<string, boolean> {
        const fieldVisibility: Record<string, boolean> = {};

        // Iteramos por cada sección, fila y campo
        config.sections.forEach(section => {
            // Primero verificamos si la sección es visible
            const isSectionVisible = this.shouldDisplay(section.visibleWhen, formValues);

            section.rows.forEach(row => {
                // Verificamos si la fila es visible (solo si la sección también lo es)
                const isRowVisible = isSectionVisible && this.shouldDisplay(row.visibleWhen, formValues);

                row.fields.forEach(field => {
                    // Un campo es visible si la sección y fila son visibles, y además cumple sus propias condiciones
                    fieldVisibility[field.name] = isRowVisible && this.shouldDisplay(field.visibleWhen, formValues);
                });
            });
        });

        return fieldVisibility;
    }

    /**
     * Construye validadores basados en la configuración del campo
     */
    buildValidators(field: FieldConfig): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        // Validador required
        if (field.required) {
            validators.push(Validators.required);
        }

        // Validadores adicionales según el tipo de campo
        if (field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'textarea') {
            const textField = field as TextFieldConfig | TextareaFieldConfig;

            if (textField.minLength) {
                validators.push(Validators.minLength(textField.minLength));
            }

            if (textField.maxLength) {
                validators.push(Validators.maxLength(textField.maxLength));
            }

            if (field.type === 'email') {
                validators.push(Validators.email);
            }

            if ('pattern' in textField && textField.pattern) {
                validators.push(Validators.pattern(textField.pattern));
            }
        }

        if (field.type === 'number') {
            const numField = field as NumberFieldConfig;

            if (numField.min !== undefined) {
                validators.push(Validators.min(numField.min));
            }

            if (numField.max !== undefined) {
                validators.push(Validators.max(numField.max));
            }
        }

        // Validadores personalizados
        if (field.validators && field.validators.length > 0) {
            field.validators.forEach(validator => {
                switch (validator.type) {
                    case 'min':
                        validators.push(Validators.min(validator.value as number));
                        break;
                    case 'max':
                        validators.push(Validators.max(validator.value as number));
                        break;
                    case 'minLength':
                        validators.push(Validators.minLength(validator.value as number));
                        break;
                    case 'maxLength':
                        validators.push(Validators.maxLength(validator.value as number));
                        break;
                    case 'email':
                        validators.push(Validators.email);
                        break;
                    case 'pattern':
                        validators.push(Validators.pattern(validator.value as string));
                        break;
                }
            });
        }

        return validators;
    }
}