import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import { CustomRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;

  console.log("files", req.files);

  const files = req.files as any;

  if (
    !files ||
    !files.coverImage ||
    !files.coverImage[0] ||
    !files.file ||
    !files.file[0]
  ) {
    return next(
      createHttpError(
        400,
        "Missing files. Please upload both cover image and book file."
      )
    );
  }

  try {
    const coverImageFile = files.coverImage[0];
    const bookFile = files.file[0];

    const uploadResult = await cloudinary.uploader.upload(coverImageFile.path, {
      filename_override: coverImageFile.filename,
      folder: "book-covers",
    });

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFile.path,
      {
        resource_type: "raw",
        filename_override: bookFile.filename,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as CustomRequest;

    const newBook = await bookModel.create({
      title,
      genre,
      description,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // Delete temporary files
    await fs.promises.unlink(coverImageFile.path);
    await fs.promises.unlink(bookFile.path);

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, genre, description } = req.body;

  const files = req.files as any;
  let coverImageUploadResult, bookFileUploadResult;

  try {
    const existingBook = await bookModel.findById(id);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Upload new cover image if provided
    if (files?.coverImage) {
      const coverImagePath = files.coverImage[0].path;
      const coverImageFileName = files.coverImage[0].filename;
      coverImageUploadResult = await cloudinary.uploader.upload(
        coverImagePath,
        {
          filename_override: coverImageFileName,
          folder: "book-covers",
        }
      );
      // Delete temporary file
      await fs.promises.unlink(coverImagePath);
    }

    // Upload new book file if provided
    if (files?.file) {
      const bookFilePath = files.file[0].path;
      const bookFileName = files.file[0].filename;
      bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      });
      // Delete temporary file
      await fs.promises.unlink(bookFilePath);
    }

    const updatedBookData = {
      title: title || existingBook.title,
      genre: genre || existingBook.genre,
      descriptions: description || existingBook.description,
      coverImage: coverImageUploadResult?.secure_url || existingBook.coverImage,
      file: bookFileUploadResult?.secure_url || existingBook.file,
    };

    const updatedBook = await bookModel.findByIdAndUpdate(id, updatedBookData, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ id: updatedBook._id });
  } catch (error) {
    next(error);
  }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find().populate("author", "name email");
    res.json(books);
  } catch (error) {
    return next(createHttpError(500, "Error while getting books"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.id;

  try {
    const book = await bookModel
      .findById(bookId)
      .populate("author", "name email");
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }
    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while getting book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.id;

  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    // check access
    const _req = req as CustomRequest;
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(403, "You can't delete this book"));
    }

    const coverImageSplit = book.coverImage.split("/");
    const coverImagePublicId =
      coverImageSplit.at(-2) + "/" + coverImageSplit.at(-1)?.split(".").at(-2);

    const bookFileSplit = book.file.split("/");
    const bookFilePublicId = bookFileSplit.at(-2) + "/" + bookFileSplit.at(-1);

    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });

    await bookModel.deleteOne({ _id: bookId });

    return res.status(204).json({ message: "Book deleted successfully" });
  } catch (error) {
    return next(createHttpError(500, "Error while deleting book"));
  }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
