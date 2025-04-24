export type ValidationTypes = 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern';
export type ConditionOperator = 'equals' | 'notEquals' | 'contains' | 'in' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
export type ConditionEffect = 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'setOptions' | 'setValue';
export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'textarea' | 'email' | 'password' | 'radio';

// Definición de condiciones para comportamiento dinámico
export interface DisplayCondition {
    sourceField: string;
    operator: ConditionOperator;
    value?: unknown;
    effect?: ConditionEffect;
}

// Validador para campos
export interface FieldValidator {
    type: ValidationTypes;
    value?: unknown;
    message?: string;
}

// Configuración base para todos los campos
export interface BaseFieldConfig {
    name: string;
    type: FieldType;
    label: string;
    required: boolean;
    defaultValue?: unknown;
    colSpan: number;
    visibleWhen?: DisplayCondition[];
    placeholder?: string;
    hint?: string;
    customClasses?: string;
    validateOnChange?: boolean;
    validators?: FieldValidator[];
}

// Opción para selects, radios, etc.
export interface FieldOption {
    value: unknown;
    label: string;
    disabled?: boolean;
}

// Grupo de opciones para selects
export interface OptionGroup {
    label: string;
    options: FieldOption[];
}

// Definiciones específicas para cada tipo de campo
export interface TextFieldConfig extends BaseFieldConfig {
    type: 'text' | 'email' | 'password';
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    autocomplete?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
    type: 'select';
    options: FieldOption[];
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    optionGroups?: OptionGroup[];
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
    type: 'checkbox';
    checkboxLabel?: string;
}

export interface DateFieldConfig extends BaseFieldConfig {
    type: 'date';
    min?: string;
    max?: string;
    disabledDates?: string[];
    showWeekNumbers?: boolean;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
    type: 'textarea';
    rows?: number;
    minLength?: number;
    maxLength?: number;
    autoResize?: boolean;
}

export interface RadioFieldConfig extends BaseFieldConfig {
    type: 'radio';
    options: FieldOption[];
    layout?: 'horizontal' | 'vertical';
}

// Unión de todos los tipos de campos
export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | SelectFieldConfig
    | CheckboxFieldConfig
    | DateFieldConfig
    | TextareaFieldConfig
    | RadioFieldConfig;

// Configuración de una fila en el formulario
export interface FormRow {
    id: string;
    fields: FieldConfig[];
    visibleWhen?: DisplayCondition[];
}

// Configuración de una sección del formulario
export interface FormSection {
    id: string;
    title?: string;
    rows: FormRow[];
    visibleWhen?: DisplayCondition[];
    collapsible?: boolean;
    collapsed?: boolean;
}

// Configuración de columna de tabla
export interface TableColumn {
    field: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    format?: 'date' | 'datetime' | 'currency' | 'number' | 'boolean' | 'custom';
    formatFn?: string;
    width?: string;
    hidden?: boolean;
}

// Acción de tabla
export interface TableAction {
    label: string;
    icon?: string;
    action: string;
    color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    visibleCondition?: DisplayCondition;
    disabledCondition?: DisplayCondition;
    confirmMessage?: string;
}

// Configuración para la tabla
export interface TableConfig {
    columns: TableColumn[];
    actions?: TableAction[];
    paginationSize?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    rowClass?: string | ((item: unknown) => string);
    rowSelectable?: boolean;
    multiSelect?: boolean;
    exportable?: boolean;
    exportFormats?: ('excel' | 'csv' | 'pdf')[];
}

// Endpoints de API
export interface ApiEndpoints {
    get?: string;
    save?: string;
    search?: string;
    delete?: string;
    export?: string;
}

// Configuración completa del formulario
export interface PageFormConfig {
    id: string;
    title?: string;
    sections: FormSection[];
    maxColumns: number;
    tableConfig?: TableConfig;
    apiEndpoints?: ApiEndpoints;
    formLayout?: 'horizontal' | 'vertical' | 'inline';
    permissions?: string[];
}

// Tipo para respuesta de tabla
export interface TableResult {
    data: unknown[];
    totalItems: number;
}
