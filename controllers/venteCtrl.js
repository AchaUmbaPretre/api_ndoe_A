const { db } = require("./../config/db.js");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

exports.getVente = (req, res) => {
  const { start_date, end_date } = req.query;

    const q = `
        SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure,
            SUM(vente.quantite) AS total_varianteproduit,
            SUM(vente.prix_unitaire) AS total_prix_vente, commande.id_shop,
            COUNT(*) AS nombre_vendu
        FROM vente
        INNER JOIN users ON vente.id_livreur = users.id
        INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
        INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
        INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
        INNER JOIN marque ON produit.id_marque = marque.id_marque
        INNER JOIN commande ON vente.id_commande = commande.id_commande
        INNER JOIN client ON commande.id_client = client.id
        INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
        WHERE vente.est_supprime = 0
          ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
          ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
        GROUP BY commande.id_commande
        ORDER BY vente.date_vente DESC;
    `;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}

exports.getVenteAjour = (req, res) => {
    const q = `
          SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure,
          SUM(vente.quantite) AS total_varianteproduit,
          SUM(vente.prix_unitaire) AS total_prix_vente, commande.id_shop,
          COUNT(*) AS nombre_vendu
      FROM vente
      INNER JOIN users ON vente.id_livreur = users.id
      INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
      INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
      INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
      INNER JOIN marque ON produit.id_marque = marque.id_marque
      INNER JOIN commande ON vente.id_commande = commande.id_commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      WHERE vente.est_supprime = 0 AND DATE(vente.date_vente) = CURDATE()
      GROUP BY commande.id_commande
      ORDER BY vente.date_vente DESC;
    `;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}

exports.getVenteCountDuJour = (req, res) => {
  const q = `SELECT COUNT(*) AS nombre_vendu FROM vente 
              WHERE est_supprime = 0 AND DATE(vente.date_vente) = CURDATE()
        `;

  db.query(q ,(error, data)=>{
    if(error) res.status(500).send(error)

    return res.status(200).json(data);
})
}

exports.getVenteHier = (req, res) => {
  const q = `
    SELECT COUNT(*) AS nombre_vendu FROM vente 
      WHERE vente.est_supprime = 0 AND DATE(vente.date_vente) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `;
   
  db.query(q, (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
  });
};

