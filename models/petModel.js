// models/petModel.js
const { db } = require("../config/firebase");

const PETS_COLLECTION = "pets";

const petModel = {
  async createPet(petData) {
    const docRef = await db.collection(PETS_COLLECTION).add(petData);
    // Update the same doc with its auto-generated ID
    await docRef.update({ id: docRef.id });
    const doc = await docRef.get();
    return { id: docRef.id, ...doc.data() };
  },

  async getAllPets() {
    const snapshot = await db.collection(PETS_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getPetById(id) {
    const doc = await db.collection(PETS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async updatePet(id, updatedData) {
    const docRef = db.collection(PETS_COLLECTION).doc(id);
    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    return { id, ...updatedDoc.data() };
  },

  async deletePet(id) {
    await db.collection(PETS_COLLECTION).doc(id).delete();
    return { message: `Pet ${id} deleted successfully` };
  },
};

module.exports = petModel;
