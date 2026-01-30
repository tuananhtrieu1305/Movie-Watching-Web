// Giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const uploadMovie = async (formData) => {
  await delay(1000); // Giả vờ upload
  console.log("Mock Upload Data:", Object.fromEntries(formData));
  return { message: "Thao tác thành công!" };
};