exports.getVenteAjour7 = (req, res) => {
  const q = `
  SELECT COUNT(*) AS nombre_vendu FROM vente 
    WHERE vente.est_supprime = 0 AND DATE(vente.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}
exports.getVenteAjour30 = (req, res) => {
  const q = `
  SELECT COUNT(*) AS nombre_vendu FROM vente 
    WHERE vente.est_supprime = 0 AND DATE(vente.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}
exports.getVenteAjour1an = (req, res) => {
  const q = `
  SELECT COUNT(*) AS nombre_vendu FROM vente 
    WHERE vente.est_supprime = 0 AND DATE(vente.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getVenteCount = (req, res) => {
  const q = `SELECT COUNT(*) AS total FROM vente WHERE est_supprime = 0`;

  db.query(q ,(error, data)=>{
    if(error) res.status(500).send(error)

    return res.status(200).json(data);
})
}

exports.getVenteOne = (req, res) => {
  const {id} = req.params;
  const { start_date, end_date } = req.query;
  const q = `
  SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client,client.telephone, marque.nom AS nom_marque, taille.taille AS pointure, produit.nom_produit, commande.id_shop
      FROM vente
  INNER JOIN users ON vente.id_livreur = users.id
  INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON vente.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      WHERE vente.est_supprime = 0 AND commande.id_commande = ${id}
      ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
      ORDER BY vente.date_vente DESC;
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getVenteRapports = (req, res) => {
  const filter = req.query.filter;

  let q = `
        SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure,
            SUM(vente.quantite) AS total_varianteproduit,
            SUM(vente.prix_unitaire) AS total_prix_vente, commande.id_shop,
            COUNT(*) AS nombre_vendu
        FROM vente
        INNER JOIN users ON vente.id_livreur = users.id
        INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
        INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
        INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
        INNER JOIN marque ON produit.id_marque = marque.id_marque
        INNER JOIN commande ON vente.id_commande = commande.id_commande
        INNER JOIN client ON commande.id_client = client.id
        INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
        WHERE vente.est_supprime = 0
  `;

  if (filter === 'today') {
    q += ` AND DATE(vente.date_vente) = CURDATE()`;
  } else if (filter === 'yesterday') {
    q += ` AND DATE(vente.date_vente) = CURDATE() - INTERVAL 1 DAY`;
  } else if (filter === 'last7days') {
    q += ` AND DATE(vente.date_vente) >= CURDATE() - INTERVAL 7 DAY`;
  } else if (filter === 'last30days') {
    q += ` AND DATE(vente.date_vente) >= CURDATE() - INTERVAL 30 DAY`;
  } else if (filter === 'last1year') {
    q += ` AND DATE(vente.date_vente) >= CURDATE() - INTERVAL 1 YEAR`;
  }

  q += `
  GROUP BY vente.id_commande
  ORDER BY vente.date_vente DESC;
  `;

  db.query(q, (error, data) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

/* exports.postVente = (req, res) => {
  const StatutLivre = "UPDATE commande SET statut = 1, id_livraison = 2 WHERE id_commande = ?";
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qLivraison = "UPDATE detail_livraison SET vu_livreur = 1 WHERE id_varianteProduit = ?";
  const qUpdateMouv = `UPDATE mouvement_stock SET id_type_mouvement = ? WHERE id_varianteProduit = ?`;
  const q = 'INSERT INTO vente(`id_client`, `id_livreur`, `quantite`, `id_commande`, `id_detail_commande`,`prix_unitaire`) VALUES(?,?,?,?,?,?)';
  const qDette = 'INSERT INTO dette(`id_commande`, `montant_convenu`, `montant_paye`) VALUES(?,?,?)';
  const qCheckVente = 'SELECT id_detail_commande FROM vente WHERE id_detail_commande = ?';
  
  const values = [
    req.body.id_client,
    req.body.id_livreur,
    req.body.quantite,
    req.body.id_commande,
    req.body.id_detail_commande,
    req.body.prix_unitaire
  ];

  const valuesDette = [
    req.body.id_commande,
    req.body.montant_convenu,
    req.body.montant_paye
  ];

  db.getConnection((error, connection) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      connection.query(qCheckVente, [req.body.id_detail_commande], (error, checkData) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
          connection.release();
        } else {
          if (checkData && checkData.length > 0) {
            res.json('L\'enregistrement existe déjà dans la table vente');
            connection.release();
          } else {
            connection.query(q, values, (error, data) => {
              if (error) {
                res.status(500).json(error);
                console.log(error);
                connection.release();
              } else {
                connection.query(qUpdateMouv, [req.body.id_type_mouvement, req.body.id_varianteProduit], (error, mouvementData) => {
                  if (error) {
                    res.status(500).json(error);
                    console.log(error);
                    connection.release();
                  } else {
                    connection.query(StatutLivre, [req.body.id_commande], (error, updateData) => {
                      if (error) {
                        res.status(500).json(error);
                        console.log(error);
                        connection.release();
                      } else {
                        connection.query(qStockeTaille, [req.body.id_varianteProduit], (error, stockTailleData) => {
                          if (error) {
                            res.status(500).json(error);
                            console.log(error);
                            connection.release();
                          } else {
                            const stockTailleActuel = stockTailleData[0].stock;
                            let newStockTaille;

                            if (parseInt(req.body.id_type_mouvement) === 4) {
                              newStockTaille = stockTailleActuel;
                            } else if (parseInt(req.body.id_type_mouvement) === 5) {
                              newStockTaille = stockTailleActuel + parseInt(req.body.quantite);
                            } else {
                              newStockTaille = stockTailleActuel;
                            }
                            connection.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) => {
                              if (error) {
                                res.status(500).json(error);
                                console.log(error);
                                connection.release();
                              } else {
                                connection.query(qLivraison, [req.body.id_varianteProduit], (error, updateData) => {
                                  if (error) {
                                    res.status(500).json(error);
                                    console.log(error);
                                    connection.release();
                                  } else {
                                    if (req.body.montant_paye) {
                                      connection.query(qDette, valuesDette, (error, updateData) => {
                                        if (error) {
                                          console.log(error)
                                          res.status(500).json(error);
                                        }
                                        res.json('Processus réussi');
                                        connection.release();
                                      });
                                    } else {
                                      res.json('Processus réussi');
                                      connection.release();
                                    }
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  });
}; */

/* exports.postVente = (req, res) => {
  const StatutLivre = "UPDATE commande SET statut = 1, id_livraison = 2 WHERE id_commande = ?";
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qLivraison = "UPDATE detail_livraison SET vu_livreur = 1 WHERE id_varianteProduit = ?";
  const qUpdateMouv = `UPDATE mouvement_stock SET id_type_mouvement = ? WHERE id_varianteProduit = ?`;
  const q = 'INSERT INTO vente(`id_client`, `id_livreur`, `quantite`, `id_commande`, `id_detail_commande`,`prix_unitaire`) VALUES(?,?,?,?,?,?)';
  const qDette = 'INSERT INTO dette(`id_commande`, `montant_convenu`, `montant_paye`) VALUES(?,?,?)';
  const qCheckVente = 'SELECT id_detail_commande FROM vente WHERE id_detail_commande = ?';

  const values = [
    req.body.id_client,
    req.body.id_livreur,
    req.body.quantite,
    req.body.id_commande,
    req.body.id_detail_commande,
    req.body.prix_unitaire
  ];

  const valuesDette = [
    req.body.id_commande,
    req.body.montant_convenu,
    req.body.montant_paye
  ];

  db.getConnection((error, connection) => {
    if (error) {
      res.status(500).json({ error: 'Erreur lors de la connexion à la base de données' });
      console.log(error);
      return;
    }

    connection.beginTransaction(err => {
      if (err) {
        res.status(500).json({ error: 'Erreur lors du démarrage de la transaction' });
        console.log(err);
        connection.release();
        return;
      }

      connection.query(qCheckVente, [req.body.id_detail_commande], (error, checkData) => {
        if (error) {
          connection.rollback(() => {
            res.status(500).json({ error: 'Erreur lors de la vérification de la ventilation' });
            console.log(error);
            connection.release();
          });
          return;
        }

        if (checkData && checkData.length > 0) {
          connection.rollback(() => {
            res.json('L\'enregistrement existe déjà dans la table vente');
            connection.release();
          });
          return;
        }

        connection.query(q, values, (error) => {
          if (error) {
            connection.rollback(() => {
              res.status(500).json({ error: "Erreur lors de l'insertion de la ventilation" });
              console.log(error);
              connection.release();
            });
            return;
          }

          connection.query(qUpdateMouv, [req.body.id_type_mouvement, req.body.id_varianteProduit], (error) => {
            if (error) {
              connection.rollback(() => {
                res.status(500).json({ error: 'Erreur lors de la mise à jour de mouvement_stock' });
                console.log(error);
                connection.release();
              });
              return;
            }

            connection.query(StatutLivre, [req.body.id_commande], (error) => {
              if (error) {
                connection.rollback(() => {
                  res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
                  console.log(error);
                  connection.release();
                });
                return;
              }

              connection.query(qStockeTaille, [req.body.id_varianteProduit], (error, stockTailleData) => {
                if (error) {
                  connection.rollback(() => {
                    res.status(500).json({ error: "Erreur lors de la récupération du stock" });
                    connection.release();
                  });
                  return;
                }

                const stockTailleActuel = stockTailleData[0].stock;
                let newStockTaille;

                if (parseInt(req.body.id_type_mouvement) === 4) {
                  newStockTaille = stockTailleActuel;
                } else if (parseInt(req.body.id_type_mouvement) === 5) {
                  newStockTaille = stockTailleActuel + parseInt(req.body.quantite);
                } else {
                  newStockTaille = stockTailleActuel;
                }

                connection.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error) => {
                  if (error) {
                    connection.rollback(() => {
                      res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
                      console.log(error);
                      connection.release();
                    });
                    return;
                  }

                  connection.query(qLivraison, [req.body.id_varianteProduit], (error) => {
                    if (error) {
                      connection.rollback(() => {
                        res.status(500).json({ error: "Erreur lors de la mise à jour de la livraison" });
                        console.log(error);
                        connection.release();
                      });
                      return;
                    }

                    if (req.body.montant_paye) {
                      connection.query(qDette, valuesDette, (error) => {
                        if (error) {
                          connection.rollback(() => {
                            res.status(500).json({ error: 'Error inserting dette' });
                            console.log(error);
                            connection.release();
                          });
                          return;
                        }

                        connection.commit(err => {
                          if (err) {
                            connection.rollback(() => {
                              res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
                              console.log(err);
                              connection.release();
                            });
                            return;
                          }

                          res.json('Processus réussi');
                          connection.release();
                        });
                      });
                    } else {
                      connection.commit(err => {
                        if (err) {
                          connection.rollback(() => {
                            res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
                            console.log(err);
                            connection.release();
                          });
                          return;
                        }

                        res.json('Processus réussi');
                        connection.release();
                      });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}; */

exports.postVente = (req, res) => {
  const StatutLivre = "UPDATE commande SET statut = 1, id_livraison = 2 WHERE id_commande = ?";
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qLivraison = "UPDATE detail_livraison SET vu_livreur = 1 WHERE id_varianteProduit = ? AND id_commande = ?";
  const qUpdateMouv = `UPDATE mouvement_stock SET id_type_mouvement = ? WHERE id_varianteProduit = ?`;
  const q = 'INSERT INTO vente(`id_client`, `id_livreur`, `quantite`, `id_commande`, `id_detail_commande`,`prix_unitaire`) VALUES(?,?,?,?,?,?)';
  const qDette = 'INSERT INTO dette(`id_commande`, `montant_convenu`, `montant_paye`) VALUES(?,?,?)';
  const qCheckVente = 'SELECT id_detail_commande FROM vente WHERE id_detail_commande = ?';

  const values = [
    req.body.id_client,
    req.body.id_livreur,
    req.body.quantite,
    req.body.id_commande,
    req.body.id_detail_commande,
    req.body.prix_unitaire
  ];

  const valuesDette = [
    req.body.id_commande,
    req.body.montant_convenu,
    req.body.montant_paye
  ];

  db.getConnection((error, connection) => {
    if (error) {
      res.status(500).json({ error: 'Erreur lors de la connexion à la base de données' });
      console.log(error);
      return;
    }

    connection.beginTransaction(err => {
      if (err) {
        res.status(500).json({ error: 'Erreur lors du démarrage de la transaction' });
        console.log(err);
        connection.release();
        return;
      }

      connection.query(qCheckVente, [req.body.id_detail_commande], (error, checkData) => {
        if (error) {
          connection.rollback(() => {
            res.status(500).json({ error: 'Erreur lors de la vérification de la ventilation' });
            console.log(error);
            connection.release();
          });
          return;
        }

        if (checkData && checkData.length > 0) {
          connection.rollback(() => {
            res.json('L\'enregistrement existe déjà dans la table vente');
            connection.release();
          });
          return;
        }

        connection.query(q, values, (error) => {
          if (error) {
            connection.rollback(() => {
              res.status(500).json({ error: "Erreur lors de l'insertion de la ventilation" });
              console.log(error);
              connection.release();
            });
            return;
          }

          connection.query(qUpdateMouv, [req.body.id_type_mouvement, req.body.id_varianteProduit], (error) => {
            if (error) {
              connection.rollback(() => {
                res.status(500).json({ error: 'Erreur lors de la mise à jour de mouvement_stock' });
                console.log(error);
                connection.release();
              });
              return;
            }

            connection.query(StatutLivre, [req.body.id_commande], (error) => {
              if (error) {
                connection.rollback(() => {
                  res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
                  console.log(error);
                  connection.release();
                });
                return;
              }

              connection.query(qStockeTaille, [req.body.id_varianteProduit], (error, stockTailleData) => {
                if (error) {
                  connection.rollback(() => {
                    res.status(500).json({ error: "Erreur lors de la récupération du stock" });
                    console.log(error);
                    connection.release();
                  });
                  return;
                }

                const stockTailleActuel = stockTailleData[0].stock;
                let newStockTaille;

                if (parseInt(req.body.id_type_mouvement) === 4) {
                  newStockTaille = stockTailleActuel;
                } else if (parseInt(req.body.id_type_mouvement) === 5) {
                  newStockTaille = stockTailleActuel + parseInt(req.body.quantite);
                } else {
                  newStockTaille = stockTailleActuel;
                }

                connection.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error) => {
                  if (error) {
                    connection.rollback(() => {
                      res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
                      console.log(error);
                      connection.release();
                    });
                    return;
                  }

                  connection.query(qLivraison, [req.body.id_varianteProduit,req.body.id_commande], (error) => {
                    if (error) {
                      connection.rollback(() => {
                        res.status(500).json({ error: "Erreur lors de la mise à jour de la livraison" });
                        console.log(error);
                        connection.release();
                      });
                      return;
                    }

                    if (req.body.montant_paye) {
                      connection.query(qDette, valuesDette, (error) => {
                        if (error) {
                          connection.rollback(() => {
                            res.status(500).json({ error: 'Error inserting dette' });
                            console.log(error);
                            connection.release();
                          });
                          return;
                        }

                        connection.commit(err => {
                          if (err) {
                            connection.rollback(() => {
                              res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
                              console.log(err);
                              connection.release();
                            });
                            return;
                          }

                          res.json('Processus réussi');
                          connection.release();
                        });
                      });
                    } else {
                      connection.commit(err => {
                        if (err) {
                          connection.rollback(() => {
                            res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
                            console.log(err);
                            connection.release();
                          });
                          return;
                        }

                        res.json('Processus réussi');
                        connection.release();
                      });
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};


/* exports.envoiEmail = (req, res) => {

  const values = [
    req.body.id_client,
    req.body.id_livreur,
    req.body.quantite,
    req.body.id_commande,
    req.body.id_detail_commande,
    req.body.prix_unitaire
  ];

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'achandambi@gmail.com',
      pass: 'smwn cwvj fylp bkdq',
    },
  });

  const mailOptions = {
    from: 'achandambi@gmail.com',
    to: 'achandambi@gmail.com',
    subject: 'Vente',
    text: JSON.stringify(values),
  };

  transporter.sendMail(mailOptions, (error, info) =>{
    if(error){
      console.log(error)
      res.status(500).json({ error: "Une erreur s'est produite lors de l'envoi de l'e-mail." });
    } else{
      console.log('E-mail envoyé :', info.response);
      res.status(200).json({ message: 'E-mail envoyé avec succès.' });
    }
  })

} */

exports.envoiEmail = (req, res) => {
  const id = req.body.id_commande; // Supposons que l'ID de la commande est passé en tant que paramètre de requête

  const query = `
    SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure, produit.nom_produit, commande.id_shop
    FROM vente
    INNER JOIN users ON vente.id_livreur = users.id
    INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
    INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN commande ON vente.id_commande = commande.id_commande
    INNER JOIN client ON commande.id_client = client.id
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    WHERE vente.est_supprime = 0 AND commande.id_commande = ${id}
    ORDER BY vente.date_vente DESC`;

  db.query(query, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Une erreur s'est produite lors de l'exécution de la requête SQL." });
    } else {
      const data = [];

      results.forEach((result) => {
        const {
          nom_marque,
          nom_produit,
          pointure,
          nom_client,
          quantite,
          prix_unitaire,
          username,
        } = result;

        const item = {
          nom_marque,
          nom_produit,
          pointure,
          nom_client,
          quantite,
          prix_unitaire,
          username
        };

        // Ajouter l'objet au tableau des données
        data.push(item);
      });

      // Créer le tableau HTML pour les données
      let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Nom de la marque</th>
            <th>Nom du produit</th>
            <th>Pointure</th>
            <th>Nom du client</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Livreur</th>
          </tr>
        </thead>
        <tbody>
      `;

      // Parcourir les données et ajouter chaque ligne au tableau HTML
      data.forEach((item) => {
        tableHTML += `
          <tr>
            <td>${item.nom_marque}</td>
            <td>${item.nom_produit}</td>
            <td>${item.pointure}</td>
            <td>${item.nom_client}</td>
            <td>${item.quantite}</td>
            <td>${item.prix_unitaire}</td>
            <td>${item.username}</td>
          </tr>
        `;
      });

      tableHTML += `
        </tbody>
      </table>
      `;

/*       const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'achandambi@gmail.com',
          pass: 'smwn cwvj fylp bkdq',
        },
      });
 */
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ndoeboutique01@gmail.com',
          pass: 'c c h d b z j i s p w n u w g z',
        },
      });

      const mailOptions = {
        from: 'achandambi@gmail.com',
        to: 'achandambi@gmail.com',
        subject: 'Vente',
        html: tableHTML, // Utilisez le tableau HTML dans le corps de l'e-mail
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ error: "Une erreur s'est produite lors de l'envoi de l'e-mail." });
        } else {
          console.log('E-mail envoyé :', info.response);
          res.status(200).json({ message: 'E-mail envoyé avec succès.' });
        }
      });
    }
  });
};

exports.postVenteRetour = (req, res) => {
  const StatutLivre = "UPDATE commande SET statut = 1, id_livraison = 2 WHERE id_commande = ?";
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qLivraison = "UPDATE detail_livraison SET vu_livreur = 1 WHERE id_varianteProduit = ?";
  const qInsertMouvement =
    'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`,`id_commande`, `id_fournisseur`, `description`) VALUES(?)';

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

  db.query(StatutLivre, [req.body.id_commande], (error, updateData) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de la commande.' });
    }

    db.query(qStockeTaille, [req.body.id_varianteProduit], (error, stockTailleData) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des données de stock de la taille.' });
      }

      const stockTailleActuel = stockTailleData[0].stock;
      let newStockTaille;

      if (parseInt(req.body.id_type_mouvement) === 4) {
        newStockTaille = stockTailleActuel;
      } else if (parseInt(req.body.id_type_mouvement) === 5) {
        newStockTaille = stockTailleActuel + parseInt(req.body.quantite);
      } else {
        newStockTaille = stockTailleActuel;
      }

      db.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du stock.' });
        }

        db.query(qLivraison, [req.body.id_varianteProduit], (error, updateData) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de la livraison.' });
          }

          db.query(qInsertMouvement, [valuesMouv], (error, updateData) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ error: 'Erreur lors de l\'insertion du mouvement de stock.' });
            }

            res.json('Processus réussi');
          });
        });
      });
    });
  });
};

exports.deleteVente = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM vente WHERE id_vente = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
}

exports.putVente = (req, res) => {
    const id = req.params.id;
    const q = "UPDATE vente SET `id_client`= ?, `id_livreur`= ?, `quantite`= ?, `id_commande`= ?, `prix_unitaire`= ? WHERE id_vente = ?"
    
    const values = [
        req.body.id_client,
        req.body.id_livreur,
        req.body.quantite,
        req.body.id_commande,
        req.body.prix_unitaire
    ]
  
    db.query(q, [...values,id], (err, data) => {
        if (err) return res.send(err);
        return res.json(data);
      });
}


//Dette
exports.getDette = (req, res) => {
  const { start_date, end_date } = req.query;

  const q = `SELECT dette.*, client.nom, COUNT(*) AS nbre_dette, client.id AS id_client, client.telephone, 
              (SUM(dette.montant_convenu) - SUM(dette.montant_paye)) AS montant_restant, commande.id_shop,  SUM(dette.montant_convenu) AS montant_convenuV,SUM(dette.montant_paye) AS montant_payeV
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
              ${start_date ? `AND DATE(dette.created_at) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(dette.created_at) <= '${end_date}'` : ''}
              GROUP BY client.id
              ORDER BY dette.created_at DESC`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }

    // Comparer le montant convenu avec le montant payé
    data.forEach((dette) => {
      if (dette.montant_convenuV > dette.montant_payeV) {
        dette.statut = "Débiteur";
      } else if (dette.montant_convenuV === dette.montant_payeV) {
        dette.statut = "Validé";
      }
    });
    return res.status(200).json(data);
  });
};

exports.getDetteRapports = (req, res) => {
  const filter = req.query.filter;

  let q = `SELECT dette.*, client.nom, COUNT(*) AS nbre_dette, client.id AS id_client, client.telephone, 
              (SUM(dette.montant_convenu) - SUM(dette.montant_paye)) AS montant_restant, commande.id_shop,  SUM(dette.montant_convenu) AS montant_convenuV,SUM(dette.montant_paye) AS montant_payeV
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
            WHERE client.est_supprime = 0`;

              if (filter === 'today') {
                q += ` AND DATE(dette.created_at) = CURDATE()`;
              } else if (filter === 'yesterday') {
                q += ` AND DATE(dette.created_at) = CURDATE() - INTERVAL 1 DAY`;
              } else if (filter === 'last7days') {
                q += ` AND DATE(dette.created_at) >= CURDATE() - INTERVAL 7 DAY`;
              } else if (filter === 'last30days') {
                q += ` AND DATE(dette.created_at) >= CURDATE() - INTERVAL 30 DAY`;
              } else if (filter === 'last1year') {
                q += ` AND DATE(dette.created_at) >= CURDATE() - INTERVAL 1 YEAR`;
              }

              q += `
              GROUP BY client.id
              ORDER BY dette.created_at DESC
              `;

    db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getDettePaiement = (req, res) => {

  const q = `SELECT COUNT(DISTINCT paiement.id_client) AS nombre_clients, paiement.*, client.nom, client.telephone
  FROM paiement
  LEFT JOIN client ON paiement.id_client = client.id
  WHERE DATE(paiement.created_at) = CURDATE();`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getDetteJour = (req, res) => {

  const q = `SELECT dette.*, client.nom, COUNT(*) AS nbre_dette, client.id AS id_client, client.telephone, 
              (SUM(dette.montant_convenu) - SUM(dette.montant_paye)) AS montant_restant, commande.id_shop,  SUM(dette.montant_convenu) AS montant_convenuV,SUM(dette.montant_paye) AS montant_payeV
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
            WHERE DATE(dette.created_at) = CURDATE()
              GROUP BY dette.id_dette
              ORDER BY dette.created_at DESC`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }

    // Comparer le montant convenu avec le montant payé
    data.forEach((dette) => {
      if (dette.montant_convenuV > dette.montant_payeV) {
        dette.statut = "Débiteur";
      } else if (dette.montant_convenuV === dette.montant_payeV) {
        dette.statut = "Validé";
      }
    });
    return res.status(200).json(data);
  });
};

exports.getDetteJour7 = (req, res) => {

  const q = `SELECT dette.*, client.nom, COUNT(*) AS nbre_dette, client.id AS id_client, client.telephone, 
              (SUM(dette.montant_convenu) - SUM(dette.montant_paye)) AS montant_restant, commande.id_shop,  SUM(dette.montant_convenu) AS montant_convenuV,SUM(dette.montant_paye) AS montant_payeV
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
            WHERE DATE(dette.created_at) >= CURDATE() - INTERVAL 7 DAY
              GROUP BY client.id
              ORDER BY dette.created_at DESC`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }

    // Comparer le montant convenu avec le montant payé
    data.forEach((dette) => {
      if (dette.montant_convenuV > dette.montant_payeV) {
        dette.statut = "Débiteur";
      } else if (dette.montant_convenuV === dette.montant_payeV) {
        dette.statut = "Validé";
      }
    });
    return res.status(200).json(data);
  });
};
exports.getDetteJour30 = (req, res) => {

  const q = `SELECT dette.*, client.nom, COUNT(*) AS nbre_dette, client.id AS id_client, client.telephone, 
              (SUM(dette.montant_convenu) - SUM(dette.montant_paye)) AS montant_restant, commande.id_shop,  SUM(dette.montant_convenu) AS montant_convenuV,SUM(dette.montant_paye) AS montant_payeV
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            LEFT JOIN client ON commande.id_client = client.id
            WHERE DATE(dette.created_at) >= CURDATE() - INTERVAL 30 DAY
              GROUP BY client.id
              ORDER BY dette.created_at DESC`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }

    // Comparer le montant convenu avec le montant payé
    data.forEach((dette) => {
      if (dette.montant_convenuV > dette.montant_payeV) {
        dette.statut = "Débiteur";
      } else if (dette.montant_convenuV === dette.montant_payeV) {
        dette.statut = "Validé";
      }
    });
    return res.status(200).json(data);
  });
};

