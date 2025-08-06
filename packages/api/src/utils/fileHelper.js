import fs from "fs";

export const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
        return reject(err);
      }
      console.log(`File deleted: ${filePath}`);
      resolve();
    });
  });
};
