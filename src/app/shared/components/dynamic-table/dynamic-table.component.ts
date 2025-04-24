import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TableConfig } from '../../models/form.models';
import { FormDataService } from '../../services/form-data.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {
  config = input.required<TableConfig>();

  // URL para cargar datos
  dataUrl = input<string>();

  // Filtros externos
  filters = input<Record<string, unknown>>({});

  // Eventos de salida
  rowAction = output<{ action: string, item: unknown }>();
  rowSelect = output<unknown>();

  // Servicios
  private dataService = inject(FormDataService);

  // Signals de estado internos
  private _items = signal<unknown[]>([]);
  private _loading = signal(false);
  private _currentPage = signal(1);
  private _pageSize = signal(10);
  private _totalItems = signal(0);
  private _sortField = signal('');
  private _sortDirection = signal<'asc' | 'desc'>('asc');

  // Signals públicos para acceso en plantilla
  items = computed(() => this._items());
  loading = computed(() => this._loading());
  currentPage = computed(() => this._currentPage());
  sortField = computed(() => this._sortField());
  sortDirection = computed(() => this._sortDirection());

  // Signals computadas para valores derivados
  hasActions = computed(() => {
    const actions = this.config().actions;
    return !!actions && actions.length > 0;
  });

  totalColumns = computed(() => {
    const actionsColumn = this.hasActions() ? 1 : 0;
    return this.config().columns.length + actionsColumn;
  });

  pagination = computed(() => {
    return this._totalItems() > this._pageSize();
  });

  totalPages = computed(() => {
    return Math.ceil(this._totalItems() / this._pageSize());
  });

  displayedPages = computed(() => {
    const total = this.totalPages();
    const current = this._currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  constructor() {
    console.log('DynamicTableComponent constructor');

    // Inicializar con el tamaño de página de la configuración
    effect(() => {
      const config = this.config();
      console.log('Config en effect:', config);
      if (config.paginationSize) {
        this._pageSize.set(config.paginationSize);
      }
    });

    // Effect para cargar datos cuando cambien los filtros o la URL
    effect(() => {
      const url = this.dataUrl();
      const filters = this.filters();
      console.log('Effect ejecutado - URL:', url, 'Filtros:', filters);

      if (url) {
        console.log('Cargando datos desde URL:', url);
        // Usamos setTimeout para asegurar que este efecto se ejecute después de la inicialización
        setTimeout(() => this.loadData(), 0);
      }
    });
  }

  ngOnInit(): void {
    console.log('DynamicTableComponent ngOnInit - URL:', this.dataUrl());
    if (this.dataUrl()) {
      // Carga inicial redundante para asegurar que se carguen los datos
      console.log('Cargando datos en ngOnInit');
      this.loadData();
    }
  }

  // Cargar datos desde la API
  loadData(): void {
    try {
      const url = this.dataUrl();
      console.log('Método loadData() ejecutado con URL:', url);
      if (!url) {
        console.warn('No hay URL para cargar datos');
        return;
      }

      this._loading.set(true);
      console.log('Estado de carga activado');

      // Preparar parámetros
      const params = {
        ...this.filters(),
        page: this._currentPage(),
        pageSize: this._pageSize(),
        sortField: this._sortField(),
        sortDirection: this._sortDirection()
      };

      console.log('Parámetros para la búsqueda:', params);

      // Filtrar parámetros null/undefined
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      console.log('Parámetros filtrados:', filteredParams);
      console.log('Haciendo solicitud HTTP a:', url);

      this.dataService.searchTableData(url, filteredParams).subscribe({
        next: (response) => {
          console.log('Datos recibidos:', response);

          if (!response) {
            console.warn('Respuesta vacía recibida');
            this._items.set([]);
            this._totalItems.set(0);
          } else {
            this._items.set(response.data || []);
            this._totalItems.set(response.totalItems || 0);
            console.log('Items establecidos:', this._items());
          }

          this._loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar datos:', error);
          this._items.set([]);
          this._totalItems.set(0);
          this._loading.set(false);
        },
        complete: () => {
          console.log('Solicitud completada');
        }
      });
    } catch (e) {
      console.error('Error en loadData:', e);
      this._loading.set(false);
    }
  }

  // Formatear el valor de una celda
  formatCellValue(item: any, column: any): string {
    const value = item[column.field];

    if (value === null || value === undefined) {
      return '';
    }

    // Aplicar formato si está definido
    if (column.format) {
      switch (column.format) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'datetime':
          return new Date(value).toLocaleString();
        case 'currency':
          return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
        case 'number':
          return new Intl.NumberFormat('es-ES').format(value);
        case 'boolean':
          return value ? 'Sí' : 'No';
        default:
          return String(value);
      }
    }

    return String(value);
  }

  // Manejar cambio de página
  onPageChange(page: any): void {
    if (page < 1 || page > this.totalPages() || page === this._currentPage()) {
      return;
    }

    this._currentPage.set(page);
    this.loadData();
  }

  // Manejar ordenación
  onSort(field: string): void {
    if (this._sortField() === field) {
      // Cambiar dirección si el campo ya está seleccionado
      this._sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // Establecer nuevo campo y dirección predeterminada
      this._sortField.set(field);
      this._sortDirection.set('asc');
    }

    // Volver a la primera página y recargar
    this._currentPage.set(1);
    this.loadData();
  }

  // Manejar acción en fila
  onAction(action: string, item: unknown): void {
    this.rowAction.emit({ action, item });
  }

  // Seleccionar fila
  onRowSelect(item: unknown): void {
    this.rowSelect.emit(item);
  }

  // Refrescar datos manualmente
  refresh(): void {
    this.loadData();
  }
}