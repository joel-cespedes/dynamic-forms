import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormRegistryService } from '../../shared/services/form-registry.service';
import { FormDataService } from '../../shared/services/form-data.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-employee-page',
  imports: [CommonModule, DynamicTableComponent, DynamicFormComponent],
  templateUrl: './employee-page.component.html',
  styleUrl: './employee-page.component.scss'
})
export class EmployeePageComponent {

  // Servicios
  private formRegistry = inject(FormRegistryService);
  private dataService = inject(FormDataService);

  // Estado como signals
  pageTitle = signal('Gestión de Empleados');
  formId = signal('employeeForm');
  selectedEmployee = signal<Record<string, unknown> | null>(null);
  isFormValid = signal(false);
  private _tableFilters = signal<Record<string, unknown>>({});
  tableFilters = computed(() => this._tableFilters());

  // Configuración del formulario actual
  formConfig = computed(() => {
    return this.formRegistry.getFormConfig(this.formId());
  });

  // URL para datos de la tabla
  tableDataUrl = computed(() => {
    const config = this.formConfig();
    return config?.apiEndpoints?.search || '/api/employees';
  });


  ngOnInit() {
    const url = this.tableDataUrl();
    console.log('URL para cargar datos:', url);

    if (url) {
      this.dataService.searchTableData(url, {}).subscribe({
        next: (response) => {
          console.log('Datos cargados manualmente:', response);
        },
        error: (error) => {
          console.error('Error al cargar datos manualmente:', error);
        }
      });
    }
  }


  constructor() {
    console.log('EmployeePageComponent inicializado');

    // Cargar datos manualmente al inicializar
    setTimeout(() => {
      // Aseguramos que tableDataUrl() se evalúe después de que los componentes estén inicializados
      const url = this.tableDataUrl();
      console.log('URL para cargar datos:', url);

      if (url) {
        this.dataService.searchTableData(url, {}).subscribe({
          next: (response) => {
            console.log('Datos cargados manualmente:', response);
          },
          error: (error) => {
            console.error('Error al cargar datos manualmente:', error);
          }
        });
      }
    }, 1000);  // Esperar 1 segundo para asegurar que todo esté inicializado
  }



  // Manejar envío del formulario
  onFormSubmit(formData: Record<string, unknown>): void {
    console.log('Formulario enviado:', formData);

    // Guardar en estado o enviar a API
    const endpoint = this.formConfig()?.apiEndpoints?.save;
    if (endpoint) {
      this.dataService.saveFormData(endpoint, formData).subscribe({
        next: (response) => {
          console.log('Datos guardados:', response);
          // Actualizar filtros de tabla para recargar datos
          this._tableFilters.update(filters => ({ ...filters, _timestamp: Date.now() }));
          this.selectedEmployee.set(null);
        },
        error: (error) => {
          console.error('Error al guardar:', error);
        }
      });
    }
  }

  // Manejar cancelación del formulario
  onFormCancel(): void {
    console.log('Formulario cancelado');
    this.selectedEmployee.set(null);
  }

  // Manejar cambio en campos del formulario
  onFieldChange(event: { field: string, value: unknown }): void {
    console.log('Campo cambiado:', event);
  }

  // Manejar acción de tabla
  onTableAction(event: { action: string, item: unknown }): void {
    switch (event.action) {
      case 'edit':
        this.selectedEmployee.set(event.item as Record<string, unknown>);
        break;
      case 'delete':
        if (confirm('¿Está seguro de eliminar este empleado?')) {
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
