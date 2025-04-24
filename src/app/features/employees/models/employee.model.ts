
export type EmployeeType = 'fullTime' | 'partTime' | 'contractor';
export type Department = 'it' | 'hr' | 'finance' | 'marketing' | 'operations';
export type BenefitType = 'health' | 'retirement' | 'both' | null;

// Interfaz base para empleado
export interface Employee {
    id?: string;
    firstName: string;
    lastName: string;
    employeeType: EmployeeType;
    department: Department;
    hireDate: string;
}

// Interfaces específicas para cada tipo de empleado
export interface FullTimeEmployee extends Employee {
    employeeType: 'fullTime';
    salary: number;
    hasBenefits: boolean;
    benefitType?: BenefitType;
    benefitAmount?: number;
}

export interface PartTimeEmployee extends Employee {
    employeeType: 'partTime';
    salary: number;
    hoursPerWeek: number;
    hasBenefits: boolean;
    benefitType?: BenefitType;
    benefitAmount?: number;
}

export interface ContractorEmployee extends Employee {
    employeeType: 'contractor';
    contractStartDate: string;
    contractEndDate: string;
    hourlyRate: number;
    estimatedHours: number;
    company?: string;
    contractNotes?: string;
}

// Unión de todos los tipos de empleados
export type EmployeeModel = FullTimeEmployee | PartTimeEmployee | ContractorEmployee;

// Tipo para formulario de empleado
export interface EmployeeFormModel {
    // Campos comunes
    id?: string;
    firstName: string;
    lastName: string;
    employeeType: EmployeeType;
    department: Department;
    hireDate: string;

    // Campos para full-time y part-time
    salary?: number;
    hoursPerWeek?: number;
    hasBenefits?: boolean;
    benefitType?: BenefitType;
    benefitAmount?: number;

    // Campos para contratistas
    contractStartDate?: string;
    contractEndDate?: string;
    hourlyRate?: number;
    estimatedHours?: number;
    company?: string;
    contractNotes?: string;
}