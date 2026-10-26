
import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import db from "../firebase/firestore";
import { cars as staticCars } from "../data/cars";

export async function importStaticCars() {
  if (!Array.isArray(staticCars) || staticCars.length === 0) {
    throw new Error("Static cars ki list empty hai.");
  }

  const carsRef = collection(db, "cars");
  const snapshot = await getDocs(carsRef);

  const existingBySlug = new Map();
  const existingById = new Map();

  snapshot.forEach((carDoc) => {
    const data = carDoc.data();

    existingById.set(carDoc.id, data);

    if (data.slug && !existingBySlug.has(data.slug)) {
      existingBySlug.set(data.slug, carDoc.id);
    }
  });

  const operations = [];
  let imported = 0;
  let skipped = 0;
  let reused = 0;

  for (const car of staticCars) {
    if (!car.slug) {
      skipped++;
      continue;
    }

    // Same slug already exists: don't overwrite its data.
    if (existingBySlug.has(car.slug)) {
      skipped++;
      continue;
    }

    // Reuse an existing document ID if it matches a known convention.
    const possibleIds = [car.slug, `static-${car.slug}`];

    let targetId = possibleIds.find((id) => existingById.has(id));

    const safeCarData = {
      ...car,
      slug: car.slug,
      model: car.model || String(car.year || ""),
      pricePerDay: Number(car.pricePerDay ?? car.price ?? 0),
      fuelType: car.fuelType || car.fuel || "",
    };

    // These are runtime/booking fields, not static catalogue data.
    delete safeCarData.id;
    delete safeCarData.available;
    delete safeCarData.status;
    delete safeCarData.booking;
    delete safeCarData.image;
    delete safeCarData.images;
    delete safeCarData.imageUrl;

    if (targetId) {
      // Keep the existing document ID and any booking fields.
      operations.push({
        ref: doc(db, "cars", targetId),
        data: safeCarData,
        merge: true,
      });

      reused++;
    } else {
      targetId = car.slug;

      operations.push({
        ref: doc(db, "cars", targetId),
        data: {
          ...safeCarData,
          available: true,
          status: "available",
          booking: {
            isBooked: false,
            requestStatus: "",
          },
          imageUrl: car.imageUrl || "",
          images: car.images || {
            front: "",
            side: "",
            interior: "",
            back: "",
          },
        },
        merge: false,
      });

      imported++;
    }
  }

  // Firestore batches have a 500-write limit.
  for (let i = 0; i < operations.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = operations.slice(i, i + 450);

    chunk.forEach((operation) => {
      batch.set(
        operation.ref,
        operation.data,
        operation.merge ? { merge: true } : undefined
      );
    });

    await batch.commit();
  }

  return {
    imported,
    reused,
    skipped,
    total: staticCars.length,
  };
}
