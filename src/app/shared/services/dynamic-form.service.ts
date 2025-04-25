import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { PageFormConfig } from '../models/form.models';
import { ConditionService } from './condition.service';
import { FormDataService } from './form-data.service';

// Validador personalizado para asegurar que la opción seleccionada no sea vacía
function selectRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (value === '' || value === null || value === undefined ||
            (typeof value === 'string' && value.startsWith('0:'))) {
            return { 'required': true };
        }
        return null;
    };
}

@Injectable({
    providedIn: 'root'
})
export class DynamicFormService {
    private fb = inject(FormBuilder);
    private conditionService = inject(ConditionService);
    private dataService = inject(FormDataService);

    // Signal para almacenar el estado de los formularios
    private formState = signal<Map<string, unknown>>(new Map());

    /**
     * Crea un FormGroup a partir de la configuración del formulario
     */
    createFormGroup(config: PageFormConfig): FormGroup {
        // Crear controles
        const controls: Record<string, FormControl<unknown>> = {};

        // Recorrer todos los campos y agregarlos al grupo
        config.sections.forEach(section => {
            section.rows.forEach(row => {
                row.fields.forEach(field => {
                    // Obtener los validadores para este campo
                    let validators = this.conditionService.buildValidators(field);

                    // Ajuste para valores por defecto
                    let defaultValue = field.defaultValue ?? null;

                    // Para campos de tipo select, tratamiento especial para la validación
                    if (field.type === 'select') {
                        // En selects requeridos, usar empty string y agregar validador personalizado
                        defaultValue = '';

                        // Si es requerido, agregar nuestro validador personalizado para selects
                        if (field.required) {
                            validators = [...validators, selectRequiredValidator()];
                        }
                    }

                    // Crear el control
                    const control = new FormControl<unknown>(
                        defaultValue,
                        validators
                    );

                    controls[field.name] = control;
                });
            });
        });

        // Crear y devolver el FormGroup
        const formGroup = this.fb.group(controls);

        // Forzar una validación completa del formulario
        setTimeout(() => {
            formGroup.updateValueAndValidity();
        }, 0);

        return formGroup;
    }

    /**
     * Obtiene el valor actual de un formulario del estado
     */
    getFormState(formId: string): Record<string, unknown> | null {
        return (this.formState().get(formId) as Record<string, unknown>) || null;
    }

    /**
     * Guarda el estado actual de un formulario
     */
    saveFormState(formId: string, state: Record<string, unknown>): void {
        this.formState.update(states => {
            const newStates = new Map(states);
            newStates.set(formId, state);
            return newStates;
        });
    }

    /**
     * Envía los datos del formulario a la API
     */
    submitForm(apiEndpoint: string, formData: Record<string, unknown>): Observable<unknown> {
        return this.dataService.saveFormData(apiEndpoint, formData);
    }

    /**
     * Carga datos para un formulario desde la API
     */
    loadFormData(apiEndpoint: string, params?: Record<string, unknown>): Observable<Record<string, unknown> | null> {
        return this.dataService.loadFormData(apiEndpoint, params);
    }
}