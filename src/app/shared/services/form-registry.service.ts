import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, catchError, lastValueFrom, of, tap } from 'rxjs';
import { PageFormConfig } from '../models/form.models';

@Injectable({
    providedIn: 'root'
})
export class FormRegistryService {
    private http = inject(HttpClient);

    // Signal para almacenar formularios registrados
    private formConfigs = signal<Map<string, PageFormConfig>>(new Map());

    // Signal calculado para obtener la lista de IDs de formularios
    readonly formIds = computed(() => Array.from(this.formConfigs().keys()));

    /**
     * Registra una configuración de formulario
     */
    registerForm(config: PageFormConfig): void {
        // Usamos la API de mutación para actualizar la signal
        this.formConfigs.update(forms => {
            const newForms = new Map(forms);
            newForms.set(config.id, config);
            return newForms;
        });
    }

    /**
     * Obtiene una configuración de formulario por su ID
     */
    getFormConfig(formId: string): PageFormConfig | undefined {
        return this.formConfigs().get(formId);
    }

    /**
     * Inicializa los formularios predefinidos
     */
    initialize(): Promise<void> {
        // En una app real, podrías cargar esto desde una API
        // Por ahora, los formularios se registrarán desde los módulos de características
        return Promise.resolve();
    }

    /**
     * Carga configuraciones de formularios desde un endpoint
     */
    loadFormConfigs(url: string): Promise<void> {
        return lastValueFrom(
            this.http.get<PageFormConfig[]>(url).pipe(
                tap(configs => {
                    configs.forEach(config => this.registerForm(config));
                }),
                catchError(error => {
                    console.error('Error loading form configurations:', error);
                    return of(null);
                })
            )
        ).then(() => { });
    }
}