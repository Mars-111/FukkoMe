import { cacheRecentEntityDb, type EntityType, type RecentEntity } from "../internal/db/cacheRecentEntityDb";
 

// Добавить или обновить просмотренную сущность
export async function addRecentEntity(id: number, type: EntityType) {
    try {
        await cacheRecentEntityDb.recentEntities.add({
            entityId: id,
            type
        });
    } catch (e) {
        console.error("Ошибка при добавлении:", e);
    }
    
    const recentles = await cacheRecentEntityDb.recentEntities
    .where({ entityId: id, type })
    .toArray();

    let maxId = -1;

    for (const i of recentles) {
        maxId = i.idInRecentDb! > maxId ? i.idInRecentDb! : maxId;
    }

    for (const i of recentles) {
        if (i.idInRecentDb! === maxId) return;
        await cacheRecentEntityDb.recentEntities.delete(i.idInRecentDb!);
    }

    // ограничение размера (оставляем только последние 50)
    const total = await cacheRecentEntityDb.recentEntities.count();
    if (total > 70) {
        const oldest = await cacheRecentEntityDb.recentEntities
        .orderBy("idInRecentDb")
        .limit(total - 50) //Запас что бы не вызывать каждый раз
        .toArray();

        await cacheRecentEntityDb.recentEntities.bulkDelete(oldest.map(e => e.idInRecentDb!));
    }
}


// Получить последние N сущностей (любой тип)
export async function getRecentEntities(limit: number = 20): Promise<RecentEntity[]> {
  return cacheRecentEntityDb.recentEntities
    .orderBy("idInRecentDb")
    .reverse()
    .limit(limit)
    .toArray();
}

// Получить только пользователей
export async function getRecentUsers(limit: number = 20): Promise<RecentEntity[]> {
  return cacheRecentEntityDb.recentEntities
    .where("type")
    .equals("user")
    .reverse()
    .sortBy("idInRecentDb")
    .then(arr => arr.slice(-limit).reverse());
}

// Получить только чаты
export async function getRecentChats(limit: number = 20): Promise<RecentEntity[]> {
  return cacheRecentEntityDb.recentEntities
    .where("type")
    .equals("chat")
    .reverse()
    .sortBy("idInRecentDb")
    .then(arr => arr.slice(-limit).reverse());
}

// Очистка
export async function clearRecentEntities() {
  await cacheRecentEntityDb.recentEntities.clear();
}
