export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function filesToDocuments(files) {
  const documents = [];
  for (const file of files) {
    const content = await fileToDataUrl(file);
    documents.push({
      document_id: file.name,
      content,
    });
  }
  return documents;
}
