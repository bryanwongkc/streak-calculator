import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebaseClient';
import { createId, safeFileName } from '../utils/ids';

export const uploadRuleImage = async ({ gameId, file, title, userId }) => {
  const path = `games/${gameId}/rules/${Date.now()}_${safeFileName(file.name)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  return {
    id: createId('rule'),
    url,
    storagePath: path,
    title: title || file.name,
    createdAt: new Date().toISOString(),
    uploadedBy: userId,
  };
};

export const deleteRuleImageFile = async (storagePath) => {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath));
};
