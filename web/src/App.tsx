import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Menu,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  AlertCircle,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/components/dashboard";
import { RecordDialog, type Editor } from "@/components/record-dialog";
import {
  EquipmentIcon,
  equipmentStatus,
  FilterSelect,
  StatusBadge,
  NoResults,
  initials,
} from "@/components/shared";
import {
  api,
  loadData,
  loanStatus,
  assetCode,
  dateLabel,
  translate,
  downloadCsv,
  type Data,
  type Equipment,
  type Person,
  type Loan,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type Page = "dashboard" | "equipment" | "people" | "loans" | "guide";
const pages = [
  {
    id: "dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    description: "Um novo dia para colocar boas ideias em prática.",
  },
  {
    id: "equipment",
    label: "Equipamentos",
    icon: Package,
    description:
      "Cada recurso, uma possibilidade. Conheça e organize seu acervo.",
  },
  {
    id: "people",
    label: "Pessoas",
    icon: Users,
    description: "Quem transforma os recursos do laboratório em novas ideias.",
  },
  {
    id: "loans",
    label: "Empréstimos",
    icon: ArrowLeftRight,
    description: "Acompanhe retiradas, prazos e devoluções em um só lugar.",
  },
  {
    id: "guide",
    label: "Guia do sistema",
    icon: BookOpen,
    description: "Tudo o que você precisa para explorar o CampusLab.",
  },
] as const;
const pageFromHash = (): Page => {
  const hash = location.hash.slice(1);
  return pages.some((p) => p.id === hash) ? (hash as Page) : "dashboard";
};
type Confirmation =
  | {
      kind: "delete";
      record: Equipment | Person;
      resource: "products" | "users";
    }
  | { kind: "return"; loan: Loan };
const pageSize = 8;

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [index, setIndex] = useState(1);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [details, setDetails] = useState<Loan | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await loadData());
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar o laboratório.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const handler = () => {
      setPage(pageFromHash());
      setQuery("");
      setFilter("all");
      setCategory("all");
      setIndex(1);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    setIndex(1);
  }, [query, filter, category, page]);
  function navigate(id: string, nextFilter = "all") {
    const nextPage = id as Page;
    history.pushState(null, "", `#${id}`);
    setPage(nextPage);
    setFilter(nextFilter);
    setQuery("");
    setCategory("all");
    setIndex(1);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("equipment");
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const meta = pages.find((p) => p.id === page)!;
  const lateCount =
    data?.loans.filter((l) => loanStatus(l) === "late").length || 0;
  const nav = (
    <>
      <a
        className="brand"
        href="#dashboard"
        onClick={(e) => {
          e.preventDefault();
          navigate("dashboard");
        }}
      >
        <span className="brand-mark">
          <FlaskConical />
        </span>
        <span>
          Campus<span>Lab</span>
          <small>IDEIAS EM MOVIMENTO</small>
        </span>
      </a>
      <div className="workspace-label">
        <span>
          <GraduationCap />
        </span>
        <div>
          <strong>Laboratório acadêmico</strong>
          <small>Seu espaço de possibilidades</small>
        </div>
      </div>
      <div className="nav-label">ESPAÇO DE TRABALHO</div>
      <nav aria-label="Navegação principal">
        {pages.slice(0, 4).map((p) => (
          <button
            key={p.id}
            className={cn("nav-item", page === p.id && "selected")}
            onClick={() => navigate(p.id)}
            aria-current={page === p.id ? "page" : undefined}
          >
            <p.icon />
            <span>{p.label}</span>
            {p.id === "loans" && lateCount > 0 && (
              <span className="nav-count">{lateCount}</span>
            )}
            {page === p.id && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>
      <div className="nav-label second-nav-label">APRENDA E EXPLORE</div>
      <button
        className={cn("nav-item", page === "guide" && "selected")}
        onClick={() => navigate("guide")}
        aria-current={page === "guide" ? "page" : undefined}
      >
        <BookOpen />
        <span>Guia do sistema</span>
      </button>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-icon">
            <GraduationCap />
          </span>
          <strong>Aprender fazendo.</strong>
          <p>
            Um laboratório organizado.
            <br />
            Infinitas possibilidades.
          </p>
          <button onClick={() => navigate("guide")}>
            Conheça o projeto <ArrowUpRight />
          </button>
          <span className="note-decoration" aria-hidden="true">
            ✳
          </span>
        </div>
        <Separator />
        <div className="sidebar-profile">
          <span className="profile-avatar">CL</span>
          <div>
            <strong>Espaço acadêmico</strong>
            <small>CampusLab · v1.0</small>
          </div>
          <Badge variant="outline">EDU</Badge>
        </div>
      </div>
    </>
  );
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const equipment =
    data?.equipment.filter(
      (e) =>
        `${e.name} ${assetCode(e.id)} ${translate(e.productCategory.name)}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized) &&
        (filter === "all" || equipmentStatus(e, data.loans) === filter) &&
        (category === "all" || String(e.productCategoryId) === category),
    ) || [];
  const people =
    data?.people.filter(
      (p) =>
        `${p.name} ${p.email}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized) &&
        (filter === "all" || p.situation.nameSituation === filter),
    ) || [];
  const loans =
    data?.loans.filter(
      (l) =>
        `${l.product.name} ${l.user.name} ${assetCode(l.productId)}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized) &&
        (filter === "all" ||
          (filter === "active" ? !l.returnedAt : loanStatus(l) === filter)),
    ) || [];
  const count =
    page === "equipment"
      ? equipment.length
      : page === "people"
        ? people.length
        : loans.length;
  const maxPage = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(index, maxPage);
  const slice = <T,>(list: T[]) =>
    list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function exportData() {
    if (!data) return;
    const rows =
      page === "people"
        ? [
            ["Nome", "E-mail", "Situação"],
            ...people.map((p) => [
              p.name,
              p.email,
              translate(p.situation.nameSituation),
            ]),
          ]
        : page === "loans"
          ? [
              [
                "ID",
                "Equipamento",
                "Pessoa",
                "Retirada",
                "Prazo",
                "Devolvido em",
              ],
              ...loans.map((l) => [
                l.id,
                l.product.name,
                l.user.name,
                l.createdAt,
                l.dueAt,
                l.returnedAt || "",
              ]),
            ]
          : [
              ["Patrimônio", "Equipamento", "Categoria", "Situação"],
              ...(page === "dashboard" ? data.equipment : equipment).map(
                (e) => [
                  assetCode(e.id),
                  e.name,
                  translate(e.productCategory.name),
                  {
                    available: "Disponível",
                    borrowed: "Emprestado",
                    maintenance: "Manutenção",
                    inactive: "Inativo",
                  }[equipmentStatus(e, data.loans)],
                ],
              ),
            ];
    downloadCsv(
      `campuslab-${page}-${new Date().toISOString().slice(0, 10)}`,
      rows,
    );
    toast.success("Arquivo CSV exportado.");
  }
  async function confirmAction() {
    if (!confirmation) return;
    setBusy(true);
    try {
      if (confirmation.kind === "return")
        await api(`/loans/${confirmation.loan.id}/return`, { method: "POST" });
      else
        await api(`/${confirmation.resource}/${confirmation.record.id}`, {
          method: "DELETE",
        });
      toast.success(
        confirmation.kind === "return"
          ? "Devolução registrada com sucesso!"
          : "Cadastro excluído.",
      );
      setConfirmation(null);
      await refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível concluir.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">{nav}</aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="mobile-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu CampusLab</SheetTitle>
            <SheetDescription>
              Navegue pelas áreas do laboratório.
            </SheetDescription>
          </SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu />
            </Button>
            <GraduationCap />
            <span>Workspace</span>
            <ChevronRight />
            <strong>{meta.label}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="quick-search"
              onClick={() => {
                navigate("equipment");
                setTimeout(() => searchRef.current?.focus(), 0);
              }}
            >
              <Search />
              <span>Buscar no laboratório</span>
              <kbd>Ctrl K</kbd>
            </button>
            <span className="topbar-separator" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir guia do sistema"
              onClick={() => navigate("guide")}
            >
              <CircleHelp />
            </Button>
            <span className="top-avatar" aria-label="Espaço acadêmico">
              CL
            </span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="page-kicker">
                CAMPUSLAB /{" "}
                {page === "dashboard"
                  ? "SEU DIA EM PERSPECTIVA"
                  : "LABORATÓRIO ACADÊMICO"}
              </div>
              <h1>
                {meta.label}
                <span className="heading-dot">.</span>
              </h1>
              <p>{meta.description}</p>
            </div>
            <div className="page-actions">
              {page === "dashboard" ? (
                <div className="date-label">
                  <CalendarDays />
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              ) : (
                page !== "guide" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={exportData}
                      disabled={!data || loading}
                    >
                      <Download data-icon="inline-start" />
                      Exportar
                    </Button>
                    <Button
                      onClick={() =>
                        setEditor({
                          kind:
                            page === "equipment"
                              ? "equipment"
                              : page === "people"
                                ? "people"
                                : "loan",
                        })
                      }
                      disabled={!data}
                    >
                      <Plus data-icon="inline-start" />
                      {page === "equipment"
                        ? "Novo equipamento"
                        : page === "people"
                          ? "Nova pessoa"
                          : "Novo empréstimo"}
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle />
              <AlertTitle>Não foi possível sincronizar</AlertTitle>
              <AlertDescription>
                {error}
                {data && " Os dados exibidos podem estar desatualizados."}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  onClick={() => void refresh()}
                >
                  <RefreshCw data-icon="inline-start" />
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {page === "guide" ? (
            <Guide />
          ) : loading ? (
            <div className="loading-layout" aria-label="Carregando laboratório">
              <Skeleton className="h-60 w-full" />
              <div className="stats-grid">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-36" />
                ))}
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            data && (
              <>
                {page === "dashboard" ? (
                  <Dashboard
                    data={data}
                    navigate={navigate}
                    newLoan={() => setEditor({ kind: "loan" })}
                    returnLoan={(loan) =>
                      setConfirmation({ kind: "return", loan })
                    }
                  />
                ) : (
                  <>
                    <div className="collection-summary">
                      <span>
                        <span className="live-dot" />
                        {page === "equipment"
                          ? `${data.equipment.length} equipamentos no acervo`
                          : page === "people"
                            ? `${data.people.length} pessoas conectadas`
                            : `${data.loans.filter((l) => !l.returnedAt).length} empréstimos em andamento`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={refreshing}
                        onClick={() => void refresh()}
                      >
                        <RefreshCw
                          data-icon="inline-start"
                          className={cn(refreshing && "animate-spin")}
                        />
                        Atualizar
                      </Button>
                    </div>
                    <Card className="collection-card">
                      <CardHeader>
                        <div className="collection-toolbar">
                          <div className="search-input">
                            <Search />
                            <Input
                              ref={searchRef}
                              aria-label={`Buscar ${meta.label.toLowerCase()}`}
                              placeholder={
                                page === "equipment"
                                  ? "Buscar equipamento ou patrimônio…"
                                  : page === "people"
                                    ? "Buscar nome ou e-mail…"
                                    : "Buscar equipamento ou pessoa…"
                              }
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                            />
                            {query && (
                              <button
                                aria-label="Limpar busca"
                                onClick={() => setQuery("")}
                              >
                                <X />
                              </button>
                            )}
                          </div>
                          <div className="filters">
                            {page === "equipment" && (
                              <FilterSelect
                                label="Filtrar categoria"
                                value={category}
                                onChange={setCategory}
                                options={[
                                  {
                                    value: "all",
                                    label: "Todas as categorias",
                                  },
                                  ...data.catalogs.productCategories.map(
                                    (c) => ({
                                      value: String(c.id),
                                      label: translate(c.name),
                                    }),
                                  ),
                                ]}
                              />
                            )}
                            {page !== "loans" && (
                              <FilterSelect
                                label="Filtrar situação"
                                value={filter}
                                onChange={setFilter}
                                options={
                                  page === "equipment"
                                    ? [
                                        {
                                          value: "all",
                                          label: "Todas as situações",
                                        },
                                        {
                                          value: "available",
                                          label: "Disponíveis",
                                        },
                                        {
                                          value: "borrowed",
                                          label: "Emprestados",
                                        },
                                        {
                                          value: "maintenance",
                                          label: "Manutenção",
                                        },
                                        {
                                          value: "inactive",
                                          label: "Inativos",
                                        },
                                      ]
                                    : [
                                        {
                                          value: "all",
                                          label: "Todas as situações",
                                        },
                                        { value: "Active", label: "Ativos" },
                                        {
                                          value: "Inactive",
                                          label: "Inativos",
                                        },
                                        {
                                          value: "Pending",
                                          label: "Pendentes",
                                        },
                                      ]
                                }
                              />
                            )}
                          </div>
                        </div>
                        {page === "loans" && (
                          <Tabs value={filter} onValueChange={setFilter}>
                            <TabsList>
                              <TabsTrigger value="all">Todos</TabsTrigger>
                              <TabsTrigger value="active">
                                Em andamento
                              </TabsTrigger>
                              <TabsTrigger value="late">
                                Em atraso{" "}
                                {lateCount > 0 && (
                                  <span className="tab-count">{lateCount}</span>
                                )}
                              </TabsTrigger>
                              <TabsTrigger value="returned">
                                Devolvidos
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        )}
                      </CardHeader>
                      <CardContent className="p-0">
                        {!count ? (
                          <NoResults />
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {(page === "equipment"
                                  ? [
                                      "Equipamento",
                                      "Categoria",
                                      "Situação",
                                      "Patrimônio",
                                      "Ações",
                                    ]
                                  : page === "people"
                                    ? [
                                        "Pessoa",
                                        "E-mail",
                                        "Situação",
                                        "Empréstimos ativos",
                                        "Ações",
                                      ]
                                    : [
                                        "Equipamento",
                                        "Pessoa responsável",
                                        "Retirada",
                                        "Devolução prevista",
                                        "Situação",
                                        "Ações",
                                      ]
                                ).map((label) => (
                                  <TableHead key={label}>{label}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {page === "equipment" &&
                                slice(equipment).map((e) => (
                                  <TableRow key={e.id}>
                                    <TableCell>
                                      <div className="item-cell">
                                        <span className="equipment-icon">
                                          <EquipmentIcon name={e.name} />
                                        </span>
                                        <div>
                                          <strong>{e.name}</strong>
                                          <small>Acervo do laboratório</small>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {translate(e.productCategory.name)}
                                    </TableCell>
                                    <TableCell>
                                      <StatusBadge
                                        status={equipmentStatus(e, data.loans)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <span className="asset-code">
                                        {assetCode(e.id)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="row-actions">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={
                                            equipmentStatus(e, data.loans) !==
                                            "available"
                                          }
                                          onClick={() =>
                                            setEditor({
                                              kind: "loan",
                                              productId: e.id,
                                            })
                                          }
                                        >
                                          Emprestar
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Editar ${e.name}`}
                                          onClick={() =>
                                            setEditor({
                                              kind: "equipment",
                                              record: e,
                                            })
                                          }
                                        >
                                          <Pencil />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Excluir ${e.name}`}
                                          onClick={() =>
                                            setConfirmation({
                                              kind: "delete",
                                              resource: "products",
                                              record: e,
                                            })
                                          }
                                        >
                                          <Trash2 />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              {page === "people" &&
                                slice(people).map((p) => (
                                  <TableRow key={p.id}>
                                    <TableCell>
                                      <div className="person-cell">
                                        <span className="initial-avatar large">
                                          {initials(p.name)}
                                        </span>
                                        <strong>{p.name}</strong>
                                      </div>
                                    </TableCell>
                                    <TableCell>{p.email}</TableCell>
                                    <TableCell>
                                      <StatusBadge
                                        status={p.situation.nameSituation}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {
                                        data.loans.filter(
                                          (l) =>
                                            l.userId === p.id && !l.returnedAt,
                                        ).length
                                      }
                                    </TableCell>
                                    <TableCell>
                                      <div className="row-actions">
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Editar ${p.name}`}
                                          onClick={() =>
                                            setEditor({
                                              kind: "people",
                                              record: p,
                                            })
                                          }
                                        >
                                          <Pencil />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Excluir ${p.name}`}
                                          onClick={() =>
                                            setConfirmation({
                                              kind: "delete",
                                              resource: "users",
                                              record: p,
                                            })
                                          }
                                        >
                                          <Trash2 />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              {page === "loans" &&
                                slice(loans).map((l) => (
                                  <TableRow key={l.id}>
                                    <TableCell>
                                      <div className="item-cell">
                                        <span className="equipment-icon">
                                          <EquipmentIcon
                                            name={l.product.name}
                                          />
                                        </span>
                                        <div>
                                          <strong>{l.product.name}</strong>
                                          <small>
                                            {assetCode(l.productId)} ·
                                            Empréstimo #{l.id}
                                          </small>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{l.user.name}</TableCell>
                                    <TableCell>
                                      {dateLabel(l.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                      {dateLabel(l.dueAt, true)}
                                    </TableCell>
                                    <TableCell>
                                      <StatusBadge status={loanStatus(l)} />
                                    </TableCell>
                                    <TableCell>
                                      <div className="row-actions">
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Detalhes do empréstimo ${l.id}`}
                                          onClick={() => setDetails(l)}
                                        >
                                          <BookOpen />
                                        </Button>
                                        {l.returnedAt ? (
                                          <span className="returned-note">
                                            <Check />
                                            {dateLabel(l.returnedAt)}
                                          </span>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              setConfirmation({
                                                kind: "return",
                                                loan: l,
                                              })
                                            }
                                          >
                                            Devolver{" "}
                                            <ArrowRight data-icon="inline-end" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                      <div className="pagination">
                        <span>
                          {count
                            ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, count)} de ${count} registros`
                            : "0 registros"}
                        </span>
                        <div>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Página anterior"
                            disabled={currentPage <= 1}
                            onClick={() => setIndex(currentPage - 1)}
                          >
                            <ChevronLeft />
                          </Button>
                          <span>
                            Página {currentPage} de {maxPage}
                          </span>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Próxima página"
                            disabled={currentPage >= maxPage}
                            onClick={() => setIndex(currentPage + 1)}
                          >
                            <ChevronRight />
                          </Button>
                        </div>
                      </div>
                    </Card>
                    <div className="collection-hint">
                      <GraduationCap />
                      {page === "loans"
                        ? "O histórico de empréstimos é preservado. Registre a devolução para liberar o equipamento."
                        : "Cadastros vinculados ao histórico não podem ser excluídos. Você pode inativá-los a qualquer momento."}
                    </div>
                  </>
                )}
              </>
            )
          )}
        </main>
      </div>
      {editor && data && (
        <RecordDialog
          editor={editor}
          data={data}
          close={() => setEditor(null)}
          saved={refresh}
        />
      )}
      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmation?.kind === "return"
                ? "Confirmar devolução?"
                : "Excluir este cadastro?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.kind === "return"
                ? `Registre a entrega de ${confirmation.loan.product.name}, retirado por ${confirmation.loan.user.name}. Confirme após receber o equipamento.`
                : confirmation?.kind === "delete"
                  ? `O cadastro de ${confirmation.record.name} será excluído. Registros com empréstimos no histórico são protegidos; nesse caso, use a opção de editar e inativar.`
                  : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void confirmAction();
              }}
            >
              {busy && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {confirmation?.kind === "return"
                ? "Confirmar devolução"
                : "Excluir cadastro"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!details}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empréstimo #{details?.id}</DialogTitle>
            <DialogDescription>
              Histórico e informações da retirada.
            </DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="loan-details">
              <div>
                <dt>Equipamento</dt>
                <dd>
                  {details.product.name} · {assetCode(details.productId)}
                </dd>
              </div>
              <div>
                <dt>Pessoa responsável</dt>
                <dd>{details.user.name}</dd>
              </div>
              <div>
                <dt>Retirada</dt>
                <dd>{dateLabel(details.createdAt, true)}</dd>
              </div>
              <div>
                <dt>Prazo de devolução</dt>
                <dd>{dateLabel(details.dueAt, true)}</dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  <StatusBadge status={loanStatus(details)} />
                </dd>
              </div>
              {details.returnedAt && (
                <div>
                  <dt>Devolvido em</dt>
                  <dd>{dateLabel(details.returnedAt, true)}</dd>
                </div>
              )}
              <div>
                <dt>Observações</dt>
                <dd>{details.notes || "Nenhuma observação registrada."}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
function Guide() {
  const steps = [
    {
      icon: Package,
      title: "01. Organize o acervo",
      text: "Em Equipamentos, cadastre um recurso, escolha a categoria e deixe a situação como Disponível. Use a busca por nome ou patrimônio para encontrá-lo depois.",
    },
    {
      icon: Users,
      title: "02. Conecte as pessoas",
      text: "Cadastre o nome e o e-mail do aluno ou professor. A situação Ativo permite novos empréstimos. Cada e-mail é único.",
    },
    {
      icon: ArrowLeftRight,
      title: "03. Registre a retirada",
      text: "Clique em Novo empréstimo, selecione uma pessoa e um equipamento disponível. Informe a data prevista para a devolução e, se quiser, uma observação.",
    },
    {
      icon: Check,
      title: "04. Receba e acompanhe",
      text: "No painel ou em Empréstimos, clique em Devolver. A confirmação libera o equipamento e mantém o histórico. Prazos vencidos aparecem automaticamente em atraso.",
    },
  ];
  return (
    <div className="guide-page">
      <section className="guide-intro">
        <GraduationCap />
        <div>
          <Badge variant="secondary">PROJETO ACADÊMICO</Badge>
          <h2>
            Menos planilhas.
            <br />
            Mais espaço para aprender.
          </h2>
          <p>
            O CampusLab conecta equipamentos e pessoas, facilitando a rotina de
            um laboratório universitário. Um projeto completo para demonstrar
            interface, API, banco relacional e regras de negócio.
          </p>
        </div>
      </section>
      <div className="guide-grid">
        {steps.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <span className="guide-step-icon">
                <s.icon />
              </span>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{s.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Roteiro rápido para o professor</CardTitle>
          <CardDescription>
            Uma demonstração completa em aproximadamente 5 minutos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="guide-checklist">
            <li>
              Explore os indicadores, o gráfico e a lista de prazos na Visão
              geral.
            </li>
            <li>
              Cadastre um equipamento de teste e uma pessoa com e-mail único.
            </li>
            <li>
              Registre um empréstimo e confirme que o equipamento ficou
              emprestado.
            </li>
            <li>Registre a devolução e confira a atualização do painel.</li>
            <li>Exporte um CSV, teste a busca e abra o sistema no celular.</li>
          </ol>
          <Separator className="my-5" />
          <div className="guide-links">
            <Button variant="outline" asChild>
              <a
                href="https://github.com/Nicolas-Assis-F/projetofacul/tree/Nicolas-Assis-F/terminar#readme"
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen data-icon="inline-start" />
                Instalação e documentação{" "}
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api" target="_blank" rel="noreferrer">
                <Monitor data-icon="inline-start" />
                Explorar API
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Alert>
        <GraduationCap />
        <AlertTitle>Ambiente acadêmico</AlertTitle>
        <AlertDescription>
          Este projeto demonstra gestão de laboratório e não inclui
          autenticação. Os dados iniciais são fictícios; use informações de
          teste durante a avaliação.
        </AlertDescription>
      </Alert>
    </div>
  );
}
