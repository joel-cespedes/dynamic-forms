import { PageFormConfig } from "../../../shared/models/form.models";

export const EMPLOYEE_FORM_CONFIG: PageFormConfig = {
    id: 'employeeForm',
    title: 'Información de Empleado',
    maxColumns: 12,
    sections: [
        {
            id: 'personalInfo',
            title: 'Información Personal',
            collapsible: true,
            rows: [
                {
                    id: 'row1',
                    fields: [
                        {
                            name: 'firstName',
                            type: 'text',
                            label: 'Nombre',
                            required: true,
                            colSpan: 4,
                            placeholder: 'Ingrese nombre',
                            validators: [
                                { type: 'minLength', value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                                { type: 'maxLength', value: 50 }
                            ]
                        },
                        {
                            name: 'lastName',
                            type: 'text',
                            label: 'Apellido',
                            required: true,
                            colSpan: 4,
                            placeholder: 'Ingrese apellido',
                            validators: [
                                { type: 'minLength', value: 2 },
                                { type: 'maxLength', value: 50 }
                            ]
                        },
                        {
                            name: 'gender',
                            type: 'radio',
                            label: 'Género',
                            required: true,
                            colSpan: 4,
                            layout: 'horizontal', // Puedes usar 'horizontal' o 'vertical'
                            options: [
                                { value: 'male', label: 'Masculino' },
                                { value: 'female', label: 'Femenino' },
                                { value: 'other', label: 'Otro' }
                            ],
                            defaultValue: 'male' // Valor seleccionado por defecto
                        }
                    ]
                },
                {
                    id: 'row2',
                    fields: [
                        {
                            name: 'employeeType',
                            type: 'select',
                            label: 'Tipo de Empleado',
                            required: true,
                            colSpan: 3,
                            options: [
                                { value: 'fullTime', label: 'Tiempo Completo' },
                                { value: 'partTime', label: 'Tiempo Parcial' },
                                { value: 'contractor', label: 'Contratista' }
                            ]
                        },
                        {
                            name: 'department',
                            type: 'select',
                            label: 'Departamento',
                            required: true,
                            colSpan: 3,
                            options: [
                                { value: 'it', label: 'IT' },
                                { value: 'hr', label: 'Recursos Humanos' },
                                { value: 'finance', label: 'Finanzas' },
                                { value: 'marketing', label: 'Marketing' },
                                { value: 'operations', label: 'Operaciones' }
                            ]
                        },
                        {
                            name: 'hireDate',
                            type: 'date',
                            label: 'Fecha de Contratación',
                            required: true,
                            colSpan: 3
                        },
                        {
                            name: 'isActive',
                            type: 'checkbox',
                            label: 'Estado', // Etiqueta que aparece en el formulario
                            checkboxLabel: 'Usuario activo', // Texto que aparece junto al checkbox
                            required: false,
                            colSpan: 3,
                            defaultValue: true, // Valor por defecto (marcado o no)
                            hint: 'Indica si el usuario está activo en el sistema' // Texto de ayuda opcional
                        }
                    ]
                }
            ]
        },
        {
            id: 'contractDetails',
            title: 'Detalles de Contrato',
            collapsible: true,
            // Esta sección solo se muestra para empleados de tiempo completo y parcial
            visibleWhen: [
                {
                    sourceField: 'employeeType',
                    operator: 'in',
                    value: ['fullTime', 'partTime']
                }
            ],
            rows: [
                {
                    id: 'row3',
                    fields: [
                        {
                            name: 'salary',
                            type: 'number',
                            label: 'Salario Anual',
                            required: true,
                            colSpan: 6,
                            hint: 'Salario anual bruto',
                            min: 0,
                            step: 100
                        },
                        {
                            name: 'hoursPerWeek',
                            type: 'number',
                            label: 'Horas Semanales',
                            required: true,
                            colSpan: 6,
                            min: 1,
                            max: 40,
                            // Solo visible para empleados de tiempo parcial
                            visibleWhen: [
                                {
                                    sourceField: 'employeeType',
                                    operator: 'equals',
                                    value: 'partTime'
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'row4',
                    fields: [
                        {
                            name: 'hasBenefits',
                            type: 'checkbox',
                            label: 'Beneficios',
                            checkboxLabel: 'Incluye paquete de beneficios',
                            required: false,
                            colSpan: 12
                        }
                    ]
                },
                {
                    id: 'row5',
                    // Esta fila se muestra solo si tiene beneficios
                    visibleWhen: [
                        {
                            sourceField: 'hasBenefits',
                            operator: 'equals',
                            value: true
                        }
                    ],
                    fields: [
                        {
                            name: 'benefitType',
                            type: 'radio',
                            label: 'Tipo de Beneficio',
                            required: true,
                            colSpan: 6,
                            layout: 'vertical',
                            options: [
                                { value: 'health', label: 'Seguro de Salud' },
                                { value: 'retirement', label: 'Plan de Jubilación' },
                                { value: 'both', label: 'Ambos' }
                            ]
                        },
                        {
                            name: 'benefitAmount',
                            type: 'number',
                            label: 'Monto del Beneficio',
                            required: true,
                            colSpan: 6,
                            min: 0
                        }
                    ]
                }
            ]
        },
        {
            id: 'contractorDetails',
            title: 'Detalles de Contratista',
            collapsible: true,
            // Solo visible para contratistas
            visibleWhen: [
                {
                    sourceField: 'employeeType',
                    operator: 'equals',
                    value: 'contractor'
                }
            ],
            rows: [
                {
                    id: 'row6',
                    fields: [
                        {
                            name: 'contractStartDate',
                            type: 'date',
                            label: 'Fecha de Inicio',
                            required: true,
                            colSpan: 6
                        },
                        {
                            name: 'contractEndDate',
                            type: 'date',
                            label: 'Fecha de Finalización',
                            required: true,
                            colSpan: 6
                        }
                    ]
                },
                {
                    id: 'row7',
                    fields: [
                        {
                            name: 'hourlyRate',
                            type: 'number',
                            label: 'Tarifa por Hora',
                            required: true,
                            colSpan: 4,
                            min: 0,
                            step: 0.5
                        },
                        {
                            name: 'estimatedHours',
                            type: 'number',
                            label: 'Horas Estimadas',
                            required: true,
                            colSpan: 4,
                            min: 1
                        },
                        {
                            name: 'company',
                            type: 'text',
                            label: 'Empresa',
                            required: false,
                            colSpan: 4
                        }
                    ]
                },
                {
                    id: 'row8',
                    fields: [
                        {
                            name: 'contractNotes',
                            type: 'textarea',
                            label: 'Notas del Contrato',
                            required: false,
                            colSpan: 12,
                            rows: 4,
                            placeholder: 'Información adicional sobre el contrato...',
                            maxLength: 500
                        }
                    ]
                }
            ]
        }
    ],
    tableConfig: {
        columns: [
            { field: 'firstName', header: 'Nombre', sortable: true },
            { field: 'lastName', header: 'Apellido', sortable: true },
            { field: 'employeeType', header: 'Tipo' },
            { field: 'department', header: 'Departamento' },
            { field: 'hireDate', header: 'Fecha Contratación', format: 'date' }
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
                confirmMessage: '¿Está seguro de que desea eliminar este empleado?'
            }
        ],
        paginationSize: 10
    },
    apiEndpoints: {
        get: '/api/employees',
        save: '/api/employees',
        search: '/api/employees/search',
        delete: '/api/employees'
    }
};