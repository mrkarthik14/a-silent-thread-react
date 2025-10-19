export function validatePost(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Post content cannot be empty" };
  }
  if (content.length > 5000) {
    return { valid: false, error: "Post content is too long (max 5000 characters)" };
  }
  return { valid: true };
}

export function validateService(title: string, price: number, category: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Service title is required" };
  }
  if (title.length > 200) {
    return { valid: false, error: "Service title is too long (max 200 characters)" };
  }
  if (!category || category.trim().length === 0) {
    return { valid: false, error: "Service category is required" };
  }
  if (price <= 0) {
    return { valid: false, error: "Price must be greater than 0" };
  }
  if (price > 1000000) {
    return { valid: false, error: "Price is too high" };
  }
  return { valid: true };
}
