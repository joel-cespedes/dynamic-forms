import { Component, computed, inject, signal } from '@angular/core';
import { FormRegistryService } from '../../shared/services/form-registry.service';
import { FormDataService } from '../../shared/services/form-data.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-stores-page',
  imports: [DynamicTableComponent, DynamicFormComponent],
  templateUrl: './stores-page.component.html',
  styleUrl: './stores-page.component.scss'
})
export class StoresPageComponent {

  private formRegistry = inject(FormRegistryService);
  private dataService = inject(FormDataService);


  formId = signal('storeForm');

  selectedStore = signal<Record<string, unknown> | null>(null);
  isFormValid = signal(false);
  private _tableFilters = signal<Record<string, unknown>>({});
  tableFilters = computed(() => this._tableFilters());

  formConfig = computed(() => {
    return this.formRegistry.getFormConfig(this.formId());
  });

  // URL para datos de la tabla
  tableDataUrl = computed(() => {
    const config = this.formConfig();
    return config?.apiEndpoints?.search || '/api/stores';
  });

  constructor() {

    // Cargar datos manualmente al inicializar
    setTimeout(() => {
      const url = this.tableDataUrl();

      if (url) {
        this.dataService.searchTableData(url, {}).subscribe({
          next: (response) => {

          },
          error: (error) => {
            console.error('Error al cargar datos manualmente:', error);
          }
        });
      }
    }, 1000);
  }

  // Manejar envío del formulario
  onFormSubmit(formData: Record<string, unknown>): void {

    // Guardar en estado o enviar a API
    const endpoint = this.formConfig()?.apiEndpoints?.save;
    if (endpoint) {
      this.dataService.saveFormData(endpoint, formData).subscribe({
        next: (response) => {

          // Actualizar filtros de tabla para recargar datos
          this._tableFilters.update(filters => ({ ...filters, _timestamp: Date.now() }));
          this.selectedStore.set(null);
        },
        error: (error) => {
          console.error('Error al guardar:', error);
        }
      });
    }
  }

  // Manejar cancelación del formulario
  onFormCancel(): void {

    this.selectedStore.set(null);
  }

  // Manejar cambio en campos del formulario
  onFieldChange(event: { field: string, value: unknown }): void {

  }

  // Manejar acción de tabla
  onTableAction(event: { action: string, item: unknown }): void {
    switch (event.action) {
      case 'edit':
        this.selectedStore.set(event.item as Record<string, unknown>);
        break;
      case 'delete':
        if (confirm('¿Está seguro de eliminar esta tienda?')) {
          const endpoint = this.formConfig()?.apiEndpoints?.delete;
          const item = event.item as Record<string, unknown>;
          if (endpoint && item['id']) {
            this.dataService.deleteRecord(endpoint, String(item['id'])).subscribe({
              next: () => {
                // Recargar tabla
                this._tableFilters.update(filters => ({ ...filters, _timestamp: Date.now() }));
              }
            });
          }
        }
        break;
    }
  }
}
