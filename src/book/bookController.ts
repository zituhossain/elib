import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log("files", req.files);

  try {
    const files = req.files as any;
    const fileName = files.coverImage[0].filename;
    const filePath = files.coverImage[0].path;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = files.file[0].path;

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    console.log("bookFileUploadResult", bookFileUploadResult);
    console.log("uploadResult", uploadResult);

    res.json({ message: "create book" });
  } catch (error) {
    return next(createHttpError(500, "failed to create book"));
  }
};

export { createBook };
