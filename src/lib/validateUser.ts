import { User } from "@/types";
import { getAuthSession } from "./authOptions";
import { db } from "./db";
import { redirect } from "next/navigation";

export const validatUser = async (): Promise<{
    validatedUser?: User;
    error?: string;
  }> => {
    let validatedUser: User;
  
    try {
      const session = await getAuthSession();
  
      if (!session) throw new Error("Unauthorized");
      if (!session?.user) throw new Error("Unauthorized");
      if (!session?.user.id) throw new Error("Unauthorized");
  
      const isUserExists = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
  
      if (!isUserExists) {
        throw new Error("user does not exist");
      }
  
      validatedUser = {
        name: isUserExists.name,
        email: isUserExists.email,
        image: isUserExists.image,
        id: isUserExists.id,
      };
    } catch (err: any) {
      return {
        error: err.message || "Something went wrong, please try again",
      };
    }
  
    if (!validatedUser || validatedUser === null || !validatedUser?.id)
      redirect("/signout");
  
    return {
      validatedUser,
    };
  };