import { Upload } from "@aws-sdk/lib-storage";
import s3 from "./r2.js";
import dotenv from "dotenv";

dotenv.config();

export const uploadFileToR2 = async (file, folder) => {
  if (!file) return null;

  const fileExt = file.originalname.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1000)}.${fileExt}`;

  const s3Upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await s3Upload.done();
  return fileName;
};
