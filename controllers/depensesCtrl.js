const { db } = require("./../config/db.js");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

//Categorie
exports.getCatDepense = (req, res) => {
    const q = `SELECT * FROM categorie_depense`;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}

exports.postCatDepense = (req, res) => {
    const q = 'INSERT INTO categorie_depense(`nom`, `description`) VALUES(?,?)';
  
    const values = [
        req.body.nom,
        req.body.description
    ]

    db.query(q, values, (error, data) => {
      if (error) {
        res.status(500).json(error);
        console.log(error);
      } else {
        res.json('Processus réussi');
      }
    });
}

exports.deleteCatDepense = (req, res) => {
    const clientId = req.params.id;
    const q = "DELETE categorie_depense WHERE id_catDepense = ?";
  
    db.query(q, [clientId], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });

}

//Depenses
/* exports.getDepense = (req, res) => {
    const q = `SELECT CASE DAYOFWEEK(depenses.date_depense)
                WHEN 1 THEN 'dimanche'
                WHEN 2 THEN 'lundi'
                WHEN 3 THEN 'mardi'
                WHEN 4 THEN 'mercredi'
                WHEN 5 THEN 'jeudi'
                WHEN 6 THEN 'vendredi'
                WHEN 7 THEN 'samedi'
              END AS jour,
              DATE(depenses.date_depense) AS date_depense,
                  SUM(depenses.montant) AS montant_total_dollars,
                  SUM(depenses.montant_franc) AS montant_total_francs,
              CASE
                  WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                  ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS montant_total_combine, users.username AS createur
              FROM depenses
                INNER JOIN users ON depenses.user_cr = users.id
                INNER JOIN categorie_depense ON depenses.id_catDepense = categorie_depense.id_catDepense
                GROUP BY DATE(depenses.date_depense)
                `;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
} */


exports.getDepense = (req, res) => {
  const q = `
      SELECT CASE DAYOFWEEK(DATE(depenses.date_depense))
          WHEN 1 THEN 'dimanche'
          WHEN 2 THEN 'lundi'
          WHEN 3 THEN 'mardi'
          WHEN 4 THEN 'mercredi'
          WHEN 5 THEN 'jeudi'
          WHEN 6 THEN 'vendredi'
          WHEN 7 THEN 'samedi'
      END AS jour,
      DATE_FORMAT(CONVERT_TZ(depenses.date_depense, '+00:00', @@session.time_zone), '%Y-%m-%d') AS date_depense,
      SUM(depenses.montant) AS montant_total_dollars,
      SUM(depenses.montant_franc) AS montant_total_francs,
      CASE
          WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
          ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
      END AS montant_total_combine, 
      users.username AS createur
      FROM depenses
      INNER JOIN users ON depenses.user_cr = users.id
      INNER JOIN categorie_depense ON depenses.id_catDepense = categorie_depense.id_catDepense
      GROUP BY DATE(depenses.date_depense)
  `;

  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
};


