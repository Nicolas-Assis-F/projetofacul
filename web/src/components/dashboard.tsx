import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  CalendarDays,
  CircleCheck,
  Clock3,
  FlaskConical,
  Package,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  type Data,
  type Loan,
  loanStatus,
  dateLabel,
  assetCode,
} from "@/lib/api";
import {
  EquipmentIcon,
  equipmentStatus,
  StatusBadge,
  NoResults,
  initials,
} from "./shared";

export function Dashboard({
  data,
  navigate,
  newLoan,
  returnLoan,
}: {
  data: Data;
  navigate: (page: string, filter?: string) => void;
  newLoan: () => void;
  returnLoan: (loan: Loan) => void;
}) {
  const active = data.loans.filter((l) => !l.returnedAt);
  const late = active.filter((l) => loanStatus(l) === "late");
  const available = data.equipment.filter(
    (e) => equipmentStatus(e, data.loans) === "available",
  ).length;
  const maintenance = data.equipment.filter(
    (e) => equipmentStatus(e, data.loans) === "maintenance",
  ).length;
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - 6 + i);
    return {
      date: day
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", ""),
      Empréstimos: data.loans.filter(
        (l) => new Date(l.createdAt).toDateString() === day.toDateString(),
      ).length,
      Devoluções: data.loans.filter(
        (l) =>
          l.returnedAt &&
          new Date(l.returnedAt).toDateString() === day.toDateString(),
      ).length,
    };
  });
  const upcoming = [...active]
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 4);
  const recent = data.loans.slice(0, 4);
  const stats = [
    {
      label: "Equipamentos",
      value: data.equipment.length,
      note: `${available} disponíveis para uso`,
      icon: Package,
      color: "mint",
      page: "equipment",
    },
    {
      label: "Empréstimos ativos",
      value: active.length,
      note: "Conhecimento em movimento",
      icon: ArrowLeftRight,
      color: "blue",
      page: "loans",
      filter: "active",
    },
    {
      label: "Pessoas cadastradas",
      value: data.people.length,
      note: `${data.people.filter((p) => p.situation.nameSituation === "Active").length} com cadastro ativo`,
      icon: Users,
      color: "violet",
      page: "people",
    },
    {
      label: "Devoluções em atraso",
      value: late.length,
      note: late.length ? "Precisam da sua atenção" : "Tudo em dia por aqui",
      icon: Clock3,
      color: "peach",
      page: "loans",
      filter: "late",
    },
  ];
  const ratio = data.equipment.length
    ? (available / data.equipment.length) * 100
    : 0;
  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span className="live-dot" /> SEU LABORATÓRIO, CONECTADO
          </div>
          <h2>
            Grandes ideias começam
            <br />
            com os recursos certos.
          </h2>
          <p>
            Organize os equipamentos. Conecte as pessoas.
            <br className="desktop-break" /> Abra espaço para o próximo projeto.
          </p>
          <Button onClick={newLoan} variant="secondary">
            <Plus data-icon="inline-start" /> Registrar empréstimo{" "}
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="lab-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-dot dot-one" />
          <div className="art-dot dot-two" />
          <div className="floating-label">
            <span /> Ideias em movimento
          </div>
          <div className="art-card art-back">
            <CpuIllustration />
          </div>
          <div className="art-card art-front">
            <FlaskConical />
            <div className="art-line" />
            <div className="art-line short" />
          </div>
          <div className="art-check">
            <CircleCheck />
          </div>
          <span className="art-spark">✳</span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Indicadores do laboratório">
        {stats.map((s) => (
          <button
            className="stat-card"
            key={s.label}
            onClick={() => navigate(s.page, s.filter)}
          >
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={`stat-icon ${s.color}`}>
                <s.icon />
              </span>
            </div>
            <strong>{s.value.toString().padStart(2, "0")}</strong>
            <div className="stat-foot">
              <span>{s.note}</span>
              <ArrowUpRight />
            </div>
          </button>
        ))}
      </section>
      <div className="dashboard-middle">
        <Card className="movement-card">
          <CardHeader>
            <div className="section-heading">
              <div>
                <CardTitle>Movimentação do laboratório</CardTitle>
                <CardDescription>
                  Empréstimos e devoluções nos últimos 7 dias
                </CardDescription>
              </div>
              <Badge variant="outline">
                <CalendarDays /> Esta semana
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="chart-summary">
              <strong>
                {days.reduce((n, d) => n + d.Empréstimos, 0)}
                <small> empréstimos no período</small>
              </strong>
              <div className="chart-legend">
                <span>
                  <i /> Empréstimos
                </span>
                <span>
                  <i /> Devoluções
                </span>
              </div>
            </div>
            <div
              className="chart"
              role="img"
              aria-label={`Movimentação diária: ${days.map((d) => `${d.date}, ${d.Empréstimos} empréstimos e ${d.Devoluções} devoluções`).join("; ")}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={days}
                  margin={{ top: 12, right: 8, bottom: 0, left: -30 }}
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="Empréstimos"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#chartFill)"
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="Devoluções"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="availability-card">
          <CardHeader>
            <CardTitle>Prontos para criar</CardTitle>
            <CardDescription>Disponibilidade do acervo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="availability-visual">
              <svg viewBox="0 0 180 110" aria-hidden="true">
                <path
                  d="M20 90a70 70 0 0 1 140 0"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="17"
                  strokeLinecap="round"
                />
                <path
                  d="M20 90a70 70 0 0 1 140 0"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="17"
                  strokeLinecap="round"
                  strokeDasharray={`${ratio * 2.2} 220`}
                />
              </svg>
              <div>
                <strong>
                  {Math.round(ratio)}
                  <small>%</small>
                </strong>
                <span>disponível para uso</span>
              </div>
            </div>
            <div className="availability-legend">
              <span>
                <i className="legend-available" /> Disponíveis{" "}
                <strong>{available}</strong>
              </span>
              <span>
                <i className="legend-borrowed" /> Emprestados{" "}
                <strong>{active.length}</strong>
              </span>
              <span>
                <i className="legend-maintenance" /> Manutenção / inativos{" "}
                <strong>
                  {data.equipment.length - available - active.length}
                </strong>
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("equipment")}
            >
              Explorar equipamentos <ArrowRight data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="dashboard-bottom">
        <Card className="recent-card">
          <CardHeader>
            <div className="section-heading">
              <div>
                <CardTitle>Empréstimos recentes</CardTitle>
                <CardDescription>
                  Os últimos recursos que saíram para fazer a diferença
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("loans")}
              >
                Ver todos <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!recent.length ? (
              <NoResults description="Registre um empréstimo para iniciar o histórico do laboratório." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Pessoa</TableHead>
                    <TableHead>Devolução</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="item-cell">
                          <span className="equipment-icon">
                            <EquipmentIcon name={l.product.name} />
                          </span>
                          <div>
                            <strong>{l.product.name}</strong>
                            <small>{assetCode(l.productId)}</small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="person-cell">
                          <span className="initial-avatar">
                            {initials(l.user.name)}
                          </span>
                          <span>
                            {l.user.name.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{dateLabel(l.dueAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={loanStatus(l)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card className="due-card">
          <CardHeader>
            <div className="section-heading">
              <CardTitle>No radar</CardTitle>
              <span className="radar-icon">
                <Clock3 />
              </span>
            </div>
            <CardDescription>Próximas devoluções e pendências</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="due-list">
              {upcoming.length ? (
                upcoming.map((l) => (
                  <button
                    className="due-item"
                    key={l.id}
                    onClick={() => returnLoan(l)}
                  >
                    <span
                      className={`due-date ${loanStatus(l) === "late" ? "is-late" : ""}`}
                    >
                      <strong>{new Date(l.dueAt).getDate()}</strong>
                      <small>
                        {new Date(l.dueAt)
                          .toLocaleDateString("pt-BR", { month: "short" })
                          .replace(".", "")}
                      </small>
                    </span>
                    <span>
                      <strong>{l.product.name}</strong>
                      <small>
                        {l.user.name.split(" ").slice(0, 2).join(" ")} ·{" "}
                        {loanStatus(l) === "late" ? "Em atraso" : "Devolver"}
                      </small>
                    </span>
                    <ArrowUpRight />
                  </button>
                ))
              ) : (
                <div className="all-clear">
                  <CircleCheck />
                  <p>Nenhuma devolução pendente.</p>
                </div>
              )}
            </div>
            {maintenance > 0 && (
              <div className="maintenance-note">
                <Sparkles />
                <span>
                  {maintenance} equipamentos em manutenção.
                  <br />
                  <strong>Um cuidado hoje, novas ideias amanhã.</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="dashboard-footer">
        <span>
          <span className="live-dot" /> Dados sincronizados com o laboratório
        </span>
        <span>Feito para aprender. Construído para conectar.</span>
      </div>
    </>
  );
}
function CpuIllustration() {
  return (
    <>
      <div className="mini-board">
        <span />
        <span />
        <span />
        <span />
        <div>
          <ArrowDownLeft />
        </div>
        <span />
        <span />
        <span />
        <span />
      </div>
      <small>CAMPUSLAB / EXPLORE</small>
    </>
  );
}