exports.getDetteRapport = (req, res) => {

  const q = `SELECT
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette,
              (SELECT COUNT(*) FROM dette WHERE dette.montant_convenu > dette.montant_paye) AS nombre_dettes_encours
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande;`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getDetteRapportNbreJour = (req, res) => {

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE DATE(dette.created_at) = CURDATE()`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getDetteRapportNbreHier = (req, res) => {

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE DATE(dette.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getDetteRapportNbreJour7 = (req, res) => {

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE DATE(dette.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
}

exports.getDetteRapportNbreJour30 = (req, res) => {

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE DATE(dette.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
}

exports.getDetteRapportNbreJour1an = (req, res) => {

  const q = `SELECT 
              SUM(dette.montant_convenu - dette.montant_paye) AS montant_total_restant,
              COUNT(DISTINCT commande.id_client) AS nombre_total_clients_dette,
              MAX(dette.created_at) AS date_plus_recente,
              MIN(dette.created_at) AS date_derniere_dette
            FROM dette
            INNER JOIN commande ON dette.id_commande = commande.id_commande
            WHERE DATE(dette.created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
}

exports.getDetteOne = (req, res) => {
  const { start_date, end_date, id_client } = req.query;

  const q = `SELECT dette.*, client.nom, client.telephone, (dette.montant_convenu - dette.montant_paye) AS montant_restant, commande.id_shop 
              FROM dette
              INNER JOIN commande ON dette.id_commande = commande.id_commande
              LEFT JOIN client ON commande.id_client = client.id
              ${start_date ? `AND DATE(dette.created_at) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(dette.created_at) <= '${end_date}'` : ''}
              WHERE client.id = ${id_client}
              ORDER BY dette.created_at`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).send(error);
    }

    // Comparer le montant convenu avec le montant payé
    data.forEach((dette) => {
      if (dette.montant_convenu > dette.montant_paye) {
        dette.statut = "Débiteur";
      } else if (dette.montant_convenu === dette.montant_paye) {
        dette.statut = "Validé";
      }
    });
    return res.status(200).json(data);
  });
};

