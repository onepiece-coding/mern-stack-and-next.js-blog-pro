import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import Category from "../models/Category.js"

/**------------------------------------------------
 * @desc   Create New Category
 * @route  /api/categories
 * @method POST
 * @access private (only admin)
---------------------------------------------------*/
export const createCategoryCtrl = asyncHandler(async(req: Request, res: Response) => {
  let cat = await Category.findOne({
    name: { $regex: `^${req.body.title}$`, $options: 'i' },
  });
  if (cat) throw createError(409, 'Category already exist');

  cat = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });

  res.status(201).json(cat);
});

/**------------------------------------------------
 * @desc   Get All Categories
 * @route  /api/categories
 * @method GET
 * @access public
---------------------------------------------------*/
export const getAllCategoriesCtrl = asyncHandler(async(req: Request, res: Response) => {
  const pageFromReq = req.query.page as string | undefined;
  const limitFromReq = req.query.limit as string | undefined;
  const search = (req.query.search as string) ?? undefined;

  const filter: Record<string, any> = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const total = await Category.countDocuments(filter);

  let query = Category.find(filter).lean();

  let page: number | null = null;
  let limit: number | null = null;
  let totalPages: number | null = null;

  if (pageFromReq != null && limitFromReq != null) {
    page = parseInt(pageFromReq, 10);
    limit = parseInt(limitFromReq, 10);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    query = query.skip((page - 1) * limit).limit(limit);
    totalPages = Math.ceil(total / limit);
  }

  const data = await query;

  const meta: Record<string, any> = { total };
  if (page != null && limit != null) {
    meta.page = page;
    meta.limit = limit;
    meta.totalPages = totalPages;
  }

  res.status(200).json({ data, meta });
});

/**------------------------------------------------
 * @desc   Delete Category
 * @route  /api/categories/:id
 * @method DELETE
 * @access private (only admin)
---------------------------------------------------*/
export const deleteCategoryCtrl = asyncHandler(async(req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) throw createError(404, 'Category not found');

  res.status(200).json({
    message: "category has been deleted successfully",
    categoryId: category._id
  });
});