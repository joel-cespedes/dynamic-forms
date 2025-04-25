import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, catchError, lastValueFrom, of, tap } from 'rxjs';
import { PageFormConfig } from '../models/form.models';

@Injectable({
    providedIn: 'root'
})
export class FormRegistryService {
    private http = inject(HttpClient);

    private formConfigs = signal<Map<string, PageFormConfig>>(new Map());

    readonly formIds = computed(() => Array.from(this.formConfigs().keys()));

    registerForm(config: PageFormConfig): void {
        this.formConfigs.update(forms => {
            const newForms = new Map(forms);
            newForms.set(config.id, config);
            return newForms;
        });
    }

    getFormConfig(formId: string): PageFormConfig | undefined {
        return this.formConfigs().get(formId);
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

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