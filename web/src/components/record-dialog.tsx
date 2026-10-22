import { useState, type FormEvent } from "react";
import {
  Loader2,
  Package,
  Users,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FilterSelect, equipmentStatus } from "./shared";
import {
  api,
  translate,
  assetCode,
  type Data,
  type Equipment,
  type Person,
} from "@/lib/api";
import { toast } from "sonner";
export type Editor =
  | { kind: "equipment"; record?: Equipment }
  | { kind: "people"; record?: Person }
  | { kind: "loan"; productId?: number };
export function RecordDialog({
  editor,
  data,
  close,
  saved,
}: {
  editor: Editor;
  data: Data;
  close: () => void;
  saved: () => Promise<void>;
}) {
  const record = editor.kind !== "loan" ? editor.record : undefined;
  const [name, setName] = useState(record?.name || "");
  const [email, setEmail] = useState(
    editor.kind === "people" ? editor.record?.email || "" : "",
  );
  const [category, setCategory] = useState(
    editor.kind === "equipment"
      ? String(
          editor.record?.productCategoryId ||
            data.catalogs.productCategories[0]?.id ||
            "",
        )
      : "",
  );
  const [situation, setSituation] = useState(
    editor.kind === "equipment"
      ? String(
          editor.record?.productSituationId ||
            data.catalogs.productSituations.find((s) => s.name === "Available")
              ?.id ||
            "",
        )
      : String(
          (editor.kind === "people" && editor.record?.situationId) ||
            data.catalogs.situations.find((s) => s.nameSituation === "Active")
              ?.id ||
            "",
        ),
  );
  const [person, setPerson] = useState("");
  const [product, setProduct] = useState(
    editor.kind === "loan" && editor.productId ? String(editor.productId) : "",
  );
  const [due, setDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const available = data.equipment.filter(
    (e) => equipmentStatus(e, data.loans) === "available",
  );
  const eligible = data.people.filter(
    (p) => p.situation.nameSituation === "Active",
  );
  const title =
    editor.kind === "loan"
      ? "Novo empréstimo"
      : `${record ? "Editar" : "Cadastrar"} ${editor.kind === "equipment" ? "equipamento" : "pessoa"}`;
  const Icon =
    editor.kind === "loan"
      ? ArrowLeftRight
      : editor.kind === "equipment"
        ? Package
        : Users;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (editor.kind === "loan" && (!person || !product || !due)) {
      setError("Selecione a pessoa, o equipamento e a data de devolução.");
      return;
    }
    if (
      editor.kind !== "loan" &&
      (name.trim().length < 2 ||
        !situation ||
        (editor.kind === "equipment" && !category))
    ) {
      setError("Preencha o nome e selecione as opções do cadastro.");
      return;
    }
    setBusy(true);
    try {
      const path =
        editor.kind === "loan"
          ? "/loans"
          : `${editor.kind === "equipment" ? "/products" : "/users"}${record ? `/${record.id}` : ""}`;
      const body =
        editor.kind === "loan"
          ? {
              userId: Number(person),
              productId: Number(product),
              dueAt: new Date(`${due}T23:59:59`).toISOString(),
              notes,
            }
          : editor.kind === "equipment"
            ? {
                name: name.trim(),
                productCategoryId: Number(category),
                productSituationId: Number(situation),
              }
            : {
                name: name.trim(),
                email: email.trim(),
                situationId: Number(situation),
              };
      await api(path, {
        method: record ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      toast.success(
        editor.kind === "loan"
          ? "Empréstimo registrado. Boa criação!"
          : "Cadastro salvo com sucesso.",
      );
      await saved();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent className="record-dialog">
        <DialogHeader>
          <div className="dialog-symbol">
            <Icon />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {editor.kind === "loan"
              ? "Conecte uma pessoa ao próximo projeto. A disponibilidade é atualizada automaticamente."
              : "Preencha as informações para manter o laboratório organizado."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FieldGroup>
            {editor.kind === "loan" ? (
              <>
                <Field>
                  <FieldLabel htmlFor="loan-person">
                    Pessoa responsável
                  </FieldLabel>
                  <FilterSelect
                    id="loan-person"
                    label="Pessoa responsável"
                    value={person}
                    onChange={setPerson}
                    options={eligible.map((p) => ({
                      value: String(p.id),
                      label: p.name,
                    }))}
                  />
                  {!eligible.length && (
                    <FieldDescription>
                      Cadastre uma pessoa ativa antes de continuar.
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="loan-product">Equipamento</FieldLabel>
                  <FilterSelect
                    id="loan-product"
                    label="Equipamento"
                    value={product}
                    onChange={setProduct}
                    options={available.map((e) => ({
                      value: String(e.id),
                      label: `${e.name} · ${assetCode(e.id)}`,
                    }))}
                  />
                  <FieldDescription>
                    {available.length} equipamentos disponíveis para retirada.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="loan-due">Data de devolução</FieldLabel>
                  <Input
                    id="loan-due"
                    type="date"
                    required
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    min={new Date().toLocaleDateString("en-CA")}
                  />
                  <FieldDescription>
                    O prazo termina às 23h59 do dia selecionado.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="loan-notes">
                    Observações <span className="optional-label">opcional</span>
                  </FieldLabel>
                  <Textarea
                    id="loan-notes"
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex.: projeto de robótica, aula de fotografia…"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field data-invalid={!!error && name.trim().length < 2}>
                  <FieldLabel htmlFor="record-name">
                    {editor.kind === "equipment"
                      ? "Nome do equipamento"
                      : "Nome completo"}
                  </FieldLabel>
                  <Input
                    id="record-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={150}
                    aria-invalid={!!error && name.trim().length < 2}
                    placeholder={
                      editor.kind === "equipment"
                        ? "Ex.: Notebook Dell Latitude"
                        : "Ex.: Ana Clara Martins"
                    }
                  />
                </Field>
                {editor.kind === "people" ? (
                  <Field>
                    <FieldLabel htmlFor="record-email">E-mail</FieldLabel>
                    <Input
                      id="record-email"
                      type="email"
                      required
                      maxLength={200}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@faculdade.edu.br"
                    />
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel htmlFor="record-category">Categoria</FieldLabel>
                    <FilterSelect
                      id="record-category"
                      label="Categoria"
                      value={category}
                      onChange={setCategory}
                      options={data.catalogs.productCategories.map((c) => ({
                        value: String(c.id),
                        label: translate(c.name),
                      }))}
                    />
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="record-situation">
                    Situação do cadastro
                  </FieldLabel>
                  <FilterSelect
                    id="record-situation"
                    label="Situação do cadastro"
                    value={situation}
                    onChange={setSituation}
                    options={
                      editor.kind === "equipment"
                        ? data.catalogs.productSituations.map((s) => ({
                            value: String(s.id),
                            label: translate(s.name),
                          }))
                        : data.catalogs.situations.map((s) => ({
                            value: String(s.id),
                            label: translate(s.nameSituation),
                          }))
                    }
                  />
                  <FieldDescription>
                    {editor.kind === "equipment"
                      ? "Equipamentos em manutenção ou inativos não podem ser emprestados."
                      : "Somente pessoas ativas podem realizar novos empréstimos."}
                  </FieldDescription>
                </Field>
              </>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Confira os dados</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={close}
            >
              Cancelar
            </Button>
            <Button
              disabled={
                busy ||
                (editor.kind === "loan" &&
                  (!available.length || !eligible.length))
              }
              type="submit"
            >
              {busy && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {editor.kind === "loan"
                ? "Confirmar empréstimo"
                : "Salvar cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
