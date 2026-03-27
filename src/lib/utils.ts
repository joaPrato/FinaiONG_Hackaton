import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateCategory(cat: string): string {
  const dictionary: Record<string, string> = {
    // INCOME
    "Donation_Individual": "Donaciones Individuales",
    "Grant_Government": "Subsidios Estatales",
    "Event_Fundraising": "Eventos de Recaudación",
    "Corporate_Partnership": "Convenios Corporativos",
    "income": "Ingreso",
    
    // EXPENSE
    "Program_Direct_Impact": "Impacto Directo",
    "Operational_Costs": "Gastos Operativos",
    "Human_Resources": "Recursos Humanos",
    "Marketing": "Marketing y Prensa",
    "expense": "Egreso",

    // DEBT
    "Supplier_Pending": "Proveedores Pendientes",
    "Loan_Repayment": "Cuotas de Préstamos",
    "debt": "Deuda",

    // ASSET
    "Cash_Bank": "Caja y Bancos",
    "Physical_Inventory": "Stock e Insumos",
    "Fixed_Asset": "Bienes de Uso",
    "asset": "Activo",

    "Sin_Proyecto": "Sin Categoría"
  };

  return dictionary[cat] || cat.replace(/_/g, ' ');
}