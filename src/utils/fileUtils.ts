export const validateFile = (file: File) => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
  }

  // Validate file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File size must be less than 2MB");
  }

  return true;
};

export const generateFilePath = (userId: string, file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  return `${userId}/${fileName}`;
};