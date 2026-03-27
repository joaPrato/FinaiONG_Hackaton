import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateCategory(cat: any): string {
  if (!cat || typeof cat !== 'string') return "General";
  
  // Normalizamos a minúsculas para el match del diccionario
  const key = cat.toLowerCase();

  const dictionary: Record<string, string> = {
    "income": "Ingreso",
    "expense": "Egreso",
    "debt": "Deuda",
    "asset": "Activo",
    "donation_individual": "Donación Individual",
    "grant_government": "Subsidio Estatal",
    "event_fundraising": "Evento Recaudación",
    "corporate_partnership": "Alianza Corporativa",
    "program_direct_impact": "Impacto Directo",
    "operational_costs": "Costos Operativos",
    "human_resources": "Recursos Humanos",
    "marketing": "Marketing",
    "supplier_pending": "Proveedor Pendiente",
    "loan_repayment": "Pago de Préstamo",
    "cash_bank": "Caja/Banco",
    "physical_inventory": "Inventario Físico",
    "fixed_asset": "Activo Fijo",
    "sin_proyecto": "Sin Clasificar"
  };

  return dictionary[key] || cat.replace(/_/g, ' ');
}