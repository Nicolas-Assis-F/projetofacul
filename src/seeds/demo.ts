import "reflect-metadata";
import { AppDataSource as db } from "../config/database";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { Situation } from "../entities/Situation";
import { ProductSituation } from "../entities/ProductSituation";
import { ProductCategory } from "../entities/ProductCategory";
import { Loan } from "../entities/Loan";

async function main() {
  await db.initialize();
  try {
    await db.transaction(async (manager) => {
      const active = await manager.findOneByOrFail(Situation, {
        nameSituation: "Active",
      });
      const available = await manager.findOneByOrFail(ProductSituation, {
        name: "Available",
      });
      const maintenance = await manager.findOneByOrFail(ProductSituation, {
        name: "Out of Stock",
      });
      const names = [
        "Ana Clara Martins",
        "Lucas Oliveira",
        "Mariana Santos",
        "Pedro Henrique",
        "Julia Costa",
        "Gabriel Almeida",
        "Beatriz Lima",
        "Rafael Souza",
        "Isabela Rocha",
        "Matheus Ferreira",
        "Camila Ribeiro",
        "Bruno Carvalho",
      ];
      const users: User[] = [];
      for (const [index, name] of names.entries()) {
        const email = `aluno${index + 1}@campuslab.example`;
        users.push(
          (await manager.findOneBy(User, { email })) ||
            (await manager.save(
              User,
              manager.create(User, { name, email, situationId: active.id }),
            )),
        );
      }
      const items = [
        ["Notebook Dell Latitude 5420", "Informática"],
        ["Câmera Canon EOS Rebel T7", "Audiovisual"],
        ["Kit Arduino Uno R3", "Prototipagem"],
        ["Projetor Epson PowerLite", "Audiovisual"],
        ["Notebook Lenovo ThinkPad", "Informática"],
        ["Multímetro digital Minipa", "Instrumentação"],
        ["Tablet Samsung Galaxy Tab", "Informática"],
        ["Microfone condensador USB", "Audiovisual"],
        ["Kit Raspberry Pi 4", "Prototipagem"],
        ["Osciloscópio digital", "Instrumentação"],
        ["Tripé profissional Manfrotto", "Acessórios"],
        ["Mesa digitalizadora Wacom", "Informática"],
        ["Headset Logitech H390", "Acessórios"],
        ["Câmera Sony Alpha a6400", "Audiovisual"],
        ["Kit de sensores IoT", "Prototipagem"],
        ["Fonte de bancada ajustável", "Instrumentação"],
        ["Adaptador USB-C multiportas", "Acessórios"],
        ["Notebook Acer Aspire 5", "Informática"],
        ["Gravador de áudio Zoom H1n", "Audiovisual"],
        ["Kit ferramentas de precisão", "Acessórios"],
      ];
      const products: Product[] = [];
      for (const [i, [name, category]] of items.entries()) {
        const cat = await manager.findOneByOrFail(ProductCategory, {
          name: category,
        });
        products.push(
          (await manager.findOneBy(Product, { name })) ||
            (await manager.save(
              Product,
              manager.create(Product, {
                name,
                productCategoryId: cat.id,
                productSituationId:
                  i === 9 || i === 15 ? maintenance.id : available.id,
              }),
            )),
        );
      }
      if (
        !(await manager.exists(Loan, {
          where: { notes: "Demonstração CampusLab: atividade acadêmica." },
        }))
      ) {
        const now = Date.now();
        const day = 86400000;
        for (let i = 0; i < 18; i++) {
          const product = products[i % 9];
          const start = now - ((18 - i) * day) / 3;
          const returned = i < 12;
          await manager.save(
            Loan,
            manager.create(Loan, {
              productId: product.id,
              userId: users[i % users.length].id,
              createdAt: new Date(start),
              dueAt: new Date(
                now + (i === 12 || i === 13 ? -1 : (i % 4) + 1) * day,
              ),
              returnedAt: returned ? new Date(start + day / 4) : null,
              notes: "Demonstração CampusLab: atividade acadêmica.",
            }),
          );
        }
      }
    });
    console.log(
      "Demonstração pronta: equipamentos, pessoas e empréstimos fictícios.",
    );
  } finally {
    await db.destroy();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
