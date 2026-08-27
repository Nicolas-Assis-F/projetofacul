import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string) || 10),
      );
      const result = await productService.findAll({ page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.findById(Number(req.params.id));
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, productSituationId, productCategoryId } = req.body as {
        name: string;
        productSituationId: number;
        productCategoryId: number;
      };
      const product = await productService.create({
        name,
        productSituationId,
        productCategoryId,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.update(
        Number(req.params.id),
        req.body,
      );
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async destroy(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleted = await productService.delete(Number(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
