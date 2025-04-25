import { Injectable } from '@angular/core';
import { ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DisplayCondition, FieldConfig, FieldValidator, NumberFieldConfig, PageFormConfig, TextareaFieldConfig, TextFieldConfig } from '../models/form.models';

export function strictRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value === null || control.value === undefined) {
            return { 'required': true };
        }

        if (typeof control.value === 'string' && control.value.trim() === '') {
            return { 'required': true };
        }

        if (Array.isArray(control.value) && control.value.length === 0) {
            return { 'required': true };
        }

        if (typeof control.value === 'string' && control.value.startsWith('0:')) {
            return { 'required': true };
        }

        if (Array.isArray(control.value) &&
            control.value.length === 1 &&
            (control.value[0] === '' || control.value[0] === null || control.value[0] === undefined)) {
            return { 'required': true };
        }

        return null;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ConditionService {
    shouldDisplay(conditions: DisplayCondition[] | undefined, formValues: Record<string, unknown>): boolean {
        if (!conditions || conditions.length === 0) {
            return true;
        }

        return conditions.every(condition => this.evaluateCondition(condition, formValues));
    }

    private evaluateCondition(condition: DisplayCondition, formValues: Record<string, unknown>): boolean {
        if (!(condition.sourceField in formValues)) {
            return false;
        }

        let sourceValue = formValues[condition.sourceField];

        if (Array.isArray(sourceValue) && sourceValue.length === 1) {
            sourceValue = sourceValue[0];
        }

        if (sourceValue === '') {
            sourceValue = null;
        }

        if (typeof sourceValue === 'string' && sourceValue.startsWith('0:')) {
            if (sourceValue.length > 3) {
                const extractedValue = sourceValue.substring(3).trim();
                if (extractedValue.startsWith("'") && extractedValue.endsWith("'")) {
                    sourceValue = extractedValue.substring(1, extractedValue.length - 1);
                } else {
                    sourceValue = extractedValue;
                }
            } else {
                sourceValue = '';
            }
        }

        switch (condition.operator) {
            case 'equals':
                return this.compareValues(sourceValue, condition.value);

            case 'notEquals':
                return !this.compareValues(sourceValue, condition.value);

            case 'contains': {
                if (typeof sourceValue === 'string') {
                    return sourceValue.includes(String(condition.value || ''));
                } else if (Array.isArray(sourceValue)) {
                    if (sourceValue.length === 0) return false;
                    return sourceValue.some(val => this.compareValues(val, condition.value));
                }
                return false;
            }

            case 'in': {
                if (Array.isArray(condition.value)) {
                    if (Array.isArray(sourceValue)) {
                        return sourceValue.some(value =>
                            Array.isArray(condition.value) && condition.value.some(condVal =>
                                this.compareValues(value, condVal)
                            )
                        );
                    }
                    return Array.isArray(condition.value) && condition.value.some(condVal =>
                        this.compareValues(sourceValue, condVal)
                    );
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

    private compareValues(value1: unknown, value2: unknown): boolean {
        if (value1 === null || value1 === undefined) {
            return value2 === null || value2 === undefined;
        }

        if (typeof value1 === 'boolean') {
            if (typeof value2 === 'string') {
                return value1 === (value2.toLowerCase() === 'true');
            }
            return value1 === value2;
        }

        if (typeof value1 === 'string') {
            if (typeof value2 === 'string') {
                return value1.toLowerCase() === value2.toLowerCase();
            }
            return String(value1) === String(value2);
        }

        if (typeof value1 === 'number') {
            return value1 === Number(value2);
        }

        return value1 === value2;
    }

    updateFieldVisibility(config: PageFormConfig, formValues: Record<string, unknown>): Record<string, boolean> {
        const fieldVisibility: Record<string, boolean> = {};

        config.sections.forEach(section => {
            const isSectionVisible = this.shouldDisplay(section.visibleWhen, formValues);

            section.rows.forEach(row => {
                const isRowVisible = isSectionVisible && this.shouldDisplay(row.visibleWhen, formValues);

                row.fields.forEach(field => {
                    fieldVisibility[field.name] = isRowVisible && this.shouldDisplay(field.visibleWhen, formValues);
                });
            });
        });

        return fieldVisibility;
    }

    buildValidators(field: FieldConfig): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.required) {
            if (field.type === 'select') {
                validators.push(strictRequiredValidator());
            } else {
                validators.push(Validators.required);
            }
        }

        if (field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'textarea') {
            const textField = field as TextFieldConfig | TextareaFieldConfig;

            if ('minLength' in textField && textField.minLength) {
                validators.push(Validators.minLength(textField.minLength));
            }

            if ('maxLength' in textField && textField.maxLength) {
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

        if (field.validators && field.validators.length > 0) {
            field.validators.forEach(validator => {
                this.addCustomValidator(validators, validator);
            });
        }

        return validators;
    }

    private addCustomValidator(validators: ValidatorFn[], validator: FieldValidator): void {
        switch (validator.type) {
            case 'required':
                validators.push(Validators.required);
                break;
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
    }
}