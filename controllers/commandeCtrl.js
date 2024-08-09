const { db } = require("./../config/db.js");
const dotenv = require('dotenv');

dotenv.config();

//Rapport commande

exports.RapportCommandeCountMoney = (req, res) => {
  const { start_date, end_date, searchValue } = req.query;

  const q = `
  SELECT
    (
      SELECT COUNT(DISTINCT commande.id_commande)
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS nbre_commande,
    (
      SELECT SUM(detail_commande.quantite)
      FROM commande
      INNER JOIN detail_commande ON commande.id_commande = detail_commande.id_commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS nbre_articles,
    (
      SELECT SUM(detail_commande.prix * detail_commande.quantite)
      FROM commande
      INNER JOIN detail_commande ON commande.id_commande = detail_commande.id_commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS montant_total,
    (
      SELECT COUNT(DISTINCT commande.id_commande)
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0 AND commande.id_livraison = 0
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS commande_Enattente,
    (
      SELECT COUNT(DISTINCT commande.id_commande)
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0 AND commande.id_livraison = 1
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS commande_Encours,
    (
      SELECT COUNT(DISTINCT commande.id_commande)
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      WHERE commande.est_supprime = 0 AND commande.id_livraison = 2
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
        ${start_date ? `AND DATE(commande.date_commande) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(commande.date_commande) <= '${end_date}'` : ''}
    ) AS commande_livre
`;

  db.query(q, (error, data) => {
    if (error) {
      console.error('Une erreur s\'est produite lors de l\'exécution de la requête SQL :', error);
      return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.' });
    }
    const result = {
      nbre_commande: data[0].nbre_commande,
      nbre_articles: data[0].nbre_articles,
      montant_total: data[0].montant_total,
      commande_Enattente: data[0].commande_Enattente,
      commande_Encours: data[0].commande_Encours,
      commande_livre: data[0].commande_livre
    };
    return res.status(200).json(result);
  });
};

//demande commande
exports.getDemandeCommandeCount = (req, res) => {
    const q = "SELECT COUNT(*) AS total FROM demande_commande WHERE est_supprime = 0";
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data); 
  })
}

