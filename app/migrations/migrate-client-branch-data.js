/**
 * Script di migrazione per popolare clientId e branchId
 * basandosi sui valori di associatedClient e associatedBranch
 * 
 * Le colonne vecchie (associatedClient, associatedBranch) NON vengono eliminate
 * 
 * Esecuzione: node app/migrations/migrate-client-branch-data.js
 */

const db = require("../models");
const User = db.user;
const Client = db.client;
const Branch = db.branch;

async function migrateData() {
  try {
    console.log("🚀 Inizio migrazione dati Client e Branch...\n");

    // Sincronizza il database per creare le nuove tabelle se non esistono
    await db.sequelize.sync({ alter: true });
    console.log("✅ Database sincronizzato\n");

    // STEP 1: Migrazione Clients
    console.log("📊 STEP 1: Migrazione Clients");
    console.log("----------------------------");

    // Ottieni tutti i valori distinti di associatedClient
    const usersWithClients = await db.sequelize.query(
      `SELECT DISTINCT associatedClient 
       FROM users 
       WHERE associatedClient IS NOT NULL 
       AND associatedClient != '' 
       AND associatedClient != 'null'`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    console.log(`Trovati ${usersWithClients.length} client unici da migrare`);

    const clientMap = {};
    for (const row of usersWithClients) {
      const clientName = row.associatedClient.trim();
      
      if (!clientName) continue;

      // Cerca o crea il client
      let [client, created] = await Client.findOrCreate({
        where: { name: clientName },
        defaults: { name: clientName }
      });

      if (created) {
        console.log(`  ✓ Creato client: "${clientName}" (ID: ${client.id})`);
      } else {
        console.log(`  ⚠ Client già esistente: "${clientName}" (ID: ${client.id})`);
      }
      
      clientMap[clientName] = client.id;
    }

    // Aggiorna gli utenti con clientId basandosi su associatedClient
    let updatedClientsCount = 0;
    for (const [clientName, clientId] of Object.entries(clientMap)) {
      const [affectedRows] = await db.sequelize.query(
        `UPDATE users 
         SET clientId = :clientId 
         WHERE associatedClient = :clientName 
         AND (clientId IS NULL OR clientId != :clientId)`,
        {
          replacements: { clientId, clientName },
          type: db.Sequelize.QueryTypes.UPDATE
        }
      );
      updatedClientsCount += affectedRows;
    }
    console.log(`  ✓ Aggiornati ${updatedClientsCount} utenti con clientId\n`);

    // STEP 2: Migrazione Branches
    console.log("📊 STEP 2: Migrazione Branches");
    console.log("----------------------------");

    // Ottieni tutti i valori distinti di associatedBranch
    const usersWithBranches = await db.sequelize.query(
      `SELECT DISTINCT associatedBranch 
       FROM users 
       WHERE associatedBranch IS NOT NULL 
       AND associatedBranch != '' 
       AND associatedBranch != 'null'`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    console.log(`Trovati ${usersWithBranches.length} branch unici da migrare`);

    const branchMap = {};
    for (const row of usersWithBranches) {
      const branchName = row.associatedBranch.trim();
      
      if (!branchName) continue;

      // Cerca o crea il branch
      let [branch, created] = await Branch.findOrCreate({
        where: { name: branchName },
        defaults: { name: branchName }
      });

      if (created) {
        console.log(`  ✓ Creato branch: "${branchName}" (ID: ${branch.id})`);
      } else {
        console.log(`  ⚠ Branch già esistente: "${branchName}" (ID: ${branch.id})`);
      }
      
      branchMap[branchName] = branch.id;
    }

    // Aggiorna gli utenti con branchId basandosi su associatedBranch
    let updatedBranchesCount = 0;
    for (const [branchName, branchId] of Object.entries(branchMap)) {
      const [affectedRows] = await db.sequelize.query(
        `UPDATE users 
         SET branchId = :branchId 
         WHERE associatedBranch = :branchName 
         AND (branchId IS NULL OR branchId != :branchId)`,
        {
          replacements: { branchId, branchName },
          type: db.Sequelize.QueryTypes.UPDATE
        }
      );
      updatedBranchesCount += affectedRows;
    }
    console.log(`  ✓ Aggiornati ${updatedBranchesCount} utenti con branchId\n`);

    // STEP 3: Verifica
    console.log("📊 STEP 3: Verifica finale");
    console.log("----------------------------");
    
    const totalClients = await Client.count();
    const totalBranches = await Branch.count();
    const usersWithClientId = await User.count({ 
      where: { clientId: { [db.Sequelize.Op.ne]: null } } 
    });
    const usersWithBranchId = await User.count({ 
      where: { branchId: { [db.Sequelize.Op.ne]: null } } 
    });
    const usersWithAssociatedClient = await User.count({ 
      where: { 
        associatedClient: { 
          [db.Sequelize.Op.and]: [
            { [db.Sequelize.Op.ne]: null },
            { [db.Sequelize.Op.ne]: '' }
          ]
        } 
      } 
    });
    const usersWithAssociatedBranch = await User.count({ 
      where: { 
        associatedBranch: { 
          [db.Sequelize.Op.and]: [
            { [db.Sequelize.Op.ne]: null },
            { [db.Sequelize.Op.ne]: '' }
          ]
        } 
      } 
    });
    
    console.log(`  ✓ Totale clients nella tabella: ${totalClients}`);
    console.log(`  ✓ Totale branches nella tabella: ${totalBranches}`);
    console.log(`  ✓ Utenti con clientId: ${usersWithClientId}`);
    console.log(`  ✓ Utenti con branchId: ${usersWithBranchId}`);
    console.log(`  ✓ Utenti con associatedClient (vecchio): ${usersWithAssociatedClient}`);
    console.log(`  ✓ Utenti con associatedBranch (vecchio): ${usersWithAssociatedBranch}\n`);

    console.log("✅ Migrazione completata con successo!\n");
    
    console.log("ℹ️  NOTE IMPORTANTI:");
    console.log("----------------------------");
    console.log("✓ Le colonne associatedClient e associatedBranch sono state MANTENUTE");
    console.log("✓ I nuovi campi clientId e branchId sono stati popolati");
    console.log("✓ Il sistema ora può funzionare con entrambi i sistemi");
    console.log("✓ Quando sei sicuro, potrai eliminare le colonne vecchie con:");
    console.log("  ALTER TABLE users DROP COLUMN associatedClient;");
    console.log("  ALTER TABLE users DROP COLUMN associatedBranch;\n");

  } catch (error) {
    console.error("❌ Errore durante la migrazione:", error);
    throw error;
  } finally {
    await db.sequelize.close();
    console.log("🔌 Connessione al database chiusa");
  }
}

// Esegui la migrazione
migrateData()
  .then(() => {
    console.log("\n🎉 Script completato!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script fallito:", error);
    process.exit(1);
  });
