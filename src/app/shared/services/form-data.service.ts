
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { TableResult } from '../../shared/models/form.models';

interface ApiResponse {
    data?: unknown[];
    items?: unknown[];
    results?: unknown[];
    totalItems?: number;
    total?: number;
    count?: number;
}

@Injectable({
    providedIn: 'root'
})
export class FormDataService {
    private http = inject(HttpClient);

    /**
     * Carga datos para un formulario
     */
    loadFormData(endpoint: string, params?: Record<string, unknown>): Observable<Record<string, unknown> | null> {
        const url = new URL(endpoint, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return this.http.get<Record<string, unknown>>(url.toString()).pipe(
            catchError(error => {
                console.error('Error loading form data:', error);
                return of(null);
            })
        );
    }

    /**
     * Guarda datos de un formulario
     */
    saveFormData(endpoint: string, data: Record<string, unknown>): Observable<unknown> {
        return this.http.post(endpoint, data).pipe(
            catchError(error => {
                console.error('Error saving form data:', error);
                return of(null);
            })
        );
    }

    /**
     * Busca datos para la tabla
     */
    searchTableData(endpoint: string, params?: Record<string, unknown>): Observable<TableResult> {
        const url = new URL(endpoint, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return this.http.get<ApiResponse | unknown[]>(url.toString()).pipe(
            map(response => {
                // Si es un array directamente
                if (Array.isArray(response)) {
                    return {
                        data: response,
                        totalItems: response.length
                    };
                }

                // Si es un objeto de respuesta API
                const apiResponse = response as ApiResponse;
                return {
                    data: apiResponse['data'] || apiResponse['items'] || apiResponse['results'] || [],
                    totalItems: apiResponse['totalItems'] || apiResponse['total'] || apiResponse['count'] || 0
                };
            }),
            catchError(error => {
                console.error('Error searching table data:', error);
                return of({ data: [], totalItems: 0 });
            })
        );
    }

    /**
     * Elimina un registro
     */
    deleteRecord(endpoint: string, id: string | number): Observable<unknown> {
        return this.http.delete(`${endpoint}/${id}`).pipe(
            catchError(error => {
                console.error('Error deleting record:', error);
                return of(null);
            })
        );
    }

    /**
     * Exporta datos
     */
    exportData(endpoint: string, format: string, params?: Record<string, unknown>): Observable<Blob> {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.append('format', format);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return this.http.get(url.toString(), {
            responseType: 'blob'
        }).pipe(
            catchError(error => {
                console.error('Error exporting data:', error);
                // Retornar un blob vacío en caso de error
                return of(new Blob([]));
            })
        );
    }
}
