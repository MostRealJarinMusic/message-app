import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { CategoryService } from "../services/category.service";
import { asyncHandler } from "../utils/async-wrapper";

export default function categoryRoutes(
  categoryService: CategoryService
): Router {
  const categoryRoutes = Router();

  //Deleting categories
  categoryRoutes.delete(
    "/:categoryId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await categoryService.deleteCategory(req.params.categoryId);
      res.status(204).send();
    })
  );

  //Editing categories
  categoryRoutes.patch(
    "/:categoryId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await categoryService.editCategory(req.params.categoryId, req.body);
      res.status(204).send();
    })
  );

  //Reordering categories

  //Get single category

  return categoryRoutes;
}
