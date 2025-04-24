import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PageFormConfig } from '../models/form.models';
import { ConditionService } from './condition.service';
import { FormDataService } from './form-data.service';

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
                    const validators = this.conditionService.buildValidators(field);

                    // Crear el control con su valor por defecto
                    controls[field.name] = new FormControl<unknown>(
                        field.defaultValue ?? null,
                        validators
                    );
                });
            });
        });

        // Crear el FormGroup
        return this.fb.nonNullable.group(controls);
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