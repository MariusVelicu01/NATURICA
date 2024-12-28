const { db } = require('../db_config/dbConfig');

async function addDocument(collectionName, data) {
  try {
    const docRef = await db.collection(collectionName).add(data);
    return { id: docRef.id, message: 'Document added successfully' };
  } catch (err) {
    throw new Error('Failed to add document');
  }
}

async function getAllDocuments(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error('Failed to fetch documents');
  }
}

async function getDocumentById(collectionName, documentId) {
  try {
    console.log(documentId);
    const doc = await db.collection(collectionName).doc(documentId).get();
    if (!doc.exists) {
      throw new Error('Document not found');
    }
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    throw new Error('Failed to fetch document');
  }
}

async function updateDocument(collectionName, documentId, data) {
    try {
      const docRef = db.collection(collectionName).doc(documentId);
      const doc = await docRef.get();
  
      if (!doc.exists) {
        throw new Error('Document not found. Cannot update a non-existing document.');
      }
  
      await docRef.update(data);
      return { message: 'Document updated successfully' };
    } catch (err) {
      throw new Error(err.message || 'Failed to update document');
    }
}


async function deleteDocument(collectionName, documentId) {
  try {
    const docRef = db.collection(collectionName).doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error('Document not found. Cannot delete a non-existing document.');
    }

    await db.collection(collectionName).doc(documentId).delete();
    return { message: 'Document deleted successfully' };
  } catch (err) {
    throw new Error('Failed to delete document');
  }
}

module.exports = {
  addDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
