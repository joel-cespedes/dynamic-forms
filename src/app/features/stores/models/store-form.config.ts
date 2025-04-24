// src/app/features/stores/form-configs/store-form.config.ts
import { PageFormConfig } from "../../../shared/models/form.models";

export const STORE_FORM_CONFIG: PageFormConfig = {
    id: 'storeForm',
    title: 'Información de Tienda',
    maxColumns: 12,
    sections: [
        {
            id: 'basicInfo',
            title: 'Información Básica',
            collapsible: true,
            rows: [
                {
                    id: 'row1',
                    fields: [
                        {
                            name: 'name',
                            type: 'text',
                            label: 'Nombre de la Tienda',
                            required: true,
                            colSpan: 6,
                            placeholder: 'Ingrese nombre de la tienda',
                            validators: [
                                { type: 'minLength', value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                                { type: 'maxLength', value: 100 }
                            ]
                        },
                        {
                            name: 'storeType',
                            type: 'select',
                            label: 'Tipo de Tienda',
                            required: true,
                            colSpan: 6,
                            options: [
                                { value: 'physical', label: 'Física' },
                                { value: 'online', label: 'En línea' },
                                { value: 'hybrid', label: 'Híbrida' }
                            ]
                        }
                    ]
                },
                {
                    id: 'row2',
                    fields: [
                        {
                            name: 'description',
                            type: 'textarea',
                            label: 'Descripción',
                            required: true,
                            colSpan: 12,
                            placeholder: 'Describa su tienda...',
                            rows: 3,
                            validators: [
                                { type: 'maxLength', value: 500 }
                            ]
                        }
                    ]
                },
                {
                    id: 'row3',
                    fields: [
                        {
                            name: 'foundedDate',
                            type: 'date',
                            label: 'Fecha de Fundación',
                            required: true,
                            colSpan: 6
                        },
                        {
                            name: 'active',
                            type: 'checkbox',
                            label: 'Estado',
                            checkboxLabel: 'Tienda Activa',
                            required: false,
                            colSpan: 6,
                            defaultValue: true
                        }
                    ]
                }
            ]
        },
        {
            id: 'physicalDetails',
            title: 'Detalles de Tienda Física',
            collapsible: true,
            // Esta sección solo se muestra para tiendas físicas y híbridas
            visibleWhen: [
                {
                    sourceField: 'storeType',
                    operator: 'in',
                    value: ['physical', 'hybrid']
                }
            ],
            rows: [
                {
                    id: 'row4',
                    fields: [
                        {
                            name: 'address',
                            type: 'text',
                            label: 'Dirección',
                            required: true,
                            colSpan: 12
                        }
                    ]
                },
                {
                    id: 'row5',
                    fields: [
                        {
                            name: 'city',
                            type: 'text',
                            label: 'Ciudad',
                            required: true,
                            colSpan: 4
                        },
                        {
                            name: 'postalCode',
                            type: 'text',
                            label: 'Código Postal',
                            required: true,
                            colSpan: 4
                        },
                        {
                            name: 'country',
                            type: 'text',
                            label: 'País',
                            required: true,
                            colSpan: 4
                        }
                    ]
                },
                {
                    id: 'row6',
                    fields: [
                        {
                            name: 'size',
                            type: 'number',
                            label: 'Tamaño (m²)',
                            required: true,
                            colSpan: 6,
                            min: 1
                        },
                        {
                            name: 'employeeCount',
                            type: 'number',
                            label: 'Número de Empleados',
                            required: true,
                            colSpan: 6,
                            min: 1
                        }
                    ]
                },
                {
                    id: 'row7',
                    fields: [
                        {
                            name: 'businessHours',
                            type: 'select',
                            label: 'Horario Comercial',
                            required: true,
                            colSpan: 6,
                            options: [
                                { value: 'standard', label: 'Estándar (9-18h)' },
                                { value: 'extended', label: 'Extendido (9-22h)' },
                                { value: '24h', label: '24 horas' }
                            ]
                        },
                        {
                            name: 'hasParking',
                            type: 'checkbox',
                            label: 'Estacionamiento',
                            checkboxLabel: 'Dispone de estacionamiento',
                            required: false,
                            colSpan: 6
                        }
                    ]
                },
                {
                    id: 'row8',
                    fields: [
                        {
                            name: 'parkingCapacity',
                            type: 'number',
                            label: 'Capacidad de Estacionamiento',
                            required: true,
                            colSpan: 12,
                            min: 1,
                            // Solo visible si tiene estacionamiento
                            visibleWhen: [
                                {
                                    sourceField: 'hasParking',
                                    operator: 'equals',
                                    value: true
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'onlineDetails',
            title: 'Detalles de Tienda En Línea',
            collapsible: true,
            // Solo visible para tiendas online y híbridas
            visibleWhen: [
                {
                    sourceField: 'storeType',
                    operator: 'in',
                    value: ['online', 'hybrid']
                }
            ],
            rows: [
                {
                    id: 'row9',
                    fields: [
                        {
                            name: 'website',
                            type: 'text',
                            label: 'Sitio Web',
                            required: true,
                            colSpan: 6,
                            validators: [
                                {
                                    type: 'pattern',
                                    value: '^(https?:\\/\\/)?(www\\.)?[a-zA-Z0-9][a-zA-Z0-9-]+(\\.[a-zA-Z0-9][a-zA-Z0-9-]+)+([/?#].*)?$',
                                    message: 'Ingrese una URL válida'
                                }
                            ]
                        },
                        {
                            name: 'platformType',
                            type: 'select',
                            label: 'Tipo de Plataforma',
                            required: true,
                            colSpan: 6,
                            options: [
                                { value: 'custom', label: 'Personalizada' },
                                { value: 'shopify', label: 'Shopify' },
                                { value: 'woocommerce', label: 'WooCommerce' },
                                { value: 'magento', label: 'Magento' },
                                { value: 'prestashop', label: 'PrestaShop' },
                                { value: 'other', label: 'Otra' }
                            ]
                        }
                    ]
                },
                {
                    id: 'row10',
                    fields: [
                        {
                            name: 'deliveryTime',
                            type: 'number',
                            label: 'Tiempo de Entrega (días)',
                            required: true,
                            colSpan: 6,
                            min: 1
                        },
                        {
                            name: 'shipsInternational',
                            type: 'checkbox',
                            label: 'Envíos Internacionales',
                            checkboxLabel: 'Realiza envíos internacionales',
                            required: false,
                            colSpan: 6
                        }
                    ]
                },
                {
                    id: 'row11',
                    fields: [
                        {
                            name: 'supportEmail',
                            type: 'email',
                            label: 'Email de Soporte',
                            required: true,
                            colSpan: 6,
                            validators: [
                                { type: 'email' }
                            ]
                        },
                        {
                            name: 'supportPhone',
                            type: 'text',
                            label: 'Teléfono de Soporte',
                            required: false,
                            colSpan: 6
                        }
                    ]
                }
            ]
        },
        {
            id: 'paymentMethods',
            title: 'Métodos de Pago',
            collapsible: true,
            rows: [
                {
                    id: 'row12',
                    fields: [
                        {
                            name: 'paymentMethods',
                            type: 'select',
                            label: 'Métodos de Pago Aceptados',
                            required: true,
                            colSpan: 12,
                            multiple: true,
                            options: [
                                { value: 'cash', label: 'Efectivo' },
                                { value: 'card', label: 'Tarjeta de Crédito/Débito' },
                                { value: 'bank', label: 'Transferencia Bancaria' },
                                { value: 'mobile', label: 'Pago Móvil' }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    tableConfig: {
        columns: [
            { field: 'name', header: 'Nombre', sortable: true },
            { field: 'storeType', header: 'Tipo' },
            { field: 'foundedDate', header: 'Fecha Fundación', format: 'date' },
            { field: 'active', header: 'Activa', format: 'boolean' }
        ],
        actions: [
            {
                label: 'Editar',
                icon: 'pencil',
                action: 'edit',
                color: 'primary'
            },
            {
                label: 'Eliminar',
                icon: 'trash',
                action: 'delete',
                color: 'danger',
                confirmMessage: '¿Está seguro de que desea eliminar esta tienda?'
            }
        ],
        paginationSize: 10
    },
    apiEndpoints: {
        get: '/api/stores',
        save: '/api/stores',
        search: '/api/stores/search',
        delete: '/api/stores'
    }
};