exports.deleteDette = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM dette WHERE id_dette = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
}

exports.putDette = (req, res) => {
  const id = req.params.id;
  const q = "UPDATE dette SET `id_commande`= ?, `montant_convenu`= ?, `montant_paye`= ? WHERE id_dette = ?"
  
  const values = [
      req.body.id_commande,
      req.body.montant_convenu,
      req.body.montant_paye
  ]

  db.query(q, [...values,id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
}


//Paiement
exports.getPaiement = (req, res) => {
  const { start_date, end_date } = req.query;

  const q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id
              ${start_date ? `AND DATE(paiement.created_at) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(paiement.created_at) <= '${end_date}'` : ''}
              ORDER BY paiement.created_at`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementRapport = (req, res) => {
  const filter = req.query.filter;

  let q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id`

              if (filter === 'today') {
                q += ` AND DATE(paiement.created_at) = CURDATE()`;
              } else if (filter === 'yesterday') {
                q += ` AND DATE(paiement.created_at) = CURDATE() - INTERVAL 1 DAY`;
              } else if (filter === 'last7days') {
                q += ` AND DATE(paiement.created_at) >= CURDATE() - INTERVAL 7 DAY`;
              } else if (filter === 'last30days') {
                q += ` AND DATE(paiement.created_at) >= CURDATE() - INTERVAL 30 DAY`;
              } else if (filter === 'last1year') {
                q += ` AND DATE(paiement.created_at) >= CURDATE() - INTERVAL 1 YEAR`;
              }

              q += `
              ORDER BY paiement.created_at;
              `;

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}


exports.getPaiementJour = (req, res) => {

  const q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id
              WHERE DATE(paiement.created_at) = CURDATE()
              ORDER BY paiement.created_at`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementHier = (req, res) => {

  const q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id
              WHERE DATE(paiement.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ORDER BY paiement.created_at`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementJour7 = (req, res) => {
  
  const q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id
              WHERE DATE(paiement.created_at) >= CURDATE() - INTERVAL 7 DAY
              ORDER BY paiement.created_at`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementJour30 = (req, res) => {
  
  const q = `SELECT paiement.*, client.nom, client.telephone FROM paiement
              LEFT JOIN client ON paiement.id_client = client.id
              WHERE DATE(paiement.created_at) >= CURDATE() - INTERVAL 30 DAY
              ORDER BY paiement.created_at`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementJourMontant = (req, res) => {

  const q = `SELECT SUM(paiement.montant) AS montant_total
              FROM paiement
            WHERE DATE(paiement.created_at) = CURDATE()`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementHierMontant = (req, res) => {

  const q = `SELECT SUM(paiement.montant) AS montant_total
              FROM paiement
            WHERE DATE(paiement.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}


exports.getPaiementJourMontant7 = (req, res) => {

  const q = `SELECT SUM(paiement.montant) AS montant_total
              FROM paiement
            WHERE DATE(paiement.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementJourMontant30 = (req, res) => {

  const q = `SELECT SUM(paiement.montant) AS montant_total
              FROM paiement
            WHERE DATE(paiement.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.getPaiementJourMontant1an = (req, res) => {

  const q = `SELECT SUM(paiement.montant) AS montant_total
              FROM paiement
            WHERE DATE(paiement.created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}

exports.postPaiement = (req, res) => {
  const qDette = `SELECT dette.*, client.nom, client.telephone FROM dette
              INNER JOIN commande ON dette.id_commande = commande.id_commande
              LEFT JOIN client ON commande.id_client = client.id
              WHERE commande.id_commande = ?`;

  const q = 'INSERT INTO paiement(`id_client`, `montant`) VALUES (?, ?)';

  const values = [
    req.body.id_client,
    req.body.montant
  ];

  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
    } else {
      db.query(qDette, [req.body.id_commande], (errorDette, dataDette)=> {
        if (errorDette) {
          res.status(500).json(errorDette);
        } else {
          const montantTotalPaye = parseInt(req.body.montant) + parseInt(dataDette[0].montant_paye);
          const montantConvenu = parseInt(dataDette[0].montant_convenu);
          const montantRestant = montantConvenu - parseInt(dataDette[0].montant_paye);
          const updateMontant = 'UPDATE dette SET montant_paye = ? WHERE id_commande = ?';
          
          if (montantTotalPaye > montantConvenu) {
            res.json(`Le montant total payé dépasse le montant convenu. Montant restant à payer : ${montantRestant}`);
          } else {
            db.query(updateMontant, [montantTotalPaye, req.body.id_commande], (errorUpdate, dataUpdate) => {
              if (errorUpdate) {
                res.status(500).json(errorUpdate);
              } else {
                res.json('Processus réussi');
              }
            });
          }
        }
      });
    }
  });
};

exports.deletePaiement = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM paiement WHERE id_paiement = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
}


exports.getEchangeOne = (req, res) => {
  const {id} = req.params;

  const { start_date, end_date } = req.query;
  const q = `
  SELECT vente.*, users.username, varianteproduit.img, varianteproduit.id_varianteProduit, client.nom AS nom_client,client.telephone, marque.nom AS nom_marque, taille.taille AS pointure, produit.nom_produit, commande.id_shop, couleur.description, taille.id_taille
      FROM vente
  INNER JOIN users ON vente.id_livreur = users.id
  INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON vente.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      WHERE vente.est_supprime = 0 AND commande.id_commande = ${id}
      ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
      ORDER BY vente.date_vente DESC;
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Options
exports.getOptions = (req, res) => {

  const q = `SELECT * FROM options`

              db.query(q ,(error, data)=>{
                if(error) res.status(500).send(error)
                return res.status(200).json(data);
            })
}


/* exports.postEchangeLivraison = (req, res) => {
  const insertQuery =
    'INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package, id_livreur, id_detail_commande, user_cr) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
  const qInsertMouvement =
    'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`, `id_commande`, `id_fournisseur`, `description`) VALUES(?,?,?,?,?,?,?,?)';
   const selectVenteQuery = 'SELECT quantite FROM vente WHERE id_detail_commande = ?';
  const selectDetailCommande = 'SELECT id_varianteProduit, quantite FROM detail_commande WHERE id_detail = ?'
   const updateVenteQuery = 'UPDATE vente SET quantite = ?, id_detail_commande = ? WHERE id_detail_commande = ?';
  const qUpdateStock = 'UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?';
  const qStockeTaille = 'SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?';

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

  const valuesDetail = [
    req.body.id_commande,
    req.body.quantite_prix,
    req.body.id_varianteProduit,
    req.body.qte_livre,
    req.body.qte_commande,
    req.body.prix,
    req.body.package,
    req.body.id_package,
    req.body.id_livreur,
    req.body.id_detail_commande,
    req.body.user_cr
  ];

  const idVarianteProduit = req.body.id_varianteProduit;

  db.query(qStockeTaille, [idVarianteProduit], (error, stockTailleData) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      const stockTailleActuel = stockTailleData[0].stock;

      let newStockTaille;

      if (parseInt(req.body.id_type_mouvement) === 7) {
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
        newStockTaille = stockTailleActuel;
      }

      db.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
        } else {
          db.query(qInsertMouvement, valuesMouv, (error, mouvementData) => {
            if (error) {
              res.status(500).json(error);
              console.log(error);
            } else {
              db.query(insertQuery, valuesDetail, (insertError, insertData) => {
                if (insertError) {
                  res.status(500).json(insertError);
                  console.log(insertError);
                } else {
                  // Récupérer la quantité de vente actuelle
                  db.query(selectVenteQuery, [req.body.id_detail_commande], (selectError, selectData) => {
                    if (selectError) {
                      res.status(500).json(selectError);
                      console.log(selectError);
                    } else {
                      const quantiteVenteActuelle = selectData[0].quantite;

                      // Effectuer les échanges ou les modifications nécessaires sur la quantité de vente
                      const nouvelleQuantiteVente = quantiteVenteActuelle - req.body.quantite;
                      db.query(updateVenteQuery, [nouvelleQuantiteVente, req.body.id_detail_commande, req.body.id_detail_commande], (updateError, updateVenteData) => {
                        if (updateError) {
                          res.status(500).json(updateError);
                          console.log(updateError);
                        } else {
                          res.json('Processus réussi');
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}; */


exports.postEchangeLivraison = (req, res) => {
  const insertQuery =
    'INSERT INTO detail_livraison (id_commande, quantite_prix, id_varianteProduit, qte_livre, qte_commande, prix, package, id_package, id_livreur, id_detail_commande, user_cr) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
  const qInsertMouvement =
    'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`, `id_commande`, `id_fournisseur`, `description`) VALUES(?,?,?,?,?,?,?,?)';
  const selectDetailCommande = 'SELECT id_varianteProduit, quantite FROM detail_commande WHERE id_detail = ?';
  const qUpdateStock = 'UPDATE varianteproduit SET stock = stock + ? WHERE id_varianteProduit = ?';
  const qStockeTaille = 'SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?';
  const insertDetailCommande = `
    INSERT INTO detail_commande(id_commande, id_varianteProduit, id_client, prix, statut_demande, description, id_taille, quantite, user_cr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const qUpdateStockEchange = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;

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

  const insertDetail = [
    req.body.id_commande,
    req.body.id_varianteProduit,
    req.body.id_client,
    req.body.prix,
    req.body.statut_demande,
    req.body.description,
    req.body.id_taille,
    req.body.quantite,  
    req.body.id_user_cr
  ];

  const idDetailCommande = req.body.id_detail_commande;

  db.query(selectDetailCommande, [idDetailCommande], (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      const stockTailleActuel = data[0].quantite;
      const idVarianteProduit = data[0].id_varianteProduit;

      db.query(qStockeTaille, [idVarianteProduit], (errorStock, dataStock) => {
        if (errorStock) {
          res.status(500).json(errorStock);
          console.log(errorStock);
        } else {
          const stock = dataStock[0].stock;

          const newStockTaille = parseInt(stock) + parseInt(stockTailleActuel);

          db.query(qUpdateStock, [stockTailleActuel, idVarianteProduit], (error, dataUpdate) => {
            if (error) {
              res.status(500).json(error);
              console.log(error);
            } else {
              db.query(qInsertMouvement, valuesMouv, (error, mouvementData) => {
                if (error) {
                  res.status(500).json(error);
                  console.log(error);
                } else {

                  db.query(insertDetailCommande, insertDetail, (errorCommande, dataCommande)=>{
                    if (errorCommande) {
                      res.status(500).json(errorCommande);
                      console.log(errorCommande);
                    } else{
                      const id_detail = dataCommande.insertId;

                      const valuesDetail = [
                        req.body.id_commande,
                        req.body.quantite_prix,
                        req.body.id_varianteProduit,
                        req.body.qte_livre,
                        req.body.qte_commande,
                        req.body.prix,
                        req.body.package,
                        req.body.id_package,
                        req.body.id_livreur,
                        id_detail,
                        req.body.user_cr
                      ];

                      db.query(insertQuery, valuesDetail, (insertError, insertData) => {
                        if (insertError) {
                          res.status(500).json(insertError);
                          console.log(insertError);
                        } else {
/*                           res.status(200).json({ message: 'Échange de livraison effectué avec succès.' }); */
                          db.query(qStockeTaille,[ req.body.id_varianteProduit],(insertQError,dataQ) => {
                            if(insertQError){
                              res.status(500).json(insertQError);
                              console.log(insertQError)
                            } else{
                              const stockTailleActuel = dataQ[0].stock

                              let newStock = stockTailleActuel - parseInt(req.body.qte_commande);

                              console.log(newStock)
                              db.query(qUpdateStockEchange,[newStock,req.body.id_varianteProduit],(errorStockUpdate, dataStockUpdate)=> {
                                if(errorStockUpdate){
                                  res.status(500).json(errorStockUpdate)
                                  console.log(errorStockUpdate)
                                } else{
                                  res.status(200).json({ message: 'Échange de livraison effectué avec succès.' });
                                }
                              })
                            }
                          }) 
                        }
                      });
                    }
                  })
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.postVenteEchange = (req, res) => {
  const idEchange = req.params.idEchange;
  const idDetail = req.params.idDetail;
  const idVariant = req.params.idVariant;
  
  const updateVenteQuery = `UPDATE vente SET id_detail_commande = ${idDetail} WHERE id_detail_commande = ${idEchange}`;
  const qLivraison = `UPDATE detail_livraison SET vu_livreur = 1 WHERE id_varianteProduit = ${idVariant}`;

  db.query(updateVenteQuery,(error,dataEchange) =>{
    if(error){
      res.status(500).json(error);
      console.log(error);
    }
    else{
      db.query(qLivraison, (errorLivraison, dataLivraison)=>{
        if(errorLivraison){
          res.status(500).json(errorLivraison)
          console.log(errorLivraison)
        } else{
          res.json('Processus réussi');
        }
      })
    }
  })
}