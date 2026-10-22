export type Catalog = { id: number; name: string };
export type Person = {
  id: number;
  name: string;
  email: string;
  situationId: number;
  situation: { id: number; nameSituation: string };
  createdAt: string;
};
export type Equipment = {
  id: number;
  name: string;
  productCategoryId: number;
  productSituationId: number;
  productCategory: Catalog;
  productSituation: Catalog;
  createdAt: string;
};
export type Loan = {
  id: number;
  userId: number;
  productId: number;
  dueAt: string;
  returnedAt: string | null;
  createdAt: string;
  notes: string;
  user: Person;
  product: Equipment;
};
export type Catalogs = {
  situations: { id: number; nameSituation: string }[];
  productCategories: Catalog[];
  productSituations: Catalog[];
};
export type Data = {
  people: Person[];
  equipment: Equipment[];
  loans: Loan[];
  catalogs: Catalogs;
};
const translations: Record<string, string> = {
  Active: "Ativo",
  Inactive: "Inativo",
  Pending: "Pendente",
  Available: "Disponível",
  "Out of Stock": "Em manutenção",
  Discontinued: "Inativo",
  Electronics: "Eletrônicos",
  Clothing: "Vestuário",
  "Food & Beverages": "Alimentos",
  "Home & Garden": "Casa e jardim",
  Sports: "Esportes",
  "Email already registered": "Este e-mail já está cadastrado.",
  "Validation error": "Confira os campos informados.",
};
export const translate = (value: string) => translations[value] || value;
export const assetCode = (id: number) => `CL-${String(id).padStart(4, "0")}`;
export const loanStatus = (loan: Loan) =>
  loan.returnedAt
    ? "returned"
    : new Date(loan.dueAt).getTime() < Date.now()
      ? "late"
      : "active";
export const dateLabel = (value: string, withYear = false) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(value));

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está em execução e tente novamente.",
    );
  }
  if (response.status === 204) return undefined as T;
  const body = await response
    .json()
    .catch(() => ({ message: "O servidor retornou uma resposta inesperada." }));
  if (!response.ok)
    throw new Error(
      translate(body.message || "Não foi possível concluir a operação."),
    );
  return body as T;
}
async function all<T>(path: string): Promise<T[]> {
  const first = await api<{ data: T[]; totalPages: number }>(
    `${path}?limit=100`,
  );
  const result = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await api<{ data: T[] }>(`${path}?limit=100&page=${page}`);
    result.push(...next.data);
  }
  return result;
}
export async function loadData(): Promise<Data> {
  const [people, equipment, loans, catalogs] = await Promise.all([
    all<Person>("/users"),
    all<Equipment>("/products"),
    all<Loan>("/loans"),
    api<Catalogs>("/catalogs"),
  ]);
  return { people, equipment, loans, catalogs };
}
export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value);
            if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
            return `"${text.replaceAll('"', '""')}"`;
          })
          .join(";"),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
