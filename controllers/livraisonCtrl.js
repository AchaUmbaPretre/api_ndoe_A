const { db } = require("./../config/db.js");
const dotenv = require('dotenv');

dotenv.config();

exports.getLivraison = (req, res)=>{
    const q = `SELECT livraison.*, users.username FROM livraison
                  INNER JOIN users ON livraison.user_cr = users.id
              `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getLivraisonNbreDuJours = (req, res)=>{
  const q = `SELECT COUNT(DISTINCT client.id) AS nbre_livraison
                FROM detail_livraison
                INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
                INNER JOIN client ON commande.id_client = client.id
                WHERE DATE(detail_livraison.date_creation) = CURDATE();
            `;
 
db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonNbreDHier = (req, res)=>{

  const q = `SELECT COUNT(DISTINCT detail_livraison.id_commande) AS nbre_livraison
              FROM detail_livraison
            INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
            INNER JOIN client ON commande.id_client = client.id
              WHERE DATE(date_creation) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            `;
 
db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonNbreDuJour7 = (req, res)=>{
  const q = `SELECT COUNT(DISTINCT detail_livraison.id_commande) AS nbre_livraison
              FROM detail_livraison
              INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
              INNER JOIN client ON commande.id_client = client.id
              WHERE DATE(date_creation) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
            `;
 
db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonNbreDuJour30 = (req, res)=>{
  const q = `SELECT COUNT(DISTINCT detail_livraison.id_commande) AS nbre_livraison
              FROM detail_livraison
              INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
              INNER JOIN client ON commande.id_client = client.id
              WHERE DATE(date_creation) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
            `;
 
db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonNbreDuJour1an = (req, res)=>{
  const q = `SELECT COUNT(DISTINCT detail_livraison.id_commande) AS nbre_livraison
              FROM detail_livraison
              INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
              INNER JOIN client ON commande.id_client = client.id
              WHERE DATE(detail_livraison.date_creation)  >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
            `;
 
db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonOne = (req, res)=>{
    const {id} = req.params;
    const q = `SELECT * FROM livraison WHERE id_livraison = ?`;
   
  db.query(q,id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postLivraison = (req, res) => {
    const q = 'INSERT INTO livraison(`date_livre`, `user_cr`) VALUES(?,?)';
    const values = [
        req.body.date_livre,
        req.body.user_cr,
    ]
    db.query(q, values, (error, data) => {
      console.log(error)
      if (error) {
        res.status(500).json(error);
        console.log(error);
      } else {
        res.json('Processus réussi');
      }
    });
  };

exports.deleteLivraison = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM livraison WHERE id_livraison = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
}

//Detail livraison
/* exports.getLivraisonDetail = (req, res) => {
  const { start_date, end_date, } = req.query;

  let q = `
    SELECT 
      SUM(detail_livraison.qte_commande) AS quant,
      detail_livraison.*,
      varianteproduit.img,
      client.nom AS nom_client,
      client.id AS id_client,
      client.telephone,
      marque.nom AS nom_marque,
      users.username AS nom_livreur,
      taille.taille AS pointure,
      SUM(detail_livraison.qte_livre) AS total_produit,
      commande.id_shop,
      commune.nom_commune
    FROM detail_livraison
    INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
    INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
    INNER JOIN client ON commande.id_client = client.id
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN users ON detail_livraison.id_livreur = users.id
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
    LEFT JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE produit.est_supprime = 0
  `;

  const params = [];
  if (start_date && start_date !== 'null') {
    q += ` AND DATE(detail_livraison.date_creation) >= ?`;
    params.push(start_date);
  }

  if (end_date && end_date !== 'null') {
    q += ` AND DATE(detail_livraison.date_creation) <= ?`;
    params.push(end_date);
  }

  q += ` GROUP BY commande.id_commande ORDER BY detail_livraison.date_creation DESC`;

  db.query(q, params, (error, data) => {
    if (error) {
      console.error('Erreur SQL :', error); 
      return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.', details: error });
    }
    return res.status(200).json(data);
  });
};
 */

exports.getLivraisonDetail = (req, res) => {
  const { start_date, end_date, page = 1, pageSize = 15 } = req.query;
  const offset = (page - 1) * pageSize;

  console.log(page, pageSize)

  const totalQuery = `
    SELECT 
      COUNT(DISTINCT detail_livraison.id_detail_livraison) AS total
    FROM detail_livraison
    LEFT JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
    LEFT JOIN commande ON detail_livraison.id_commande = commande.id_commande
    LEFT JOIN client ON commande.id_client = client.id
    LEFT JOIN produit ON varianteproduit.id_produit = produit.id_produit
    LEFT JOIN marque ON produit.id_marque = marque.id_marque
    LEFT JOIN users ON detail_livraison.id_livreur = users.id
    LEFT JOIN taille ON varianteproduit.id_taille = taille.id_taille
    LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
    LEFT JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE produit.est_supprime = 0
  `;

  let q = `
    SELECT 
      SUM(detail_livraison.qte_commande) AS quant,
      detail_livraison.*,
      varianteproduit.img,
      client.nom AS nom_client,
      client.id AS id_client,
      client.telephone,
      marque.nom AS nom_marque,
      users.username AS nom_livreur,
      taille.taille AS pointure,
      SUM(detail_livraison.qte_livre) AS total_produit,
      commande.id_shop,
      commune.nom_commune
    FROM detail_livraison
    INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
    INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
    INNER JOIN client ON commande.id_client = client.id
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN users ON detail_livraison.id_livreur = users.id
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
    LEFT JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE produit.est_supprime = 0
  `;

  const params = [];
  const totalParams = [];

  if (start_date && start_date !== 'null') {
    q += ` AND DATE(detail_livraison.date_creation) >= ?`;
    totalQuery += ` AND DATE(detail_livraison.date_creation) >= ?`;
    params.push(start_date);
    totalParams.push(start_date);
  }

  if (end_date && end_date !== 'null') {
    q += ` AND DATE(detail_livraison.date_creation) <= ?`;
    totalQuery += ` AND DATE(detail_livraison.date_creation) <= ?`;
    params.push(end_date);
    totalParams.push(end_date);
  }

  q += `
    GROUP BY commande.id_commande
    ORDER BY detail_livraison.date_creation DESC
    LIMIT ? OFFSET ?
  `;
  params.push(parseInt(pageSize), parseInt(offset));

  db.query(totalQuery, totalParams, (error, totalResult) => {
    if (error) {
      console.error('Erreur SQL (Total) :', error);
      return res.status(500).json({ error: 'Erreur du serveur lors de la récupération du total des éléments.', details: error });
    }

    const totalItems = totalResult[0]?.total || 0;

    db.query(q, params, (error, data) => {
      if (error) {
        console.error('Erreur SQL (Données) :', error);
        return res.status(500).json({ error: 'Erreur du serveur lors de la récupération des données.', details: error });
      }

      return res.status(200).json({
        data,
        total: totalItems,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      });
    });
  });
};

exports.getLivraisonDetailRapportFiltrer = (req, res)=>{
  const filter = req.query.filter;

  let q = `SELECT SUM(detail_livraison.qte_commande) AS quant, detail_livraison.*,varianteproduit.img, client.nom AS nom_client, client.id AS id_client, client.telephone, marque.nom AS nom_marque, users.username AS nom_livreur, taille.taille AS pointure, SUM(detail_livraison.qte_livre) AS total_produit, commande.id_shop, commune.nom_commune FROM detail_livraison
  INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
  INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN users ON detail_livraison.id_livreur  = users.id
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
  LEFT JOIN commune ON adresse.id_commune = commune.id_commune
  WHERE produit.est_supprime = 0
              `;
    if (filter === 'today') {
      q += ` AND DATE(detail_livraison.date_creation) = CURDATE()`;
    } else if (filter === 'yesterday') {
      q += ` AND DATE(detail_livraison.date_creation) = CURDATE() - INTERVAL 1 DAY`;
    } else if (filter === 'last7days') {
      q += ` AND DATE(detail_livraison.date_creation) >= CURDATE() - INTERVAL 7 DAY`;
    } else if (filter === 'last30days') {
      q += ` AND DATE(detail_livraison.date_creation) >= CURDATE() - INTERVAL 30 DAY`;
    } else if (filter === 'last1year') {
      q += ` AND DATE(detail_livraison.date_creation) >= CURDATE() - INTERVAL 1 YEAR`;
    }

    q += `
        GROUP BY commande.id_commande
        ORDER BY detail_livraison.date_creation DESC
        `;
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getLivraisonDetailJour = (req, res)=>{

  const q = `SELECT SUM(detail_livraison.qte_commande) AS quant, detail_livraison.*,varianteproduit.img, client.nom AS nom_client, client.id AS id_client, client.telephone, marque.nom AS nom_marque, users.username AS nom_livreur, taille.taille AS pointure, SUM(detail_livraison.qte_livre) AS total_produit, commande.id_shop, commune.nom_commune FROM detail_livraison
  INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
  INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN users ON detail_livraison.id_livreur  = users.id
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
  INNER JOIN commune ON adresse.id_commune = commune.id_commune
  WHERE produit.est_supprime = 0
    AND DATE(detail_livraison.date_creation) = CURDATE()
  GROUP BY commande.id_commande
  ORDER BY detail_livraison.date_creation DESC
              `;
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getLivraisonNbreJour = (req, res)=>{

  const q = `SELECT detail_livraison.*,varianteproduit.img, client.nom AS nom_client, client.id AS id_client, client.telephone, marque.nom AS nom_marque, users.username AS nom_livreur, taille.taille AS pointure, SUM(detail_livraison.qte_livre) AS total_produit, commande.id_shop FROM detail_livraison
              INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
              INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
              INNER JOIN client ON commande.id_client = client.id
              INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
              INNER JOIN marque ON produit.id_marque = marque.id_marque
              INNER JOIN users ON detail_livraison.id_livreur  = users.id
              INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
              WHERE produit.est_supprime = 0
                AND DATE(detail_livraison.date_creation) = CURDATE()
              ORDER BY detail_livraison.date_creation DESC
              `;
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getLivraisonDetailOne = (req, res)=>{
    const {id} = req.params;
    const q = `
          SELECT detail_livraison.*,varianteproduit.img, client.nom AS nom_client, marque.nom AS nom_marque, users.username AS nom_livreur, taille.taille AS pointure, u.username AS modifier FROM detail_livraison
            INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
            INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
            INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
            INNER JOIN marque ON produit.id_marque = marque.id_marque
            INNER JOIN users ON detail_livraison.id_livreur  = users.id
            INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
            LEFT JOIN users u ON detail_livraison.userUpdate = u.id
          WHERE commande.id_commande = ?`;
   
  db.query(q,id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

/* exports.postLivraisonDetail = (req, res) => {
  const getIdCommandeQuery = 'SELECT prix, quantite FROM detail_commande WHERE id_varianteProduit = ?';
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qInsertMouvement = 'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`, `id_commande`,`id_fournisseur`, `description`) VALUES(?,?,?,?,?,?,?,?)';

  const valuesMouv = [
    req.body.id_varianteProduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_user_cr,
    req.body.id_client,
    req.body.id_commande,
    req.body.id_fournisseur,
    req.body.description
]
  
  const idVarianteProduit = req.body.id_varianteProduit;
  const quantiteLivre = req.body.qte_livre;

  const checkDuplicateQuery = `
  SELECT COUNT(*) as countLivraison
  FROM detail_livraison
  WHERE id_varianteProduit = ? AND id_commande = ?
`;
db.query(checkDuplicateQuery, [req.body.id_varianteProduit, req.body.id_commande], (error, rows) =>{
  if (error) {
    res.status(500).json(error);
    console.log(error);
    return;
  }
  const countLivraison = rows[0].countLivraison;
  if (countLivraison > 0) {
    res.json('Une livraison pour cette variante de produit et cette commande existe déjà.');
  } else{
    db.query(qStockeTaille,[idVarianteProduit],(error, stockTailleData) =>{
      if (error){
        res.status(500).json(error);
        console.log(error);
      }else{
        const stockTailleActuel = stockTailleData[0].stock

        let newStockTaille;

        if (parseInt(req.body.id_type_mouvement) === 13) {
          newStockTaille = stockTailleActuel
        }      
        else if (parseInt(req.body.id_type_mouvement) === 12) {
          newStockTaille = stockTailleActuel - parseInt(req.body.quantite);
          if (newStockTaille > stockTailleActuel) {
            res.status(400).json({ error: 'Quantité de stock insuffisante ou taille invalide.' });
            return;
          }
          if (newStockTaille < 0) {
            res.status(400).json({ error: 'Quantité de stock insuffisante.' });
            return;
          }
        } 
        else{
          newStockTaille = stockTailleActuel
        }

        db.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) =>{
          if(error){
            res.status(500).json(error)
            console.log(error)
          } else{
            db.query(qInsertMouvement, valuesMouv, (error, mouvementData) => {
              if (error) {
                res.status(500).json(error);
                console.log(error);
              } else{
                db.query(getIdCommandeQuery, [idVarianteProduit], (error, results) =>{
                  if(error){
                    res.status(500).json(error);
                    console.log(error);
                  }
                  else{
                    if(results.length > 0) {
                      const prixUnitaire = results[0].prix;
                      const quantiteCommande = results[0].quantite;
                      const prixTotal = (prixUnitaire / quantiteCommande) * quantiteLivre;
              
                      const insertQuery = 'INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package,	id_livreur, id_detail_commande, user_cr) VALUES (?,?,?,?,?,?,?,?,?,?,?)';

                      const values = [
                        req.body.id_commande,
                        req.body.quantite_prix,
                        idVarianteProduit,
                        quantiteLivre,
                        req.body.qte_commande,
                        prixTotal,
                        req.body.package,
                        req.body.id_package,
                        req.body.id_livreur,
                        req.body.id_detail_commande,
                        req.body.user_cr
                      ];

                      db.query(insertQuery, values, (insertError, insertData) => {
                        if (insertError) {
                          res.status(500).json(insertError);
                          console.log(insertError);
                        }
                        else {
                          res.json('Processus réussi');
                        }
                      });
                    } else {
                      res.status(404).json('Prix ou quantité non trouvés pour l\'id_varianteProduit spécifié');
                    }
                  }
                })
              }
            })
          }
        })  
      }
    })
  }
})
};*/


/* exports.postLivraisonDetail = (req, res) => {
  const getIdCommandeQuery = 'SELECT prix, quantite FROM detail_commande WHERE id_varianteProduit = ?';
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qInsertMouvement = 'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`, `id_commande`,`id_fournisseur`, `description`) VALUES(?,?,?,?,?,?,?,?)';

  const valuesMouv = [
    req.body.id_varianteProduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_user_cr,
    req.body.id_client,
    req.body.id_commande,
    req.body.id_fournisseur,
    req.body.description
  ]

  const idVarianteProduit = req.body.id_varianteProduit;
  const quantiteLivre = req.body.qte_livre;

  const checkDuplicateQuery = `
    SELECT COUNT(*) as countLivraison
    FROM detail_livraison
    WHERE id_varianteProduit = ? AND id_commande = ?
  `;
  db.query(checkDuplicateQuery, [req.body.id_varianteProduit, req.body.id_commande], (error, rows) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
      return;
    }
    const countLivraison = rows[0].countLivraison;
    if (countLivraison > 0) {
      res.json('Une livraison pour cette variante de produit et cette commande existe déjà.');
    } else {
      // Vérification des doublons dans la table mouvement_stock
      const checkDuplicateMouvementQuery = `
        SELECT COUNT(*) as countMouvement
        FROM mouvement_stock
        WHERE id_varianteProduit = ? AND id_commande = ?
      `;

      db.query(checkDuplicateMouvementQuery, [req.body.id_varianteProduit, req.body.id_commande], (error, mouvementRows) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
          return;
        }
        const countMouvement = mouvementRows[0].countMouvement;
        if (countMouvement > 0) {
          res.json('Un mouvement pour cette variante de produit et cette commande existe déjà.');
        } else {
          db.query(qStockeTaille,[idVarianteProduit],(error, stockTailleData) => {
            if (error) {
              res.status(500).json(error);
              console.log(error);
            } else {
              const stockTailleActuel = stockTailleData[0].stock
              let newStockTaille;
              if (parseInt(req.body.id_type_mouvement) === 13) {
                newStockTaille = stockTailleActuel
              } else if (parseInt(req.body.id_type_mouvement) === 12) {
                newStockTaille = stockTailleActuel - parseInt(req.body.quantite);
                if (newStockTaille > stockTailleActuel) {
                  res.status(400).json({ error: 'Quantité de stock insuffisante ou taille invalide.' });
                  return;
                }
                if (newStockTaille < 0) {
                  res.status(400).json({ error: 'Quantité de stock insuffisante.' });
                  return;
                }
              } else {
                newStockTaille = stockTailleActuel
              }
              db.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) => {
                if (error) {
                  res.status(500).json(error)
                  console.log(error)
                } else {
                  db.query(qInsertMouvement, valuesMouv, (error, mouvementData) => {
                    if (error) {
                      res.status(500).json(error);
                      console.log(error);
                    } else {
                      db.query(getIdCommandeQuery, [idVarianteProduit], (error, results) => {
                        if (error) {
                          res.status(500).json(error);
                          console.log(error);
                        } else {
                          if (results.length > 0) {
                            const prixUnitaire = results[0].prix;
                            const quantiteCommande = results[0].quantite;
                            const prixTotal = (prixUnitaire / quantiteCommande) * quantiteLivre;
                            const insertQuery = 'INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package,	id_livreur, id_detail_commande, user_cr) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
                            const values = [
                              req.body.id_commande,
                              req.body.quantite_prix,
                              idVarianteProduit,
                              quantiteLivre,
                              req.body.qte_commande,
                              prixTotal,
                              req.body.package,
                              req.body.id_package,
                              req.body.id_livreur,
                              req.body.id_detail_commande,
                              req.body.user_cr
                            ];
                            db.query(insertQuery, values, (insertError, insertData) => {
                              if (insertError) {
                                res.status(500).json(insertError);
                                console.log(insertError);
                              } else {
                                res.json('Processus réussi');
                              }
                            });
                          } else {
                            res.status(404).json('Prix ou quantité non trouvés pour l\'id_varianteProduit spécifié');
                          }
                        }
                      })
                    }
                  })
                }
              })  
            }
          })
        }
      });
    }
  });
} */;

/* exports.postLivraisonDetail = (req, res) => {
  const getIdCommandeQuery = 'SELECT prix, quantite FROM detail_commande WHERE id_varianteProduit = ?';
  const qStockeTaille = 'SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?';
  const qUpdateStock = 'UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?';
  const qInsertMouvement = 'INSERT INTO mouvement_stock(id_varianteProduit, id_type_mouvement, quantite, id_user_cr, id_client, id_commande, id_fournisseur, description) VALUES(?,?,?,?,?,?,?,?)';

  const valuesMouv = [
    req.body.id_varianteProduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_user_cr,
    req.body.id_client,
    req.body.id_commande,
    req.body.id_fournisseur,
    req.body.description
  ];

  const idVarianteProduit = req.body.id_varianteProduit;
  const quantiteLivre = req.body.qte_livre;

  const checkDuplicateQuery = `
    SELECT COUNT(*) as countLivraison
    FROM detail_livraison
    WHERE id_varianteProduit = ? AND id_commande = ?
  `;

  db.query(checkDuplicateQuery, [idVarianteProduit, req.body.id_commande], (error, rows) => {
    if (error) {
      console.error('Error checking duplicate livraison:', error);
      return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
    }

    if (rows[0].countLivraison > 0) {
      return res.json('Une livraison pour cette variante de produit et cette commande existe déjà.');
    }

    const checkDuplicateMouvementQuery = `
      SELECT COUNT(*) as countMouvement
      FROM mouvement_stock
      WHERE id_varianteProduit = ? AND id_commande = ?
    `;

    db.query(checkDuplicateMouvementQuery, [idVarianteProduit, req.body.id_commande], (error, mouvementRows) => {
      if (error) {
        console.error('Error checking duplicate mouvement:', error);
        return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
      }

      if (mouvementRows[0].countMouvement > 0) {
        return res.json('Un mouvement pour cette variante de produit et cette commande existe déjà.');
      }

      db.query(qStockeTaille, [idVarianteProduit], (error, stockTailleData) => {
        if (error) {
          console.error('Error fetching stock taille:', error);
          return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
        }

        const stockTailleActuel = stockTailleData[0].stock;
        let newStockTaille;

        switch (parseInt(req.body.id_type_mouvement)) {
          case 13:
            newStockTaille = stockTailleActuel;
            break;
          case 12:
            newStockTaille = stockTailleActuel - parseInt(req.body.quantite);
            if (newStockTaille < 0) {
              return res.status(400).json({ error: 'Quantité de stock insuffisante.' });
            }
            break;
          default:
            newStockTaille = stockTailleActuel;
        }

        db.query(qUpdateStock, [newStockTaille, idVarianteProduit], (error) => {
          if (error) {
            console.error('Error updating stock:', error);
            return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
          }

          db.query(qInsertMouvement, valuesMouv, (error) => {
            if (error) {
              console.error('Error inserting mouvement:', error);
              return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
            }

            db.query(getIdCommandeQuery, [idVarianteProduit], (error, results) => {
              if (error) {
                console.error('Error fetching commande details:', error);
                return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
              }

              if (results.length > 0) {
                const prixUnitaire = results[0].prix;
                const quantiteCommande = results[0].quantite;
                const prixTotal = (prixUnitaire / quantiteCommande) * quantiteLivre;
                const insertQuery = `
                  INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package, id_livreur, id_detail_commande, user_cr)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?)
                `;
                const values = [
                  req.body.id_commande,
                  req.body.quantite_prix,
                  idVarianteProduit,
                  quantiteLivre,
                  req.body.qte_commande,
                  prixTotal,
                  req.body.package,
                  req.body.id_package,
                  req.body.id_livreur,
                  req.body.id_detail_commande,
                  req.body.user_cr
                ];

                db.query(insertQuery, values, (insertError) => {
                  if (insertError) {
                    console.error('Error inserting livraison detail:', insertError);
                    return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                  }

                  return res.json('Processus réussi');
                });
              } else {
                return res.status(404).json('Prix ou quantité non trouvés pour l\'id_varianteProduit spécifié');
              }
            });
          });
        });
      });
    });
  });
}; */

exports.postLivraisonDetail = (req, res) => {
  const getIdCommandeQuery = 'SELECT prix, quantite FROM detail_commande WHERE id_varianteProduit = ?';
  const qStockeTaille = 'SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?';
  const qUpdateStock = 'UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?';
  const qInsertMouvement = 'INSERT INTO mouvement_stock(id_varianteProduit, id_type_mouvement, quantite, id_user_cr, id_client, id_commande, id_fournisseur, description) VALUES(?,?,?,?,?,?,?,?)';

  const valuesMouv = [
    req.body.id_varianteProduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_user_cr,
    req.body.id_client,
    req.body.id_commande,
    req.body.id_fournisseur,
    req.body.description
  ];

  const idVarianteProduit = req.body.id_varianteProduit;
  const quantiteLivre = req.body.qte_livre;

  const checkDuplicateQuery = `
    SELECT COUNT(*) as countLivraison
    FROM detail_livraison
    WHERE id_varianteProduit = ? AND id_commande = ?
  `;

  // Obtenir une connexion à partir du pool
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err);
      return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
    }

    // Commencer une transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Erreur lors du démarrage de la transaction:', err);
        connection.release(); // Libérer la connexion
        return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
      }

      // Vérification des duplicatas dans detail_livraison
      connection.query(checkDuplicateQuery, [idVarianteProduit, req.body.id_commande], (error, rows) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Erreur lors de la vérification des duplicatas de livraison:', error);
            connection.release();
            return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
          });
        }

        if (rows[0].countLivraison > 0) {
          return connection.rollback(() => {
            connection.release();
            return res.json('Une livraison pour cette variante de produit et cette commande existe déjà.');
          });
        }

        // Continuer avec les vérifications, mise à jour du stock et insertion
        connection.query(qStockeTaille, [idVarianteProduit], (error, stockTailleData) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Erreur lors de la récupération du stock:', error);
              connection.release();
              return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
            });
          }

          const stockTailleActuel = stockTailleData[0].stock;
          let newStockTaille;

          switch (parseInt(req.body.id_type_mouvement)) {
            case 13:
              newStockTaille = stockTailleActuel;
              break;
            case 12:
              newStockTaille = stockTailleActuel - parseInt(req.body.quantite);
              if (newStockTaille < 0) {
                return connection.rollback(() => {
                  connection.release();
                  return res.status(400).json({ error: 'Quantité de stock insuffisante.' });
                });
              }
              break;
            default:
              newStockTaille = stockTailleActuel;
          }

          // Mise à jour du stock
          connection.query(qUpdateStock, [newStockTaille, idVarianteProduit], (error) => {
            if (error) {
              return connection.rollback(() => {
                console.error('Erreur lors de la mise à jour du stock:', error);
                connection.release();
                return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
              });
            }

            // Insertion dans mouvement_stock
            connection.query(qInsertMouvement, valuesMouv, (error) => {
              if (error) {
                return connection.rollback(() => {
                  console.error('Erreur lors de l\'insertion dans mouvement_stock:', error);
                  connection.release();
                  return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                });
              }

              // Récupération des détails de la commande
              connection.query(getIdCommandeQuery, [idVarianteProduit], (error, results) => {
                if (error) {
                  return connection.rollback(() => {
                    console.error('Erreur lors de la récupération des détails de la commande:', error);
                    connection.release();
                    return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                  });
                }

                if (results.length > 0) {
                  const prixUnitaire = results[0].prix;
                  const quantiteCommande = results[0].quantite;
                  const prixTotal = (prixUnitaire / quantiteCommande) * quantiteLivre;
                  const insertQuery = `
                    INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package, id_livreur, id_detail_commande, user_cr)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)
                  `;
                  const values = [
                    req.body.id_commande,
                    req.body.quantite_prix,
                    idVarianteProduit,
                    quantiteLivre,
                    req.body.qte_commande,
                    prixTotal,
                    req.body.package,
                    req.body.id_package,
                    req.body.id_livreur,
                    req.body.id_detail_commande,
                    req.body.user_cr
                  ];

                  // Insertion dans detail_livraison
                  connection.query(insertQuery, values, (insertError) => {
                    if (insertError) {
                      return connection.rollback(() => {
                        console.error('Erreur lors de l\'insertion dans detail_livraison:', insertError);
                        connection.release();
                        return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                      });
                    }

                    // Valider la transaction
                    connection.commit((commitError) => {
                      if (commitError) {
                        return connection.rollback(() => {
                          console.error('Erreur lors de la validation de la transaction:', commitError);
                          connection.release();
                          return res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                        });
                      }

                      connection.release(); // Libérer la connexion après succès
                      return res.json('Processus réussi');
                    });
                  });
                } else {
                  return connection.rollback(() => {
                    connection.release();
                    return res.status(404).json('Prix ou quantité non trouvés pour l\'id_varianteProduit spécifié');
                  });
                }
              });
            });
          });
        });
      });
    });
  });
};