exports.getIdVariantProduit = (req, res) => {
  const idVariante = req.params.idCode;
  const idTaille = req.params.idTaille;

  const q = `SELECT id_varianteProduit,stock FROM varianteproduit WHERE code_variant = '${idVariante}' AND id_taille = ${idTaille}`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getDemandeCommande = (req, res) => {
    const q = `SELECT detail_commande.*, varianteproduit.img, taille.taille, users.username
                FROM detail_commande 
                INNER JOIN varianteproduit ON detail_commande.id_varianteProduit = varianteproduit.id_varianteProduit
                INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
                INNER JOIN users ON detail_commande.user_cr = users.id 
                WHERE detail_commande.est_supprime = 0 GROUP BY id_commande`;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}

exports.getDemandeCommandeAll = (req, res) => {
  const { id } = req.params;

  const q = `SELECT detail_commande.*, varianteproduit.img, taille.taille, users.username, adresse.avenue, adresse.quartier, adresse.num, adresse.ref,province.nom_province, commune.nom_commune
              FROM detail_commande 
                INNER JOIN varianteproduit ON detail_commande.id_varianteProduit = varianteproduit.id_varianteProduit
                INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
                INNER JOIN users ON detail_commande.user_cr = users.id
                INNER JOIN commande ON detail_commande.id_commande = commande.id_commande
                LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
                LEFT JOIN telephone ON commande.id_telephone = telephone.id_telephone
                LEFT JOIN province ON adresse.id_ville = province.id_province
                LEFT JOIN commune ON adresse.id_commune = commune.id_commune
            WHERE detail_commande.est_supprime = 0 AND detail_commande.id_commande = ?
  `;

  db.query(q, [id], (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

/* exports.postDemandeCommande = (req, res) => {
  const selectQuery = `
    SELECT id_commande, id_varianteProduit, id_client, prix, statut_demande, description, id_taille, quantite, user_cr
    FROM detail_commande
    WHERE id_varianteProduit = ? AND id_taille = ? AND id_commande = ?
  `;

  const insertQuery = `
    INSERT INTO detail_commande(id_commande, id_varianteProduit, id_client, prix, statut_demande, description, id_taille, quantite, user_cr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const updateQuery = `
  UPDATE detail_commande
  SET quantite = quantite + ?, prix = prix + ?
  WHERE id_varianteProduit = ? AND id_taille = ? AND id_commande = ?
`;
  const selectValues = [req.body.id_varianteProduit, req.body.id_taille, req.body.id_commande,];
  const insertValues = [
    req.body.id_commande,
    req.body.id_varianteProduit,
    req.body.id_client,
    req.body.prix,
    req.body.statut_demande,
    req.body.description,
    req.body.id_taille,
    req.body.quantite,
    req.body.user_cr
  ];

  const updateValues = [
    req.body.quantite,
    req.body.prix,
    req.body.id_varianteProduit,
    req.body.id_taille,
    req.body.id_commande,
  ];

  db.query(selectQuery, selectValues, (error, rows) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
      return;
    }

    if (rows.length === 0) {

      db.query(insertQuery, insertValues, (error, data) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
        } else {
          res.json('Processus réussi');
        }
      });
    } else {

      db.query(updateQuery, updateValues, (error, data) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
        } else {
          res.json('Processus réussi');
        }
      });
    }
  });
} */

exports.postDemandeCommande = (req, res) => {
  const selectQuery = `
    SELECT id_commande, id_varianteProduit, id_client, prix, statut_demande, description, id_taille, quantite, user_cr
    FROM detail_commande
    WHERE id_varianteProduit = ? AND id_taille = ? AND id_commande = ?
  `;

  const insertQuery = `
    INSERT INTO detail_commande(id_commande, id_varianteProduit, id_client, prix, statut_demande, description, id_taille, quantite, user_cr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const selectValues = [req.body.id_varianteProduit, req.body.id_taille, req.body.id_commande];
  const insertValues = [
    req.body.id_commande,
    req.body.id_varianteProduit,
    req.body.id_client,
    req.body.prix,
    req.body.statut_demande,
    req.body.description,
    req.body.id_taille,
    req.body.quantite,
    req.body.user_cr
  ];

  db.query(selectQuery, selectValues, (error, rows) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
      return;
    }

    if (rows.length > 0) {
      res.json('Une chaussure avec la même pointure existe déjà dans la commande');
    } else {
      db.query(insertQuery, insertValues, (error, data) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
        } else {
          res.json('Processus réussi');
        }
      });
    }
  });
};

exports.deleteDemandeCommande = (req, res) => {
    const {id} = req.params;

    const q = "DELETE FROM detail_commande WHERE id_detail = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
  };

//Commande
exports.getCommande = (req, res) => {
  const start_date = req.query.date_start;
  const end_date = req.query.date_end;

  let q = `SELECT commande.*, client.nom, statut.nom_statut, IFNULL(nbre_ventes.nbre_vente, 0) AS nbre_vente
            FROM commande
            INNER JOIN client ON commande.id_client = client.id
            INNER JOIN statut ON commande.statut = statut.id_statut
            LEFT JOIN (
                SELECT 
                	id_commande,
                	COUNT(id_commande) AS nbre_vente
                FROM
                	vente
                GROUP BY
        			id_commande
            	) AS nbre_ventes
             ON
             	commande.id_commande = nbre_ventes.id_commande
            WHERE commande.est_supprime = 0
          `;

  const params = [];

  if (start_date !== undefined && start_date !== '') {
    q += ` AND DATE(commande.date_commande) >= ?`;
    params.push(start_date);
  }

  if (end_date !== undefined && end_date !== '' && end_date !== 'undefined') {
    q += ` AND DATE(commande.date_commande) <= ?`;
    params.push(end_date);
  }

  q += ` ORDER BY commande.date_commande DESC`;

  db.query(q, params, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
  });
};


exports.getCommandeRapportFiltrer = (req, res) => {
  const filter = req.query.filter;

  let q = `SELECT commande.*, COUNT(id_commande) AS nbre, client.nom, statut.nom_statut
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN statut ON commande.statut = statut.id_statut
      WHERE commande.est_supprime = 0`;

        if (filter === 'today') {
          q += ` AND DATE(commande.date_commande) = CURDATE()`;
        } else if (filter === 'yesterday') {
          q += ` AND DATE(commande.date_commande) = CURDATE() - INTERVAL 1 DAY`;
        } else if (filter === 'last7days') {
          q += ` AND DATE(commande.date_commande) >= CURDATE() - INTERVAL 7 DAY`;
        } else if (filter === 'last30days') {
          q += ` AND DATE(commande.date_commande) >= CURDATE() - INTERVAL 30 DAY`;
        } else if (filter === 'last1year') {
          q += ` AND DATE(commande.date_commande) >= CURDATE() - INTERVAL 1 YEAR`;
        }

        q += `
        GROUP BY commande.id_commande
        ORDER BY commande.date_commande DESC;
        `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeEchange = (req, res) => {

  const q = `SELECT commande.*, client.nom, statut.nom_statut
              FROM commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN statut ON commande.statut = statut.id_statut
              INNER JOIN vente ON commande.id_commande = vente.id_commande
              WHERE commande.est_supprime = 0 AND commande.id_commande = vente.id_commande
            GROUP BY commande.id_commande
            ORDER BY date_commande DESC`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeCountJour = (req, res) => {

  const q = `SELECT commande.*, COUNT(id_commande) AS nbre, client.nom, statut.nom_statut
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN statut ON commande.statut = statut.id_statut
      WHERE commande.est_supprime = 0
        AND DATE(commande.date_commande) = CURDATE()`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeCount7Jour = (req, res) => {

  const q = `SELECT commande.*, COUNT(id_commande) AS nbre, client.nom, statut.nom_statut
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN statut ON commande.statut = statut.id_statut
      WHERE commande.est_supprime = 0
        AND DATE(commande.date_commande) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeJour = (req, res) => {

  const q = `SELECT commande.*, COUNT(id_commande) AS nbre, client.nom, statut.nom_statut
      FROM commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN statut ON commande.statut = statut.id_statut
      WHERE commande.est_supprime = 0
        AND DATE(commande.date_commande) = CURDATE()`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeHier = (req, res) => {

  const q = `SELECT commande.*, client.nom, statut.nom_statut, COUNT(commande.id_commande) AS nbre
              FROM commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN statut ON commande.statut = statut.id_statut
              WHERE commande.est_supprime = 0
                AND DATE(commande.date_commande) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
              ORDER BY commande.date_commande DESC;`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommande7jrs = (req, res) => {

  const q = `SELECT commande.*, client.nom, statut.nom_statut
  FROM commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN statut ON commande.statut = statut.id_statut
  WHERE commande.est_supprime = 0
    AND commande.date_commande >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  ORDER BY commande.date_commande DESC`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommande30Jours = (req, res) => {

  const q = `SELECT commande.*, client.nom, statut.nom_statut, COUNT(commande.id_commande) AS nbre
              FROM commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN statut ON commande.statut = statut.id_statut
              WHERE commande.est_supprime = 0
                AND DATE(commande.date_commande) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              ORDER BY commande.date_commande DESC;`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommande1an = (req, res) => {

  const q = `SELECT commande.*, client.nom, statut.nom_statut, COUNT(commande.id_commande) AS nbre
              FROM commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN statut ON commande.statut = statut.id_statut
              WHERE commande.est_supprime = 0
                AND DATE(commande.date_commande) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
              ORDER BY commande.date_commande DESC;`;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeOne = (req, res) => {
  const {id} = req.params;

  const q = `SELECT commande.id_commande, commande.id_shop, client.id,client.nom, adresse.avenue, adresse.quartier, adresse.avenue, adresse.ref, adresse.num AS num, province.nom_province, commune.nom_commune, telephone.numero AS telephone
              FROM commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
              INNER JOIN statut ON commande.statut = statut.id_statut
              LEFT JOIN telephone ON commande.id_telephone = telephone.id_telephone
              LEFT JOIN province ON adresse.id_ville = province.id_province
              INNER JOIN commune ON adresse.id_commune = commune.id_commune
              WHERE commande.est_supprime = 0 AND commande.id_commande = ?`;
   
  db.query(q,id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCommandeCount = (req, res) => {
    const q = "SELECT COUNT(*) AS total FROM commande WHERE est_supprime = 0";
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
}

/* exports.postCommande = (req, res) => {
    const q = 'INSERT INTO commande(`id_client`, `statut`, `id_livraison`, `id_paiement`, `user_cr`, `id_shop`, `paye`,`id_adresse`,`id_telephone`, `retour`) VALUES(?,?,?,?,?,?,?,?,?,?)';
    const paye = req.body.paye !== undefined ? req.body.paye : 0;
    const values = [
        req.body.id_client,
        req.body.statut || 2,
        req.body.id_livraison || 0,
        req.body.id_paiement || 0,
        req.body.user_cr || 0,
        req.body.id_shop || 1,
        paye,
        req.body.id_adresse,
        req.body.id_telephone,
        req.body.retour 
    ]
    db.query(q, values, (error, data) => {
      if (error) {
        res.status(500).json(error);
        console.log(error);
      } else {
        res.json('Processus réussi');
      }
    });
  }; */


exports.postCommande = (req, res) => {

    const checkQuery = `
        SELECT * FROM commande 
        WHERE id_client = ? AND statut = ? AND id_livraison = ? 
        AND id_paiement = ? AND id_shop = ? 
        AND id_adresse = ? AND id_telephone = ? AND retour = ?`;

    const insertQuery = `
        INSERT INTO commande(id_client, statut, id_livraison, id_paiement, user_cr, id_shop, paye, id_adresse, id_telephone, retour) 
        VALUES(?,?,?,?,?,?,?,?,?,?)`;

    const paye = req.body.paye !== undefined ? req.body.paye : 0;

    const values = [
        req.body.id_client,
        req.body.statut || 2,
        req.body.id_livraison || 0,
        req.body.id_paiement || 0,
        req.body.user_cr || 0,
        req.body.id_shop || 1,
        req.body.id_adresse,
        req.body.id_telephone,
        req.body.retour
    ];

    const checkValues = [
        req.body.id_client,
        req.body.statut || 2,
        req.body.id_livraison || 0,
        req.body.id_paiement || 0,
        req.body.id_shop || 1,
        req.body.id_adresse,
        req.body.id_telephone,
        req.body.retour
    ];

    db.query(checkQuery, checkValues, (error, results) => {
        if (error) {
            res.status(500).json(error);
            console.log(error);
        } else if (results.length > 0) {
            res.status(400).json({ message: 'Commande déjà existante' });
        } else {
            // Insertion de la nouvelle commande si elle n'existe pas déjà
            db.query(insertQuery, [...values, paye], (error, data) => {
                if (error) {
                    res.status(500).json(error);
                    console.log(error);
                } else {
                    res.json('Processus réussi');
                }
            });
        }
    });
};

exports.putCommande = (req, res) => {
    const { id } = req.params;

    const q = "UPDATE commande SET `id_client` = ?, `statut` = ?, `id_livraison` = ?, `id_paiement` = ?, `user_cr` = ?, `id_shop` = ?, `paye` = ?, `retour` = ? WHERE id_commande = ?";
    const values = [
      req.body.id_client,
      req.body.statut,
      req.body.id_livraison || 0,
      req.body.id_paiement || 0,
      req.body.user_cr || 0,
      req.body.id_shop || 1,
      req.body.paye || 0,
      req.body.retour,
      id
    ];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error(err);
        console.log(err)
        return res.status(500).json(err);
      }
      return res.json(data);
    });
  };

exports.deleteCommande = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM commande WHERE id_commande = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
  }

//Status
exports.getStatus = (req, res) => {
    const q = `SELECT * FROM statut`;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
  }