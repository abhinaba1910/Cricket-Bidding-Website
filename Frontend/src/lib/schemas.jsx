import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const auctionStep1Schema = z.object({
  auctionName: z.string().min(3, { message: "Auction name must be at least 3 characters." }),
  shortName: z
    .string()
    .min(2, { message: "Short name must be at least 2 characters." })
    .max(10, { message: "Short name cannot exceed 10 characters." }),
  auctionImage: z
    .custom()
    .refine((files) => files && files.length > 0, "Auction image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type || ""),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .nullable()
    .optional(),
  startDate: z.date({ required_error: "Start date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format. Use HH:MM." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(500, { message: "Description cannot exceed 500 characters." }),
});

export const auctionStep2Schema = z.object({
  selectedTeams: z.array(z.string()).min(1, { message: "Please select at least one team." }),
});

export const auctionStep3Schema = z.object({
  selectedPlayers: z.array(z.string()).min(1, { message: "Please select at least one player." }),
});

/*
  Combined form shape:

  {
    auctionName: string,
    shortName: string,
    auctionImage: FileList | null,
    startDate: Date,
    startTime: string,
    description: string,
    selectedTeams: string[],
    selectedPlayers: string[],
    auctionImagePreview?: string | null
  }
*/
