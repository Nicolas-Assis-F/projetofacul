import {
  Camera,
  Cpu,
  Headphones,
  Laptop,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { type Equipment, type Loan, loanStatus } from "@/lib/api";

export function EquipmentIcon({ name }: { name: string }) {
  const Icon = /câmera|projetor|microfone|gravador/i.test(name)
    ? Camera
    : /arduino|raspberry|sensor/i.test(name)
      ? Cpu
      : /notebook|tablet|mesa digital/i.test(name)
        ? Laptop
        : /headset|tripé|adaptador|ferramenta/i.test(name)
          ? Headphones
          : SlidersHorizontal;
  return <Icon aria-hidden="true" />;
}
export function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    available: "Disponível",
    borrowed: "Emprestado",
    maintenance: "Manutenção",
    inactive: "Inativo",
    active: "Em andamento",
    late: "Em atraso",
    returned: "Devolvido",
    Active: "Ativo",
    Inactive: "Inativo",
    Pending: "Pendente",
  };
  const tone = ["available", "returned", "Active"].includes(status)
    ? "success"
    : ["late"].includes(status)
      ? "danger"
      : ["maintenance", "Pending"].includes(status)
        ? "warning"
        : ["active", "borrowed"].includes(status)
          ? "info"
          : "neutral";
  return (
    <Badge variant="outline" className={`status-badge status-${tone}`}>
      <span aria-hidden="true" className="status-dot" />
      {label[status] || status}
    </Badge>
  );
}
export function equipmentStatus(item: Equipment, loans: Loan[]) {
  if (
    loans.some((l) => l.productId === item.id && loanStatus(l) !== "returned")
  )
    return "borrowed";
  return item.productSituation.name === "Available"
    ? "available"
    : item.productSituation.name === "Out of Stock"
      ? "maintenance"
      : "inactive";
}
export function FilterSelect({
  value,
  onChange,
  options,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  id?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export function NoResults({
  description = "Tente ajustar a busca ou cadastre o primeiro registro.",
}: {
  description?: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Package />
        </EmptyMedia>
        <EmptyTitle>Nenhum registro por aqui</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
