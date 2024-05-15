"use server";

// @ts-ignore
import cloudinary from "cloudinary/lib/cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const removeFileUpload = async ({
  file_public_id,
}: {
  file_public_id: string;
}): Promise<{
  status?: "ok" | "error";
  error?: string;
}> => {
  try {
    await cloudinary.v2.uploader.destroy(
      file_public_id,
      function (error: Error, result: any) {
        console.log(result, error);
        if (error) throw error;
      }
    );

    return {
      status: "ok",
    };
  } catch (err: any) {
    console.log(err);
    return {
      status: "error",
      error: err.message || "Something went wrong, please try again",
    };
  }
};
