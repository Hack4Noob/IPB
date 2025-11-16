const cloudinaryUrl = "https://api.cloudinary.com/v1_1/SUA_CLOUD_NAME/upload";
const uploadPreset = "SEU_UPLOAD_PRESET";

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return null;
  }
}

document.getElementById("upload-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (file) {
    const url = await uploadFile(file);
    if (url) {
      console.log("Arquivo enviado com sucesso:", url);
    }
  }
});