exports.getDepenseDate = (req, res) => {
  const { dateId } = req.query;

  const q = `SELECT depenses.*, users.username, categorie_depense.nom AS nom_categorie FROM depenses
              INNER JOIN users ON depenses.id_livreur = users.id
              INNER JOIN categorie_depense ON depenses.id_catDepense = categorie_depense.id_catDepense
            WHERE DATE(depenses.date_depense) = '${dateId}'
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepenseJour = (req, res) => {

  const q = `SELECT 
              CASE
                  WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                  ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS total_depense
              FROM depenses
                WHERE DATE(depenses.date_depense) = CURDATE()
              GROUP BY DATE(depenses.date_depense)
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepenseHier = (req, res) => {

  const q = `SELECT 
              CASE
                  WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                  ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS total_depense
              FROM depenses
                WHERE DATE(depenses.date_depense) =  DATE_SUB(CURDATE(), INTERVAL 1 DAY)
              GROUP BY DATE(depenses.date_depense)
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepense7jours = (req, res) => {

  const q = `SELECT 
              CASE
                WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS total_depense
              FROM depenses
                WHERE DATE(depenses.date_depense) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              GROUP BY DATE(depenses.date_depense)
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepense30jours = (req, res) => {

  const q = `SELECT 
              CASE
                WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS total_depense
              FROM depenses
                WHERE DATE(depenses.date_depense) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              GROUP BY DATE(depenses.date_depense)
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepense1an = (req, res) => {

  const q = `SELECT 
            CASE
                WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
            END AS total_depense
            FROM depenses
              WHERE DATE(depenses.date_depense) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            GROUP BY DATE(depenses.date_depense)
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDepenseRapportGlobal = (req, res) => {

  const q = `SELECT 
              MIN(depenses.date_depense) AS date_plus_ancienne,
              MAX(depenses.date_depense) AS date_plus_recente,
              CASE
                WHEN SUM(depenses.montant) IS NOT NULL THEN ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
                ELSE ROUND(SUM(depenses.montant_franc * 0.00036364), 2)
              END AS total_depense
              FROM depenses
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postDepense = (req, res) => {
    const q = 'INSERT INTO depenses(`id_livreur`, `id_catDepense`, `date_depense`, `montant`, `montant_franc`, `description`,`user_cr`) VALUES(?,?,?,?,?,?,?)';
    const values = [
        req.body.id_livreur,
        req.body.id_catDepense,
        req.body.date_depense,
        req.body.montant,
        req.body.montant_franc,
        req.body.description,
        req.body.user_cr
    ]

    db.query(q, values, (error, data) => {
      if (error) {
        res.status(500).json(error);
        console.log(error);
      } else {
        res.json('Processus réussi');
      }
    });
}

exports.deleteDepense = (req, res) => {
    const Id = req.params.id;
    const q = "DELETE depenses WHERE id_depense = ?";
  
    db.query(q, [Id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    }); 

}

/* exports.depenseTotal = (req, res) => {

    const q = `SELECT SUM(montant) AS total_depense FROM depenses
   
            `;
  
      db.query(q ,(error, data)=>{
        if(error) res.status(500).send(error)
    
        return res.status(200).json(data);
      })
} */

exports.depenseTotal = (req, res) => {
  const { start_date, end_date, filter, year } = req.query;
      
        let q = `SELECT SUM(montant) AS total_depense
                 FROM depenses
                 WHERE est_supprime = 0`;
        if (start_date) {
          q += ` AND DATE(depenses.date_depense) >= '${start_date}'`;
        }
        if (end_date) {
          q += ` AND DATE(depenses.date_depense) <= '${end_date}'`;
        }
        if (filter === 'today') {
          q += ` AND DATE(depenses.date_depense) = CURDATE()`;
        } else if (filter === 'yesterday') {
          q += ` AND DATE(depenses.date_depense) = CURDATE() - INTERVAL 1 DAY`;
        } else if (filter === 'last7days') {
          q += ` AND DATE(depenses.date_depense) >= CURDATE() - INTERVAL 7 DAY`;
        } else if (filter === 'last30days') {
          q += ` AND DATE(depenses.date_depense) >= CURDATE() - INTERVAL 30 DAY`;
        } else if (filter === 'last1year') {
          q += ` AND DATE(depenses.date_depense) >= CURDATE() - INTERVAL 1 YEAR`;
        } else if (filter === 'year' && year) {
          q += ` AND YEAR(depenses.date_depense) = ${db.escape(year)}`;
        }
      
        db.query(q, (error, data) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
          }
      
          return res.status(200).json(data);
        });
      };
      

//caisse
exports.caisseVenteCount = (req, res) => {
  const { start_date, end_date } = req.query;

    const q = `SELECT COUNT(*) AS total FROM vente 
                WHERE vente.est_supprime = 0
               ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
               ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}`
                
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.caisseCommandeCount = (req, res) => {
  const { start_date, end_date } = req.query;

    const q = `SELECT commande.*, COUNT(id_commande) AS nbre, client.nom, statut.nom_statut
        FROM commande
        INNER JOIN client ON commande.id_client = client.id
        INNER JOIN statut ON commande.statut = statut.id_statut
        WHERE commande.est_supprime = 0
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}`;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
  }

exports.caisseLivraisonNbreDuJours = (req, res)=>{
  const { start_date, end_date } = req.query;
    const q = `SELECT COUNT(DISTINCT client.id) AS nbre_livraison
                  FROM detail_livraison
                  INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
                  INNER JOIN client ON commande.id_client = client.id
                  WHERE commande.est_supprime = 0
                ${start_date ? `AND DATE(detail_livraison.date_creation) >= '${start_date}'` : ''}
                ${end_date ? `AND DATE(detail_livraison.date_creation) <= '${end_date}'` : ''}`
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
  }


exports.caisseClientCount = (req, res) => {
    const { start_date, end_date } = req.query;
    const q = `
      SELECT COUNT(*) AS total
      FROM client 
      WHERE est_supprime = 0
        ${start_date !== undefined && start_date !== '' ? `AND DATE(client.created_at) >= '${start_date}'` : ''}
        ${end_date !== undefined && end_date !== '' && end_date !== 'undefined' ? `AND DATE(client.created_at) <= '${end_date}'` : ''}
    `;
  
    db.query(q, (error, data) => {
      if (error) {
        console.error('Une erreur s\'est produite lors de l\'exécution de la requête SQL :', error);
        return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.' });
      }
      return res.status(200).json(data[0].total);
    });
  };
  
exports.caisseMouvementCountJour = (req, res) => {
    const { start_date, end_date } = req.query;
  
    const q = `
      SELECT
        COUNT(id_mouvement) AS nbre_mouvement_encours,
        (
          SELECT COUNT(id_mouvement)
          FROM mouvement_stock
          WHERE
            ${start_date ? `DATE(date_mouvement) >= '${start_date}' AND` : ''}
            ${end_date ? `DATE(date_mouvement) <= '${end_date}' AND` : ''}
            id_type_mouvement = 4
        ) AS nbre_mouvement_vente
      FROM mouvement_stock
      WHERE
        ${start_date ? `DATE(date_mouvement) >= '${start_date}' AND` : ''}
        ${end_date ? `DATE(date_mouvement) <= '${end_date}' AND` : ''}
        id_type_mouvement = 12
    `;
  
    db.query(q, (error, data) => {
      if (error) {
        console.error('Une erreur s\'est produite lors de l\'exécution de la requête SQL :', error);
        return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.' });
      }
      return res.status(200).json(data);
    });
  };


exports.caisseDetteRapportNbreJour = (req, res) => {
  const { start_date, end_date } = req.query;

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE ${start_date ? `DATE(dette.created_at) >= '${start_date}'` : ''}
            ${end_date ? `AND DATE(dette.created_at) <= '${end_date}'` : ''}`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.caissePaiementJourMontant = (req, res) => {
  const { start_date, end_date } = req.query;
  const q = `
    SELECT SUM(paiement.montant) AS montant_total
    FROM paiement
    WHERE 
      ${start_date ? `DATE(paiement.created_at) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(paiement.created_at) <= '${end_date}'` : ''}
  `;

  db.query(q, (error, data) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de l\'exécution de la requête SQL :', error);
      return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.' });
    }
    return res.status(200).json(data);
  });
};


exports.caisseDepenseTotalCount = (req, res) => {
  const {start_date, end_date} = req.query;

  const q = `SELECT SUM(montant) AS total_depense FROM depenses
  est_supprime = 0
  ${start_date ? `AND DATE(depenses.date_depense) >= '${start_date}'` : ''}
  ${end_date ? `AND DATE(depenses.date_depense) <= '${end_date}'` : ''} 
          `;

    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
    })
}