import type {
  ExpenseAction,
  ExpenseCategory,
  ExpenseStatus,
  Role,
} from '../generated/prisma/client.js';

/*
 * Response shapes. Classes rather than interfaces so the OpenAPI document can
 * describe them; the Swagger compiler plugin reads the property types.
 */

export class PersonSummary {
  id: string;
  fullName: string;
}

export class HistoryActor extends PersonSummary {
  role: Role;
}

export class ExpenseSummary {
  id: string;
  title: string;
  /** Masraf tarihi, YYYY-MM-DD */
  expenseDate: string;
  category: ExpenseCategory;
  /** İki ondalıklı metin olarak tutar, örn. "750.00" (kayan nokta hatası olmaması için) */
  amount: string;
  note: string | null;
  status: ExpenseStatus;
  owner: PersonSummary;
  rejectionReason: string | null;
  rejectedBy: PersonSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseHistoryEntry {
  id: string;
  action: ExpenseAction;
  fromStatus: ExpenseStatus | null;
  toStatus: ExpenseStatus;
  /** Red gerekçesi (sadece red işlemlerinde) */
  reason: string | null;
  actor: HistoryActor;
  createdAt: Date;
}

export class ExpenseDetail extends ExpenseSummary {
  /** İşlem geçmişi, eskiden yeniye */
  history: ExpenseHistoryEntry[];
}
