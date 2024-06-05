import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import { CustomRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  console.log("files", req.files);

  const files = req.files as any;
  const fileName = files.coverImage[0].filename;
  const filePath = files.coverImage[0].path;

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    filename_override: fileName,
    folder: "book-covers",
  });

  const bookFileName = files.file[0].filename;
  const bookFilePath = files.file[0].path;

  const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
    resource_type: "raw",
    filename_override: bookFileName,
    folder: "book-pdfs",
    format: "pdf",
  });

  const _req = req as CustomRequest;

  const newBook = await bookModel.create({
    title,
    genre,
    author: _req.userId,
    coverImage: uploadResult.secure_url,
    file: bookFileUploadResult.secure_url,
  });

  // Delete temporary files
  await fs.promises.unlink(filePath);
  await fs.promises.unlink(bookFilePath);

  res.status(201).json({ id: newBook._id });
};

export { createBook };