exports.deleteLivraisonDetail = (req, res) => {
    const {id} = req.params;

    const q = "DELETE FROM detail_livraison WHERE id_detail_livraison = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
}

//Livraison prix
exports.getLivraisonDetailPrix = (req, res)=>{
  const {id} = req.params;
  const q = `
          SELECT prix FROM detail_livraison
          WHERE id_detail_livraison = ?`;
 
db.query(q,[id], (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.putLivraisonDetailPrix = (req, res) => {
  const {id} = req.params;
  const {prix,userUpdate} = req.body;

  const q = "UPDATE detail_livraison SET `prix` = ?, `userUpdate` = ? WHERE id_detail_livraison = ?";

  db.query(q, [prix,userUpdate,id], (err, data) => {
      if (err) return res.send(err);
      console.log(err)
      return res.json(data);
    });
  }

//livraison utilisateur
exports.getLivraisonUser = (req, res)=>{
  const {id} = req.params;

    const q = `SELECT detail_livraison.*,varianteproduit.img, client.nom, adresse.avenue, adresse.quartier, adresse.num, telephone.numero, client.id AS id_client, commune.nom_commune, province.nom_province, couleur.description AS couleur FROM detail_livraison
                  INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
                  INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
                  INNER JOIN detail_commande ON detail_livraison.id_detail_commande = detail_commande.id_detail
                  INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande 
                  INNER JOIN client ON commande.id_client = client.id
                  LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
                  LEFT JOIN  telephone ON commande.id_telephone = telephone.id_telephone
                  LEFT JOIN commune ON adresse.id_commune = commune.id_commune
                  LEFT JOIN province ON adresse.id_ville = province.id_province
              WHERE vu_livreur = 0 AND id_livreur = ? GROUP BY commande.id_commande
            `;
 
db.query(q,id, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonUserOne = (req, res)=>{
  const {id} = req.params;
  const idCommande = req.query.id_commande

  const q = `SELECT detail_livraison.*,varianteproduit.img, taille.taille AS pointure, client.nom, adresse.avenue, adresse.quartier, adresse.num, adresse.id_adresse, telephone.numero, client.id AS id_client, commune.nom_commune, province.nom_province, couleur.description AS couleur FROM detail_livraison
              INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
              INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
              INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
              INNER JOIN detail_commande ON detail_livraison.id_detail_commande = detail_commande.id_detail
              INNER JOIN commande ON detail_livraison.id_commande = commande.id_commande 
              INNER JOIN client ON commande.id_client = client.id
              LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
              LEFT JOIN  telephone ON commande.id_telephone = telephone.id_telephone
              LEFT JOIN commune ON adresse.id_commune = commune.id_commune
              LEFT JOIN province ON adresse.id_ville = province.id_province
            WHERE vu_livreur = 0 AND id_livreur = ${id} AND commande.id_commande = ${idCommande};
            `;
 
db.query(q,(error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

exports.getLivraisonUserDetail = (req, res)=>{
  const {id} = req.params;
  const q = `SELECT detail_livraison.*,varianteproduit.img, users.username, taille.taille, marque.nom FROM detail_livraison
              INNER JOIN varianteproduit ON detail_livraison.id_varianteProduit = varianteproduit.id_varianteProduit
              INNER JOIN users ON detail_livraison.user_cr = users.id
              INNER JOIN detail_commande ON detail_livraison.id_detail_commande = detail_commande.id_detail
              INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
              INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
              INNER JOIN marque ON produit.id_marque = marque.id_marque
            WHERE detail_livraison.id_varianteProduit = ?
            `;
 
db.query(q,id, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}

//Vu livreur
exports.putLivraisonVuLivreur = (req, res) => {
  const {id} = req.params;
  const q = "UPDATE detail_livraison SET vu_livreur = 1 WHERE id_commande = ?";

  db.query(q, [id], (err, data) => {
      if (err) return res.send(err);
      console.log(err)
      return res.json(data);
    });
}