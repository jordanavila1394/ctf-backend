const db = require("../models");
const User = db.user;
const Client = db.client;
const Branch = db.branch;

// Endpoint per debuggare i dati prima della migrazione
exports.debugMigrationData = async (req, res) => {
  try {
    console.log("🔍 Inizio debug dati migrazione...");

    // 1. Ottieni valori distinti di associatedClient
    const distinctClients = await db.sequelize.query(
      `SELECT DISTINCT associatedClient 
       FROM users 
       WHERE associatedClient IS NOT NULL 
       AND associatedClient != '' 
       AND associatedClient != 'null'
       ORDER BY associatedClient ASC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    // 2. Ottieni valori distinti di associatedBranch
    const distinctBranches = await db.sequelize.query(
      `SELECT DISTINCT associatedBranch 
       FROM users 
       WHERE associatedBranch IS NOT NULL 
       AND associatedBranch != '' 
       AND associatedBranch != 'null'
       ORDER BY associatedBranch ASC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    // 3. Conta utenti con i vari campi
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

    const usersWithClientId = await User.count({
      where: { clientId: { [db.Sequelize.Op.ne]: null } }
    });

    const usersWithBranchId = await User.count({
      where: { branchId: { [db.Sequelize.Op.ne]: null } }
    });

    // 4. Conta record esistenti nelle tabelle
    const existingClients = await Client.count();
    const existingBranches = await Branch.count();

    // 5. Campione di utenti (primi 5 con dati)
    const sampleUsers = await User.findAll({
      attributes: ['id', 'name', 'surname', 'associatedClient', 'clientId', 'associatedBranch', 'branchId'],
      where: {
        [db.Sequelize.Op.or]: [
          { associatedClient: { [db.Sequelize.Op.ne]: null } },
          { associatedBranch: { [db.Sequelize.Op.ne]: null } }
        ]
      },
      limit: 5
    });

    // 6. Prepara risposta
    const debugData = {
      status: "success",
      timestamp: new Date().toISOString(),
      summary: {
        distinctClientsToMigrate: distinctClients.length,
        distinctBranchesToMigrate: distinctBranches.length,
        usersWithAssociatedClient,
        usersWithAssociatedBranch,
        usersWithClientId,
        usersWithBranchId,
        existingClientsInTable: existingClients,
        existingBranchesInTable: existingBranches,
        totalUsers: await User.count()
      },
      distinctClients: distinctClients.map(c => c.associatedClient),
      distinctBranches: distinctBranches.map(b => b.associatedBranch),
      sampleUsers: sampleUsers.map(u => ({
        id: u.id,
        name: `${u.name} ${u.surname}`,
        associatedClient: u.associatedClient,
        clientId: u.clientId,
        associatedBranch: u.associatedBranch,
        branchId: u.branchId
      })),
      recommendations: []
    };

    // 7. Aggiungi raccomandazioni
    if (distinctClients.length > 0 && existingClients === 0) {
      debugData.recommendations.push("⚠️ Nessun client nella tabella 'clients'. La migrazione creerà " + distinctClients.length + " nuovi client.");
    }
    if (distinctBranches.length > 0 && existingBranches === 0) {
      debugData.recommendations.push("⚠️ Nessun branch nella tabella 'branches'. La migrazione creerà " + distinctBranches.length + " nuovi branch.");
    }
    if (usersWithClientId > 0) {
      debugData.recommendations.push("✓ " + usersWithClientId + " utenti hanno già clientId popolato.");
    }
    if (usersWithBranchId > 0) {
      debugData.recommendations.push("✓ " + usersWithBranchId + " utenti hanno già branchId popolato.");
    }
    if (usersWithAssociatedClient === usersWithClientId && usersWithAssociatedBranch === usersWithBranchId) {
      debugData.recommendations.push("✅ Migrazione già completata! Tutti i dati sono sincronizzati.");
    } else {
      const clientsToMigrate = usersWithAssociatedClient - usersWithClientId;
      const branchesToMigrate = usersWithAssociatedBranch - usersWithBranchId;
      if (clientsToMigrate > 0) {
        debugData.recommendations.push("🔄 Da migrare: " + clientsToMigrate + " utenti necessitano di clientId.");
      }
      if (branchesToMigrate > 0) {
        debugData.recommendations.push("🔄 Da migrare: " + branchesToMigrate + " utenti necessitano di branchId.");
      }
    }

    res.status(200).json(debugData);

  } catch (error) {
    console.error("❌ Errore durante il debug:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Endpoint per eseguire la migrazione
exports.runMigration = async (req, res) => {
  try {
    console.log("🚀 Inizio migrazione Client e Branch...");
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    // STEP 1: Crea tabelle se non esistono (senza timestamp)
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
    
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Rimuovi colonne timestamp se esistono (per sicurezza)
    try {
      await db.sequelize.query(`ALTER TABLE clients DROP COLUMN createdAt`);
    } catch (e) {
      // Colonna non esiste, ignora
    }
    try {
      await db.sequelize.query(`ALTER TABLE clients DROP COLUMN updatedAt`);
    } catch (e) {
      // Colonna non esiste, ignora
    }
    try {
      await db.sequelize.query(`ALTER TABLE branches DROP COLUMN createdAt`);
    } catch (e) {
      // Colonna non esiste, ignora
    }
    try {
      await db.sequelize.query(`ALTER TABLE branches DROP COLUMN updatedAt`);
    } catch (e) {
      // Colonna non esiste, ignora
    }

    results.steps.push({
      step: 1,
      name: "Creazione tabelle",
      status: "completed"
    });

    // STEP 2: Migrazione Clients
    const clientsData = await db.sequelize.query(
      `SELECT DISTINCT associatedClient 
       FROM users 
       WHERE associatedClient IS NOT NULL 
       AND associatedClient != '' 
       AND associatedClient != 'null'`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    const clientMap = {};
    let createdClients = 0;
    let existingClients = 0;

    for (const row of clientsData) {
      const clientName = row.associatedClient.trim();
      if (!clientName) continue;

      const [client, created] = await Client.findOrCreate({
        where: { name: clientName },
        defaults: { name: clientName }
      });

      if (created) createdClients++;
      else existingClients++;
      
      clientMap[clientName] = client.id;
    }

    // Aggiorna clientId
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

    results.steps.push({
      step: 2,
      name: "Migrazione Clients",
      status: "completed",
      details: {
        createdClients,
        existingClients,
        updatedUsers: updatedClientsCount
      }
    });

    // STEP 3: Migrazione Branches
    const branchesData = await db.sequelize.query(
      `SELECT DISTINCT associatedBranch 
       FROM users 
       WHERE associatedBranch IS NOT NULL 
       AND associatedBranch != '' 
       AND associatedBranch != 'null'`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    const branchMap = {};
    let createdBranches = 0;
    let existingBranches = 0;

    for (const row of branchesData) {
      const branchName = row.associatedBranch.trim();
      if (!branchName) continue;

      const [branch, created] = await Branch.findOrCreate({
        where: { name: branchName },
        defaults: { name: branchName }
      });

      if (created) createdBranches++;
      else existingBranches++;
      
      branchMap[branchName] = branch.id;
    }

    // Aggiorna branchId
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

    results.steps.push({
      step: 3,
      name: "Migrazione Branches",
      status: "completed",
      details: {
        createdBranches,
        existingBranches,
        updatedUsers: updatedBranchesCount
      }
    });

    // STEP 4: Verifica finale
    const finalStats = {
      totalClients: await Client.count(),
      totalBranches: await Branch.count(),
      usersWithClientId: await User.count({ where: { clientId: { [db.Sequelize.Op.ne]: null } } }),
      usersWithBranchId: await User.count({ where: { branchId: { [db.Sequelize.Op.ne]: null } } })
    };

    results.steps.push({
      step: 4,
      name: "Verifica finale",
      status: "completed",
      details: finalStats
    });

    results.status = "success";
    results.message = "Migrazione completata con successo!";

    console.log("✅ Migrazione completata!");
    res.status(200).json(results);

  } catch (error) {
    console.error("❌ Errore durante la migrazione:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Endpoint per cambiare massivamente clientId o branchId
exports.bulkUpdateClientBranch = async (req, res) => {
  try {
    const { type, fromId, toId } = req.body;

    // Validazione input
    if (!type || !['client', 'branch'].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Il campo 'type' deve essere 'client' o 'branch'"
      });
    }

    if (!fromId || !toId) {
      return res.status(400).json({
        status: "error",
        message: "I campi 'fromId' e 'toId' sono obbligatori"
      });
    }

    const results = {
      timestamp: new Date().toISOString(),
      type: type,
      fromId: parseInt(fromId),
      toId: parseInt(toId)
    };

    if (type === 'client') {
      // Verifica che i client esistano
      const fromClient = await Client.findByPk(fromId);
      const toClient = await Client.findByPk(toId);

      if (!fromClient) {
        return res.status(404).json({
          status: "error",
          message: `Client con ID ${fromId} non trovato`
        });
      }

      if (!toClient) {
        return res.status(404).json({
          status: "error",
          message: `Client con ID ${toId} non trovato`
        });
      }

      // Conta utenti prima dell'aggiornamento
      const usersCount = await User.count({ where: { clientId: fromId } });

      // Aggiorna tutti gli utenti
      await User.update(
        { clientId: toId },
        { where: { clientId: fromId } }
      );

      results.status = "success";
      results.message = `Aggiornati ${usersCount} utenti da clientId ${fromId} a ${toId}`;
      results.fromName = fromClient.name;
      results.toName = toClient.name;
      results.updatedUsers = usersCount;

    } else if (type === 'branch') {
      // Verifica che i branch esistano
      const fromBranch = await Branch.findByPk(fromId);
      const toBranch = await Branch.findByPk(toId);

      if (!fromBranch) {
        return res.status(404).json({
          status: "error",
          message: `Branch con ID ${fromId} non trovato`
        });
      }

      if (!toBranch) {
        return res.status(404).json({
          status: "error",
          message: `Branch con ID ${toId} non trovato`
        });
      }

      // Conta utenti prima dell'aggiornamento
      const usersCount = await User.count({ where: { branchId: fromId } });

      // Aggiorna tutti gli utenti
      await User.update(
        { branchId: toId },
        { where: { branchId: fromId } }
      );

      results.status = "success";
      results.message = `Aggiornati ${usersCount} utenti da branchId ${fromId} a ${toId}`;
      results.fromName = fromBranch.name;
      results.toName = toBranch.name;
      results.updatedUsers = usersCount;
    }

    console.log(`✅ ${results.message}`);
    res.status(200).json(results);

  } catch (error) {
    console.error("❌ Errore durante l'aggiornamento massivo:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
