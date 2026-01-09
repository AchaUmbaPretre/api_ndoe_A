const { db } = require("./../config/db.js");
const dotenv = require('dotenv');

dotenv.config();

exports.getProduitCount = (req, res) => {
  const q = "SELECT SUM(vp.stock) AS total FROM varianteproduit vp WHERE est_supprime = 0";

  db.query(q ,(error, data)=>{
    if(error) res.status(500).send(error)

    return res.status(200).json(data);
})
};

exports.getProduit = (req, res) => {
  const { id_marque, categorie, page = 1, pageSize = 15 } = req.query;

  // Calcul pour la pagination
  const offset = (page - 1) * pageSize;

  // Requête pour le total
  let countQuery = `
    SELECT COUNT(*) AS total
    FROM produit
    INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
    INNER JOIN famille ON categorie.id_famille = famille.id_famille
    WHERE produit.est_supprime = 0
  `;

  const countParams = [];

  if (id_marque) {
    countQuery += ` AND marque.id_marque = ?`;
    countParams.push(id_marque);
  }

  if (categorie) {
    countQuery += ` AND categorie.id_categorie = ?`;
    countParams.push(categorie);
  }

  // Requête pour récupérer les produits
  let q = `
    SELECT produit.*, categorie.nom_categorie, marque.nom AS nom_marque, 
           matiere.nom_matiere, famille.nom AS nom_famille, vp.img 
    FROM produit
    INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
    INNER JOIN famille ON categorie.id_famille = famille.id_famille
    LEFT JOIN varianteproduit vp ON produit.id_produit = vp.id_produit
    WHERE produit.est_supprime = 0
  `;

  const params = [];

  if (id_marque) {
    q += ` AND marque.id_marque = ?`;
    params.push(id_marque);
  }

  if (categorie) {
    q += ` AND categorie.id_categorie = ?`;
    params.push(categorie);
  }

  q += `
    GROUP BY produit.code_variante
    ORDER BY produit.date_entrant
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(pageSize), parseInt(offset));

  db.query(countQuery, countParams, (error, countResult) => {
    if (error) {
      console.error("Database count query error: ", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }

    const totalItems = countResult[0].total;

    db.query(q, params, (error, data) => {
      if (error) {
        console.error("Database query error: ", error);
        return res.status(500).json({ message: "Erreur serveur", error });
      }

      return res.status(200).json({ data, total: totalItems });
    });
  });
};

exports.getProduitOne = (req,res) => {

  const {id} = req.params;
  const q = `SELECT produit.*, categorie.nom_categorie,
                marque.nom AS nom_marque, matiere.nom_matiere,
                famille.nom AS nom_famille, famille.id_famille, cible.nom_cible
              FROM produit
              INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
              INNER JOIN marque ON produit.id_marque = marque.id_marque
              INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
              INNER JOIN famille ON categorie.id_famille = famille.id_famille
              INNER JOIN cible ON produit.id_cible = cible.id_cible
            WHERE est_supprime = 0 AND produit.id_produit = ?`;

  db.query(q, id, (error, data) => {
    if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getProduitTotalAchats = (req, res) => {
    const q = `
      SELECT
        SUM(prix) AS achats_total
      FROM
        chaussures
    `;

    db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
    });
  };

exports.getProduitRecement = (req, res) => {
    try {
      const q = `
        SELECT
          varianteproduit.img, taille.taille, couleur.description, marque.nom, taille_pays.prix, varianteproduit.id_varianteProduit,
          CASE
            WHEN varianteproduit.stock > 0 THEN 'Actif'
            ELSE 'Inactif'
          END AS statut
        FROM
          varianteproduit
          INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
          INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
          INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
          INNER JOIN marque ON produit.id_marque = marque.id_marque
          INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
        WHERE
          varianteproduit.est_supprime = 0
        GROUP BY varianteproduit.code_variant
        ORDER BY varianteproduit.created_at DESC
        LIMIT 5
      `;
    
      db.query(q, (error, data) => {
        if (error) {
          throw new Error('Erreur lors de la récupération des produits récemment ajoutés.');
        } else {
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.postProduit = (req, res) => {
    const qProduit = 'INSERT INTO produit(`nom_produit`,`id_categorie`,`id_marque`,`id_matiere`,`actif`,`date_entrant`,`date_MisAjour`,`id_cible`, `prix`, `code_variante`, `etatProduit`) VALUES(?)';
    const valuesProduit = [
      req.body.nom_produit,
      req.body.id_categorie,
      req.body.id_marque,
      req.body.id_matiere,
      req.body.actif,
      req.body.date_entrant,
      req.body.date_MisAjour,
      req.body.id_cible,
      req.body.prix,
      req.body.code_variante,
      req.body.etatProduit
    ];
  
    db.query(qProduit, [valuesProduit], (errorProduit, dataProduit) => {
      if (errorProduit) {
        res.status(500).json(errorProduit);
      } else {
        return res.json({ message: 'Processus réussi' });
      }
    });
  };

/* exports.deleteProduit = (req, res) => {
    const {id} = req.params;
    const q = "UPDATE produit SET est_supprime = 1 WHERE id_produit = ?";
  
    db.query(q, [id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  }; */
exports.putPutStatusProduit = (req, res) => {
    const {id} = req.params;
  const q = `UPDATE produit
            SET etatProduit = CASE
              WHEN etatProduit = 'Actif' THEN 'Inactif'
              WHEN etatProduit = 'Inactif' THEN 'Actif'
              ELSE etatProduit
            END
            WHERE id_produit = ${id};`
  db.query(q, (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  }

exports.deleteProduit = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM produit WHERE id_produit = ?";
  
    db.query(q, [id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  };

exports.putProduit = (req, res) => {
    const productId = req.params.id;
  
    const q = 'UPDATE produit SET nom_produit = ?, couleur = ?, matiere = ?, marque = ?, pointure = ?, categorie = ?, description = ?, img = ? WHERE id = ?';
    const values = [
      req.body.nom_produit,
      req.body.couleur,
      req.body.matiere,
      req.body.marque,
      req.body.pointure,
      req.body.categorie,
      req.body.description,
      req.body.img,
      productId 
    ];
  
    db.query(q, values, (error, data) => {
      if (error) {
        console.log(error);
        res.status(500).json(error);
      } else {
        const updatedRows = data.affectedRows;
  
        if (updatedRows === 0) {
          return res.status(404).json({ error: 'Produit non trouvé' });
        }
  
        const shoeQ = 'UPDATE chaussures SET quantite_stock = ?, emplacement = ?, prix = ? WHERE produit_id = ?';
        const shoeValues = [
          req.body.quantite_stock,
          req.body.emplacement,
          req.body.prix,
          productId 
        ];
  
        db.query(shoeQ, shoeValues, (error, data) => {
          if (error) {
            console.error('Erreur lors de la mise à jour des données de la chaussure :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour des données de la chaussure' });
            return;
          }
  
          return res.json({ message: 'Produit mis à jour avec succès' });
        });
      }
    });
  };

  //Code variant Produit
exports.getCodeVariantProduit = (req, res) => {

  const q = `SELECT code_variante FROM produit GROUP BY code_variante;`
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Code variant
exports.getCodeVariant = (req, res) => {

  const q = `SELECT code_variant FROM varianteproduit GROUP BY code_variant;`
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Variant produit
exports.getVariantProduit = (req, res) => {
  try {
    const q = `SELECT varianteproduit.*, img, COUNT(*) as count, produit.etatProduit
    FROM varianteproduit
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    GROUP BY img
    HAVING MAX(produit.etatProduit) = 'Actif';
      `;
     
    db.query(q, (error, data) => {
      if (error) {
        throw new Error('Erreur lors de la récupération des variantes de produit.'); // Lancer une erreur pour être capturée par le bloc catch
      } else {
        res.status(200).json(data);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Capturer et renvoyer l'erreur au client avec un message d'erreur personnalisé
  }
};

exports.getVariantProduitAll = (req, res) => {

    const q = `SELECT varianteproduit.*
                FROM varianteproduit             
    `;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
  }

exports.getListeVariantProduit = (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const id_cat = req.query.id_cat !== 'undefined' ? req.query.id_cat : null;
    const id_marque = req.query.id_marque !== 'undefined' ? req.query.id_marque : null;
    const start_date = req.query.start_date !== 'undefined' ? req.query.start_date : null;
    const end_date = req.query.end_date !== 'undefined' ? req.query.end_date : null;
  
    const query = `
      SELECT SUM(vp.stock * tp.prix) AS total, 
             tp.prix AS montant_total_achats, 
             taille.taille, 
             produit.nom_produit, 
             vp.id_varianteProduit, 
             vp.code_variant, 
             marque.nom AS nom_marque, 
             vp.stock AS total_stock, 
             vp.img,
             categorie.nom_categorie,
             vp.created_at
      FROM varianteproduit vp
      INNER JOIN taille_pays tp ON vp.id_taille = tp.id_taille 
                              AND vp.id_couleur = tp.id_couleur 
                              AND vp.code_variant = tp.code_variant 
      INNER JOIN taille ON taille.id_taille = vp.id_taille 
      INNER JOIN produit ON vp.id_produit = produit.id_produit 
      INNER JOIN marque ON marque.id_marque = produit.id_marque 
      INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
      WHERE produit.est_supprime = 0
      ${id_cat ? `AND categorie.id_categorie = ?` : ''}
      ${id_marque ? `AND marque.id_marque = ?` : ''}
      ${start_date ? `AND DATE(vp.created_at) >= ?` : ''}
      ${end_date ? `AND DATE(vp.created_at) <= ?` : ''}
      GROUP BY vp.id_varianteProduit
      LIMIT ?, ?;
    `;
  
    // Requête pour compter le nombre total d'éléments sans pagination
    const countQuery = `
      SELECT COUNT(DISTINCT vp.id_varianteProduit) AS TotalItems
      FROM varianteproduit vp
      INNER JOIN taille_pays tp ON vp.id_taille = tp.id_taille 
                              AND vp.id_couleur = tp.id_couleur 
                              AND vp.code_variant = tp.code_variant 
      INNER JOIN taille ON taille.id_taille = vp.id_taille 
      INNER JOIN produit ON vp.id_produit = produit.id_produit 
      INNER JOIN marque ON marque.id_marque = produit.id_marque 
      INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
      WHERE produit.est_supprime = 0
      ${id_cat ? `AND categorie.id_categorie = ?` : ''}
      ${id_marque ? `AND marque.id_marque = ?` : ''}
      ${start_date ? `AND DATE(vp.created_at) >= ?` : ''}
      ${end_date ? `AND DATE(vp.created_at) <= ?` : ''}
    `;
  
    // Paramètres pour les requêtes
    const params = [
      ...(id_cat ? [id_cat] : []),
      ...(id_marque ? [id_marque] : []),
      ...(start_date ? [start_date] : []),
      ...(end_date ? [end_date] : [])
    ];
  
    db.query(countQuery, params, (countError, countResult) => {
      if (countError) {
        console.error('Erreur lors du comptage des variantes de produits :', countError);
        return res.status(500).send('Une erreur est survenue lors du comptage des variantes de produits.');
      }
  
      const totalItems = countResult[0].TotalItems;
  
      // Ajoute les paramètres de pagination
      const paginatedParams = [...params, (page - 1) * pageSize, parseInt(pageSize)];
  
      db.query(query, paginatedParams, (error, data) => {
        if (error) {
          console.error('Erreur lors de la récupération des variantes de produits :', error);
          return res.status(500).send('Une erreur est survenue lors de la récupération des variantes de produits.');
        }
  
        return res.status(200).json({
          data,
          totalItems: totalItems,
          currentPage: parseInt(page),
          pageSize: parseInt(pageSize),
        });
      });
    });
  };
  
  
exports.getVariantProduitOne = (req, res) => {
    const { id } = req.params;
  
    const q = `
      SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
        categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible,cible.id_cible, taille.taille AS pointure, pays.code_pays, pays.id_pays,
        couleur.description, taille_pays.prix, famille.nom AS nom_famille, famille.id_famille
      FROM varianteproduit
        INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
        INNER JOIN marque ON produit.id_marque = marque.id_marque
        INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
        INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
        INNER JOIN cible ON produit.id_cible = cible.id_cible
        INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
        INNER JOIN pays ON taille.id_pays = pays.id_pays
        INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
        INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
        INNER JOIN famille ON categorie.id_famille = famille.id_famille 
      WHERE varianteproduit.id_varianteProduit = '${id}'
      GROUP BY varianteproduit.id_varianteProduit
      ORDER BY taille.taille DESC 
    `;
    
    db.query(q, (error, data) => {
      if (error) return res.status(500).send(error);
      return res.status(200).json(data);
    });
  };

exports.getMouvementVariante = (req,res) => {
  const {id} = req.params;

  const q = `SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
  categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible, taille.taille AS pointure, pays.code_pays,
  couleur.description, taille_pays.prix, famille.nom AS nom_famille
FROM varianteproduit
INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
INNER JOIN marque ON produit.id_marque = marque.id_marque
INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
INNER JOIN cible ON produit.id_cible = cible.id_cible
INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
INNER JOIN pays ON taille.id_pays = pays.id_pays
INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
INNER JOIN taille_pays ON taille.id_taille = taille_pays.id_taille
INNER JOIN famille ON categorie.id_famille = famille.id_famille 
WHERE produit.id_produit = '${id}'
GROUP BY varianteproduit.id_varianteproduit
ORDER BY taille.taille DESC;
  `
  db.query(q, (error, data) => {
    if (error) return res.status(500).send(error);
    return res.status(200).json(data);
  });
};

exports.getVariantProduitFiltrage = (req, res) => {
  const safeSplit = (value) => {
    if (typeof value !== 'string') return [];
    return value
      .split(',')
      .map(v => v.trim())
      .filter(v => v && v !== 'null');
  };
  
  const familleFilter = safeSplit(req.query.id_famille);
  const marqueFilter = safeSplit(req.query.id_marque);
  const cibleFilter = safeSplit(req.query.id_cible);
  const tailleFilter = safeSplit(req.query.id_taille);
  const couleurFilter = safeSplit(req.query.id_couleur);
  const matiereFilter = safeSplit(req.query.id_matiere);

  // Construction sécurisée de la requête SQL
  let conditions = [];
  let params = [];

  if (familleFilter.length > 0) {
    conditions.push(`famille.id_famille IN (${familleFilter.map(() => '?').join(',')})`);
    params.push(...familleFilter);
  }

  if (marqueFilter.length > 0) {
    conditions.push(`marque.id_marque IN (${marqueFilter.map(() => '?').join(',')})`);
    params.push(...marqueFilter);
  }

  if (cibleFilter.length > 0) {
    conditions.push(`cible.id_cible IN (${cibleFilter.map(() => '?').join(',')})`);
    params.push(...cibleFilter);
  }

  if (tailleFilter.length > 0) {
    conditions.push(`taille.id_taille IN (${tailleFilter.map(() => '?').join(',')})`);
    params.push(...tailleFilter);
  }

  if (couleurFilter.length > 0) {
    conditions.push(`couleur.id_couleur IN (${couleurFilter.map(() => '?').join(',')})`);
    params.push(...couleurFilter);
  }

  if (matiereFilter.length > 0) {
    conditions.push(`matiere.id_matiere IN (${matiereFilter.map(() => '?').join(',')})`);
    params.push(...matiereFilter);
  }

  const q = `SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
    categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible, taille.taille AS pointure, pays.code_pays,
    couleur.description, taille_pays.prix, famille.nom AS nom_famille
    FROM varianteproduit
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
    INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
    INNER JOIN cible ON produit.id_cible = cible.id_cible
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    INNER JOIN pays ON taille.id_pays = pays.id_pays
    INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
    INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
    INNER JOIN famille ON categorie.id_famille = famille.id_famille 
    WHERE produit.est_supprime = 0 AND produit.etatProduit = 'Actif'
    ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
    GROUP BY varianteproduit.img`;

  db.query(q, params, (error, data) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send(error);
    }
    return res.status(200).json(data);
  });
};

exports.getVariantProduitFiltrageMarque = (req, res) => {
    const marqueFilter = req.params.id.split(',');

    const q = `SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
            categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible, taille.taille AS pointure, pays.code_pays,
            couleur.description, taille_pays.prix, famille.nom AS nom_famille
            FROM varianteproduit
            INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
            INNER JOIN marque ON produit.id_marque = marque.id_marque
            INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
            INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
            INNER JOIN cible ON produit.id_cible = cible.id_cible
            INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
            INNER JOIN pays ON taille.id_pays = pays.id_pays
            INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
            INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
            INNER JOIN famille ON categorie.id_famille = famille.id_famille 
              WHERE marque.id_marque IN (${marqueFilter.map(marque =>`'${marque}'`).join(',')})
            GROUP BY varianteproduit.img
            `;
  
    db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
    });
  };

exports.getVariantProduitFiltrageCible = (req, res) => {
    const cibleFilter = req.params.id.split(',');

    const q = `SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
              categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible, taille.taille AS pointure, pays.code_pays,
              couleur.description, taille_pays.prix, famille.nom AS nom_famille
              FROM varianteproduit
              INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
              INNER JOIN marque ON produit.id_marque = marque.id_marque
              INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
              INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
              INNER JOIN cible ON produit.id_cible = cible.id_cible
              INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
              INNER JOIN pays ON taille.id_pays = pays.id_pays
              INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
              INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
              INNER JOIN famille ON categorie.id_famille = famille.id_famille 
                WHERE cible.id_cible IN (${cibleFilter.map(filter =>`'${filter}'`).join(',')}) 
              GROUP BY varianteproduit.img`;
  
    db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
    });
  };

exports.getVariantProduitFiltrageTaille = (req, res) => {
    const tailleFilter = req.params.id.split(',');;

    const q = `SELECT varianteproduit.*, produit.nom_produit, produit.date_entrant, marque.nom AS nom_marque,
                categorie.nom_categorie, matiere.nom_matiere, cible.nom_cible, taille.taille AS pointure, pays.code_pays,
                couleur.description, taille_pays.prix, famille.nom AS nom_famille
                FROM varianteproduit
                INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit 
                INNER JOIN marque ON produit.id_marque = marque.id_marque
                INNER JOIN categorie ON produit.id_categorie = categorie.id_categorie
                INNER JOIN matiere ON produit.id_matiere = matiere.id_matiere
                INNER JOIN cible ON produit.id_cible = cible.id_cible
                INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
                INNER JOIN pays ON taille.id_pays = pays.id_pays
                INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
                INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
                INNER JOIN famille ON categorie.id_famille = famille.id_famille 
                  WHERE taille.id_taille IN (${tailleFilter.map(taille =>`'${taille}'`).join(',')})
                GROUP BY varianteproduit.img
              `;
  
    db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
    });
};

exports.postVariantProduit = (req, res) => {

  const photoFile = req.file; // Fichier téléchargé
  const photoUrl = `/uploads/${photoFile.filename}`
  res.setHeader('Content-Type', 'multipart/form-data');

  const qVarianteProduit =
    'INSERT INTO varianteproduit(`id_produit`, `id_taille`, `id_couleur`, `stock`, `code_variant`,`img`) VALUES (?, ?, ?, ?, ?, ?)';
  const valuesVariante = [
    req.body.id_produit,
    req.body.id_taille,
    req.body.id_couleur,
    req.body.stock,
    req.body.code_variant,
    photoUrl
  ];

  const qTaillePays =
    'INSERT INTO taille_pays(`id_taille`, `id_pays`, `id_couleur`, `stock`, `prix`, `code_variant`) VALUES (?, ?, ?, ?, ?, ?)';
  const valuesTaillePays = [
    req.body.id_taille,
    req.body.id_pays,
    req.body.id_couleur,
    req.body.stock,
    req.body.prix,
    req.body.code_variant,
  ]; 

  const checkVariantQuery = 'SELECT id_produit, stock FROM varianteproduit WHERE code_variant = ? AND id_taille = ?';
  const codeVariant = req.body.code_variant;
  const idTaille = req.body.id_taille;

  try {
    db.query(checkVariantQuery, [codeVariant, idTaille], (error, results) => {
      if (error) {
        throw new Error('Erreur lors de la vérification de la variante.'); // Lancer une erreur pour être capturée par le bloc catch
      } else {
        if (results.length > 0) {
          // La variante existe déjà, vous pouvez modifier la quantité du stock existant
          const existingVariant = results[0];
          const newStock = parseInt(existingVariant.stock) + parseInt(req.body.stock);
          // Mettre à jour la quantité du stock pour la variante existante
          const updateStockQuery = 'UPDATE varianteproduit SET stock = ? WHERE id_produit = ? AND id_taille = ?';
          const updateStockValues = [newStock, existingVariant.id_produit, idTaille];

          db.query(updateStockQuery, updateStockValues, (updateError, updateResults) => {
            if (updateError) {
              throw new Error('Erreur lors de la mise à jour de la quantité de stock.'); // Lancer une erreur pour être capturée par le bloc catch
            } else {
              // Répondre avec succès
              res.json({ message: 'Processus réussi' });
            }
          });
        } else {
          // La variante n'existe pas, vous pouvez insérer une nouvelle variante
          db.query(qVarianteProduit, valuesVariante, (errorVariante, dataVariante) => {
            if (errorVariante) {
              throw new Error(errorVariante); // Lancer une erreur pour être capturée par le bloc catch
            } else {
              // Insérer les informations dans la table taille_pays
              db.query(qTaillePays, valuesTaillePays, (errorTaillePays, dataTaillePays) => {
                if (errorTaillePays) {
                  throw new Error('Erreur lors de l\'insertion des informations dans la table taille_pays.'); // Lancer une erreur pour être capturée par le bloc catch
                } else {
                  res.json({ message: 'Processus réussi' });
                }
              });
            }
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message }); // Capturer et renvoyer l'erreur au client avec un message d'erreur personnalisé
  }
};

exports.putVariantProduit = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid variant ID provided' });
  }

  try {
      const q = `
          UPDATE varianteproduit
          SET 
              stock = ?
          WHERE id_varianteProduit = ?
      `;
    
      const values = [stock, id];

      db.query(q, values, (error, data)=>{
          if(error){
              console.log(error)
              return res.status(404).json({ error: 'user record not found' });
          }
          return res.json({ message: 'User record updated successfully' });
      })
  } catch (err) {
      console.error("Error updating user :", err);
      return res.status(500).json({ error: 'Failed to update user record' });
  }
};

exports.postEntreeStock = (req, res) => {

  const qVarianteProduit =
    'INSERT INTO varianteproduit(`id_produit`, `id_taille`, `id_couleur`, `stock`, `code_variant`,`img`) VALUES (?, ?, ?, ?, ?, ?)';
  const valuesVariante = [
    req.body.id_produit,
    req.body.id_taille,
    req.body.id_couleur,
    req.body.stock,
    req.body.code_variant,
    req.body.img
  ];

  const qTaillePays =
    'INSERT INTO taille_pays(`id_taille`, `id_pays`, `id_couleur`, `stock`, `prix`, `code_variant`) VALUES (?, ?, ?, ?, ?, ?)';
  const valuesTaillePays = [
    req.body.id_taille,
    req.body.id_pays,
    req.body.id_couleur,
    req.body.stock,
    req.body.prix,
    req.body.code_variant,
  ];

  const checkVariantQuery = 'SELECT id_produit, stock, id_varianteProduit FROM varianteproduit WHERE code_variant = ? AND id_taille = ?';
  const codeVariant = req.body.code_variant;
  const idTaille = req.body.id_taille;

  const qReception = 'INSERT INTO reception(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `userId`) VALUES (?, ?, ?, ?)';

  try {
    db.query(checkVariantQuery, [codeVariant, idTaille], (error, results) => {
      if (error) {
        throw new Error('Erreur lors de la vérification de la variante.');
      } else {
        if (results.length > 0) {
          const existingVariant = results[0];
          const newStock = parseInt(existingVariant.stock) + parseInt(req.body.stock);
          const updateStockQuery = 'UPDATE varianteproduit SET stock = ? WHERE id_produit = ? AND id_taille = ?';
          const updateStockValues = [newStock, existingVariant.id_produit, idTaille];

          db.query(updateStockQuery, updateStockValues, (updateError, updateResults) => {
            if (updateError) {
              throw new Error('Erreur lors de la mise à jour de la quantité de stock.');
            } else {
              const insertId = existingVariant.id_varianteProduit;
              const varianteInfo = [insertId, 10, req.body.stock, req.body.userId];

              db.query(qReception, varianteInfo, (error, resultRec) => {
                if (error) {
                  console.log(error);
                  res.status(500).json({ error: 'Erreur lors de l\'insertion des informations dans la table reception.' });
                } else {
                  res.json({ message: 'Processus réussi' });
                }
              });
            }
          });
        } else {
          db.query(qVarianteProduit, valuesVariante, (errorVariante, dataVariante) => {
            if (errorVariante) {
              throw new Error(errorVariante);
            } else {
              const insertId = dataVariante.insertId;
              const varianteInfo = [insertId, 10, req.body.stock, req.body.userId];

              db.query(qReception, varianteInfo, (error, resultRec) => {
                if (error) {
                  throw new Error('Erreur lors de l\'insertion des informations dans la table reception.');
                } else {
                  db.query(qTaillePays, valuesTaillePays, (errorTaillePays, dataTaillePays) => {
                    if (errorTaillePays) {
                      throw new Error('Erreur lors de l\'insertion des informations dans la table taille_pays.');
                    } else {
                      res.json({ message: 'Processus réussi' });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReception = (req, res) => {

  const { start_date, end_date } = req.query;

  const q = `SELECT reception.created_at AS date_reception, 
              COUNT(*) AS nombre_paires,
              SUM(reception.quantite) AS quantite_totale,
              vp.img, m.nom AS nom_marque, c.nom_categorie, famille.nom, matiere.nom_matiere,
              cible.nom_cible, taille.taille, couleur.description, type_mouvement.type_mouvement,
              users.username
            FROM reception
              INNER JOIN varianteproduit vp ON reception.id_varianteProduit = vp.id_varianteProduit
              INNER JOIN produit p ON vp.id_produit = p.id_produit
              INNER JOIN marque m ON p.id_marque = m.id_marque
              INNER JOIN categorie c ON p.id_categorie = c.id_categorie
              INNER JOIN famille ON c.id_famille = famille.id_famille
              INNER JOIN matiere ON p.id_matiere = matiere.id_matiere
              INNER JOIN cible ON p.id_cible = cible.id_cible
              INNER JOIN taille ON vp.id_taille = taille.id_taille
              INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
              INNER JOIN type_mouvement ON reception.id_type_mouvement = type_mouvement.id_type_mouvement
              LEFT JOIN users ON reception.userId = users.id
            WHERE p.est_supprime = 0
              ${start_date ? `AND DATE(reception.created_at) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(reception.created_at) <= '${end_date}'` : ''}
            GROUP BY DATE(reception.created_at)
            ORDER BY reception.created_at DESC;
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
};

exports.getReceptionJour = (req, res) => {

  const q = `SELECT reception.created_at AS date_reception, 
              COUNT(*) AS nombre_paires,
              SUM(reception.quantite) AS quantite_totale,
              vp.img, m.nom AS nom_marque, c.nom_categorie, famille.nom, matiere.nom_matiere,
              cible.nom_cible, taille.taille, couleur.description, type_mouvement.type_mouvement,
              users.username
            FROM reception
              INNER JOIN varianteproduit vp ON reception.id_varianteProduit = vp.id_varianteProduit
              INNER JOIN produit p ON vp.id_produit = p.id_produit
              INNER JOIN marque m ON p.id_marque = m.id_marque
              INNER JOIN categorie c ON p.id_categorie = c.id_categorie
              INNER JOIN famille ON c.id_famille = famille.id_famille
              INNER JOIN matiere ON p.id_matiere = matiere.id_matiere
              INNER JOIN cible ON p.id_cible = cible.id_cible
              INNER JOIN taille ON vp.id_taille = taille.id_taille
              INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
              INNER JOIN type_mouvement ON reception.id_type_mouvement = type_mouvement.id_type_mouvement
              LEFT JOIN users ON reception.userId = users.id
            WHERE p.est_supprime = 0 AND DATE(reception.created_at) = CURDATE()
            GROUP BY DATE(reception.created_at)
            ORDER BY reception.created_at DESC;
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
};

exports.getReceptionJour7 = (req, res) => {

  const q = `SELECT reception.created_at AS date_reception, 
              COUNT(*) AS nombre_paires,
              SUM(reception.quantite) AS quantite_totale,
              vp.img, m.nom AS nom_marque, c.nom_categorie, famille.nom, matiere.nom_matiere,
              cible.nom_cible, taille.taille, couleur.description, type_mouvement.type_mouvement,
              users.username
            FROM reception
              INNER JOIN varianteproduit vp ON reception.id_varianteProduit = vp.id_varianteProduit
              INNER JOIN produit p ON vp.id_produit = p.id_produit
              INNER JOIN marque m ON p.id_marque = m.id_marque
              INNER JOIN categorie c ON p.id_categorie = c.id_categorie
              INNER JOIN famille ON c.id_famille = famille.id_famille
              INNER JOIN matiere ON p.id_matiere = matiere.id_matiere
              INNER JOIN cible ON p.id_cible = cible.id_cible
              INNER JOIN taille ON vp.id_taille = taille.id_taille
              INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
              INNER JOIN type_mouvement ON reception.id_type_mouvement = type_mouvement.id_type_mouvement
              LEFT JOIN users ON reception.userId = users.id
            WHERE p.est_supprime = 0 AND DATE(reception.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(reception.created_at)
            ORDER BY reception.created_at DESC;
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
};

exports.getReceptionOne = (req, res) => {

  const { start_date, end_date, dateId } = req.query;

  const q = `SELECT reception.created_at AS date_reception,
              vp.img, m.nom AS nom_marque, c.nom_categorie, famille.nom, matiere.nom_matiere,
              cible.nom_cible, taille.taille, couleur.description, type_mouvement.type_mouvement,
              reception.quantite AS Qte_recu, vp.stock AS quantite_stock
            FROM reception
              INNER JOIN varianteproduit vp ON reception.id_varianteProduit = vp.id_varianteProduit
              INNER JOIN produit p ON vp.id_produit = p.id_produit
              INNER JOIN marque m ON p.id_marque = m.id_marque
              INNER JOIN categorie c ON p.id_categorie = c.id_categorie
              INNER JOIN famille ON c.id_famille = famille.id_famille
              INNER JOIN matiere ON p.id_matiere = matiere.id_matiere
              INNER JOIN cible ON p.id_cible = cible.id_cible
              INNER JOIN taille ON vp.id_taille = taille.id_taille
              INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
              INNER JOIN type_mouvement ON reception.id_type_mouvement = type_mouvement.id_type_mouvement
            WHERE p.est_supprime = 0
              AND DATE(reception.created_at) = '${dateId}'
              ${start_date ? `AND DATE(reception.created_at) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(reception.created_at) <= '${end_date}'` : ''}
            ORDER BY reception.created_at DESC;
            `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
};

exports.deleteVariantProduit = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM varianteproduit WHERE id_varianteProduit = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};
  
  //Couleur
exports.getCouleur = (req, res) => {

  const q = "SELECT * FROM couleur";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postCouleur = (req, res) => {
  const q = 'INSERT INTO couleur(`description`) VALUES (?)';

  const values = [
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
};

exports.deleteCouleur = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM couleur WHERE id_couleur = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};

//Categorie
exports.getCategorie = (req, res) => {

  const q = "SELECT * FROM categorie INNER JOIN famille ON categorie.id_famille = famille.id_famille";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getCategorieOne = (req, res) => {
  const {id} = req.params;

  const q = "SELECT * FROM categorie WHERE id = ?";
   
  db.query(q, id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postCategorie = (req, res) => {
  const q = 'INSERT INTO categorie(`nom_categorie`,`id_famille`) VALUES (?,?)';

  const values = [
    req.body.nom_categorie,
    req.body.id_famille
  ]

  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
};

exports.deleteCategorie = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM categorie WHERE id = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};

exports.putCategorie = (req, res) => {
  const {id} = req.params;
const q = "UPDATE categorie SET `nom_categorie`= ? WHERE id = ?"
const { nom_categorie } = req.body;


db.query(q, [nom_categorie,id], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
}

//Emplacement
exports.getEmplacement = (req, res) => {

  const q = "SELECT * FROM emplacement";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getEmplacementOne = (req, res) => {
  const {id} = req.params;

  const q = "SELECT * FROM emplacement id_emplacement =?";
   
  db.query(q, id,(error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postEmplacement = (req, res) => {
  const q = 'INSERT INTO emplacement(`shop`, `adresse`, `capacite`) VALUES(?,?,?)';

  const values = [
      req.body.shop,
      req.body.adresse,
      req.body.capacite
  ]
  
  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
};

exports.deleteEmplacement = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM emplacement WHERE id = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};

exports.putEmplacement = (req, res) => {
  const { id } = req.params;

  const q = "UPDATE emplacement SET `nom` = ?, `capacite` = ? WHERE id = ?";
  const values = [
    req.body.nom,
    req.body.capacite
  ];

  db.query(q, [...values, id], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
};

//Matiere
exports.getMatiere = (req, res) => {

  const q = "SELECT * FROM matiere";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getMatiereOne = (req, res) => {
  const {id} = req.params;

  const q = "SELECT * FROM matiere WHERE id = ?";
   
  db.query(q,[id], (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postMatiere = (req, res) => {
  const q = 'INSERT INTO matiere(`nom_matiere`) VALUES(?)';

  const values = [
      req.body.nom,
  ]
  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
};

exports.deleteMatiere = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM matiere WHERE id = ?";

  db.query(q, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
};

exports.putMatiere = (req, res) => {
  const { id } = req.params;
  const q = "UPDATE matiere SET `nom` = ? WHERE id = ?";
  const values = [
    req.body.nom,
    id
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
};

//Marque
exports.getMarque = (req, res) => {

  const q = "SELECT * FROM marque ";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}


exports.getMarqueOne = (req, res) => {
  const {id} = req.params;
  const q = "SELECT * FROM marque WHERE id = ?";
   
  db.query(q, id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postMarque = (req, res) => {
  const q = 'INSERT INTO marque(`nom`) VALUES(?)';

  const values = [
      req.body.nom,
  ]
  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
};

exports.deleteMarque = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM marque WHERE id = ?";

  db.query(q, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
};

exports.putMarque = (req, res) => {
  const { id } = req.params;
  const q = "UPDATE marque SET `nom` = ? WHERE id = ?";
  const values = [
    req.body.nom,
    id
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
};
//famille
exports.getFamille = (req, res) => {

  const q = "SELECT * FROM famille";
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//cible
exports.getCible = (req, res) => {

  const q = "SELECT * FROM cible";
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//pays
exports.getPays = (req, res) => {

  const q = "SELECT * FROM pays";
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Taille get
exports.getTailleAll = (req, res) => {

  const q = "SELECT * FROM taille GROUP BY taille";
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}


//taille id 
exports.getTaille = (req, res) => {
  const {id} = req.params;

  const q = "SELECT * FROM taille WHERE id_pays = ?";

  db.query(q, id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Categorie des mouvement
exports.getCatMouvement = (req, res) => {

  const q = "SELECT * FROM categorie_mouvement";
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

//Type des mouvement
exports.getTypeMouvement = (req, res) => {

  const q = "SELECT * FROM type_mouvement INNER JOIN categorie_mouvement ON type_mouvement.categorie_mouvement = categorie_mouvement.id_cat_mouvement";
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postTypeMouvement = (req, res) => {
  const q = 'INSERT INTO type_mouvement(`type_mouvement`, `categorie_mouvement`) VALUES(?,?)';

  const values = [
      req.body.type_mouvement,
      req.body.categorie_mouvement
  ]
  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
};

exports.deleteType_mouvement = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM type_mouvement WHERE id = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};

exports.putType_mouvement = (req, res) => {
  const {id} = req.params;
const q = "UPDATE type_mouvement SET `nom_type_mouvement`= ?, `type_mouvement`= ? WHERE id = ?"
const { nom_type_mouvement, type_mouvement} = req.body;


db.query(q, [nom_type_mouvement,type_mouvement, id], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
}

//mouvement
exports.getMouvementALL = (req, res) => {
  const { start_date, end_date, marque_id } = req.query;

  let q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, marque.nom AS nom_marque, taille.taille,client.nom AS nom_client, client.id AS id_client1,client.telephone, users.username AS livreur, SUM(mouvement_stock.quantite) AS total_varianteproduit, users.id AS id_livreur, commune.nom_commune FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
  INNER JOIN users ON detail_livraison.id_livreur = users.id
  LEFT JOIN client ON commande.id_client = client.id
  INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
  INNER JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE detail_commande.est_supprime = 0
    ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= '${end_date}'` : ''}
            `;

    if (marque_id && marque_id !== 'undefined') {
      q += ` AND marque.id_marque = ${marque_id}`;
    }

    q += ' GROUP BY mouvement_stock.id_mouvement';
    q += ' ORDER BY mouvement_stock.date_mouvement DESC';

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementCountJour = (req, res) => {
  const q = `SELECT COUNT(id_mouvement) AS nbre_mouvement_encours,
        (SELECT COUNT(id_mouvement) FROM mouvement_stock WHERE DATE(date_mouvement) = CURDATE() AND mouvement_stock.id_type_mouvement = 4) AS nbre_mouvement_vente
      FROM mouvement_stock
      WHERE DATE(date_mouvement) = CURDATE() AND mouvement_stock.id_type_mouvement = 12;`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getMouvementCountHier = (req, res) => {
  const q = `SELECT COUNT(id_mouvement) AS nbre_mouvement_encours,
              (SELECT COUNT(id_mouvement) FROM mouvement_stock WHERE DATE(date_mouvement) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND mouvement_stock.id_type_mouvement = 4) AS nbre_mouvement_vente
            FROM mouvement_stock
              WHERE DATE(date_mouvement) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND mouvement_stock.id_type_mouvement = 12`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getMouvementCountJour7 = (req, res) => {
  const q = `SELECT COUNT(id_mouvement) AS nbre_mouvement_encours,
        (SELECT COUNT(id_mouvement) FROM mouvement_stock WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND mouvement_stock.id_type_mouvement = 4) AS nbre_mouvement_vente
      FROM mouvement_stock
      WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND mouvement_stock.id_type_mouvement = 12;`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getMouvementCountJour30 = (req, res) => {
  const q = `SELECT COUNT(id_mouvement) AS nbre_mouvement_encours,
        (SELECT COUNT(id_mouvement) FROM mouvement_stock WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND mouvement_stock.id_type_mouvement = 4) AS nbre_mouvement_vente
      FROM mouvement_stock
      WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND mouvement_stock.id_type_mouvement = 12;`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getMouvementCountJour1an = (req, res) => {
  const q = `SELECT COUNT(id_mouvement) AS nbre_mouvement_encours,
        (SELECT COUNT(id_mouvement) FROM mouvement_stock WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND mouvement_stock.id_type_mouvement = 4) AS nbre_mouvement_vente
      FROM mouvement_stock
      WHERE DATE(date_mouvement) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND mouvement_stock.id_type_mouvement = 12;`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getMouvementDepartRapport = (req, res) => {
  const { start_date, end_date, marque_id, searchValue } = req.query;

  let q = `SELECT
  mouvement_stock.*,
  varianteproduit.stock,
  varianteproduit.img,
  marque.nom AS nom_marque,
  taille.taille,
  client.nom AS nom_client,
  client.telephone,
  users.username AS livreur,
  SUM(mouvement_stock.quantite) AS total_varianteproduit,
  users.id AS id_livreur,
  commune.nom_commune,
  (SELECT COUNT(vente.id_vente) FROM vente
    INNER JOIN client ON vente.id_client = client.id
    ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
    ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
  ) AS nbre_vente,
  (SELECT SUM(vente.prix_unitaire) FROM vente
    INNER JOIN client ON vente.id_client = client.id
    ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
    ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
  ) AS prix
FROM mouvement_stock
INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit
INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
INNER JOIN marque ON produit.id_marque = marque.id_marque
INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
INNER JOIN users ON detail_livraison.id_livreur = users.id
INNER JOIN vente ON detail_commande.id_detail = vente.id_detail_commande
LEFT JOIN client ON commande.id_client = client.id
LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
LEFT JOIN commune ON adresse.id_commune = commune.id_commune
WHERE detail_commande.est_supprime = 0
  AND mouvement_stock.id_type_mouvement = 4
    ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= '${end_date}'` : ''}
            `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementDepart = (req, res) => {
  const { start_date, end_date, marque_id } = req.query;

  let q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, marque.nom AS nom_marque, taille.taille,client.nom AS nom_client, client.id AS id_client1,client.telephone, users.username AS livreur, SUM(mouvement_stock.quantite) AS total_varianteproduit, users.id AS id_livreur, commune.nom_commune, vente.prix_unitaire AS prix, taille.id_taille FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
  INNER JOIN users ON detail_livraison.id_livreur = users.id
  INNER JOIN vente ON detail_commande.id_detail = vente.id_detail_commande
  LEFT JOIN client ON commande.id_client = client.id
  LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
  LEFT JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE detail_commande.est_supprime = 0 AND mouvement_stock.id_type_mouvement = 4
    ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= '${end_date}'` : ''}
            `;
  if (marque_id && marque_id !== 'undefined') {
    q += ` AND marque.id_marque = ${marque_id}`;
  }

  q += ' GROUP BY mouvement_stock.id_mouvement';
    q += ' ORDER BY mouvement_stock.date_mouvement DESC';

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const mouvementData = data.map(mouvement => {
      let signe = "";
      if (mouvement.id_type_mouvement === 1) {
        signe = "+";
      } else if (mouvement.id_type_mouvement === 2) {
        signe = "-";
      }
      mouvement.quantite = `${signe}${mouvement.quantite}`;
      return mouvement;
    });

    return res.status(200).json(mouvementData);
  });
};

exports.getMouvementRetourner = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 15;
  const offset = (page - 1) * pageSize;


  const totalQuery = `
    SELECT  COUNT(DISTINCT mouvement_stock.id_mouvement) as total 
    FROM mouvement_stock 
    INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
    INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
    INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit 
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
    INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
    INNER JOIN users ON detail_livraison.id_livreur = users.id
    LEFT JOIN client ON commande.id_client = client.id
    INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
    INNER JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE detail_commande.est_supprime = 0 AND mouvement_stock.id_type_mouvement = 5
  `;

  const mouvementQuery = `
    SELECT mouvement_stock.*, 
           varianteproduit.stock, 
           varianteproduit.img, 
           type_mouvement.type_mouvement, 
           marque.nom AS nom_marque, 
           taille.taille,
           client.nom AS nom_client, 
           client.id AS id_client1,
           client.telephone, 
           users.username AS livreur, 
           SUM(mouvement_stock.quantite) AS total_varianteproduit, 
           users.id AS id_livreur, 
           commune.nom_commune 
    FROM mouvement_stock 
    INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
    INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
    INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit 
    INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
    INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN marque ON produit.id_marque = marque.id_marque
    INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
    INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
    INNER JOIN users ON detail_livraison.id_livreur = users.id
    LEFT JOIN client ON commande.id_client = client.id
    INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
    INNER JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE detail_commande.est_supprime = 0 AND mouvement_stock.id_type_mouvement = 5
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
    LIMIT ? OFFSET ?
  `;

  db.query(totalQuery, (error, totalResult) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const total = totalResult[0].total;

    db.query(mouvementQuery, [pageSize, offset], (error, mouvementData) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const formattedMouvements = mouvementData.map(mouvement => {
        let signe = mouvement.id_type_mouvement === 1 ? '+' : '-';
        mouvement.quantite = `${signe}${mouvement.quantite}`;
        return mouvement;
      });

      // Répondre avec les données formatées et le total
      return res.status(200).json({
        total,
        page,
        pageSize,
        data: formattedMouvements
      });
    });
  });
};


exports.getMouvementEchange = (req, res) => {
  const { start_date, end_date, marque_id } = req.query;

  let q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, marque.nom AS nom_marque, taille.taille,client.nom AS nom_client, client.id AS id_client1,client.telephone, users.username AS livreur, SUM(mouvement_stock.quantite) AS total_varianteproduit, users.id AS id_livreur, commune.nom_commune FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN detail_commande ON mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN detail_livraison ON commande.id_commande = detail_livraison.id_commande
  INNER JOIN users ON detail_livraison.id_livreur = users.id
  LEFT JOIN client ON commande.id_client = client.id
  INNER JOIN adresse ON commande.id_adresse = adresse.id_adresse
  INNER JOIN commune ON adresse.id_commune = commune.id_commune
    WHERE detail_commande.est_supprime = 0 AND mouvement_stock.id_type_mouvement = 7
    ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= '${end_date}'` : ''}
      `;

      if (marque_id && marque_id !== 'undefined') {
        q += ` AND marque.id_marque = ${marque_id}`;
      }
    
      q += ' GROUP BY mouvement_stock.id_mouvement';
      q += ' ORDER BY mouvement_stock.date_mouvement DESC';

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvement = (req, res) => {
  const { start_date, end_date, page = 1, pageSize = 15 } = req.query;
  const offset = (page - 1) * pageSize;

  // Requête pour obtenir le total d'éléments
  const totalQuery = `
  SELECT COUNT(DISTINCT mouvement_stock.id_commande) as total 
  FROM mouvement_stock 
  INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
  WHERE detail_commande.est_supprime = 0
  ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= ?` : ''}
  ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= ?` : ''}`;

  const totalQueryParams = [];
  if (start_date) totalQueryParams.push(start_date);
  if (end_date) totalQueryParams.push(end_date);

  // Exécution de la requête pour obtenir le total
  db.query(totalQuery, totalQueryParams, (totalError, totalData) => {
    if (totalError) {
      console.error("Database error: ", totalError);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const totalItems = totalData[0].total; // Nombre total d'éléments

    // Requête pour obtenir les données paginées
    const q = `
      SELECT
        mouvement_stock.*,
        varianteproduit.stock,
        varianteproduit.img,
        type_mouvement.type_mouvement,
        marque.nom AS nom_marque,
        taille.taille,
        client.nom AS nom_client,
        client.id AS id_client1,
        client.telephone,
        commande.id_shop,
        users.username AS livreur,
        users.id AS id_livreur,
        commune.nom_commune,
        (
          SELECT SUM(mouvement_stock.quantite)
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement IN (12, 4, 7)
          LIMIT 1
        ) AS total_varianteproduit,
        (
          SELECT SUM(mouvement_stock.quantite)
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement = 4
          LIMIT 1
        ) AS total_vendu,
        (
          SELECT SUM(mouvement_stock.quantite)
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement = 5
          LIMIT 1
        ) AS total_retours,
        (
          SELECT SUM(mouvement_stock.quantite)
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement = 7
          LIMIT 1
        ) AS total_echange,
        (
          SELECT mouvement_stock.id_type_mouvement
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement = 5
          LIMIT 1
        ) AS id_retours,
        (
          SELECT mouvement_stock.id_type_mouvement
          FROM mouvement_stock
          INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
            AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
          WHERE detail_commande.est_supprime = 0 
            AND commande.id_commande = detail_commande.id_commande 
            AND type_mouvement.id_type_mouvement = 4
          LIMIT 1
        ) AS id_vente
      FROM
        mouvement_stock
      INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit
      INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
      INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande 
        AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
      INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
      INNER JOIN marque ON produit.id_marque = marque.id_marque
      INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
      INNER JOIN client ON commande.id_client = client.id
      INNER JOIN detail_livraison ON detail_commande.id_detail = detail_livraison.id_detail_commande
      INNER JOIN users ON detail_livraison.id_livreur = users.id
      LEFT JOIN adresse ON commande.id_adresse = adresse.id_adresse
      LEFT JOIN commune ON adresse.id_commune = commune.id_commune
      WHERE detail_commande.est_supprime = 0
      ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= ?` : ''}
      ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= ?` : ''}
      GROUP BY commande.id_commande
      ORDER BY mouvement_stock.date_mouvement DESC
      LIMIT ? OFFSET ?`;

    const queryParams = [];
    if (start_date) queryParams.push(start_date);
    if (end_date) queryParams.push(end_date);
    queryParams.push(Number(pageSize), Number(offset));

    // Exécution de la requête pour obtenir les données
    db.query(q, queryParams, (error, data) => {
      if (error) {
        console.error("Database error: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Retournez les données et le total
      return res.status(200).json({ items: data, total: totalItems });
    });
  });
};

exports.getMouvementEncoursRapports = (req, res) => {
  const filter = req.query.filter;

  let q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, taille.taille,marque.nom AS nom_marque, taille.taille,client.nom AS nom_client FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
    WHERE mouvement_stock.id_type_mouvement = 12
 `;

 if (filter === 'today') {
  q += ` AND DATE(mouvement_stock.date_mouvement) = CURDATE()`;
} else if (filter === 'yesterday') {
  q += ` AND DATE(mouvement_stock.date_mouvement) = CURDATE() - INTERVAL 1 DAY`;
} else if (filter === 'last7days') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 7 DAY`;
} else if (filter === 'last30days') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 30 DAY`;
} else if (filter === 'last1year') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 1 YEAR`;
}

 q += `
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
 `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementVenteRapports = (req, res) => {
  const filter = req.query.filter;

  let q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, taille.taille,marque.nom AS nom_marque, taille.taille,client.nom AS nom_client FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
    WHERE mouvement_stock.id_type_mouvement = 4
 `;

 if (filter === 'today') {
  q += ` AND DATE(mouvement_stock.date_mouvement) = CURDATE()`;
} else if (filter === 'yesterday') {
  q += ` AND DATE(mouvement_stock.date_mouvement) = CURDATE() - INTERVAL 1 DAY`;
} else if (filter === 'last7days') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 7 DAY`;
} else if (filter === 'last30days') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 30 DAY`;
} else if (filter === 'last1year') {
  q += ` AND DATE(mouvement_stock.date_mouvement) >= CURDATE() - INTERVAL 1 YEAR`;
}

 q += `
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
 `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementOne = (req, res) => {
  const {id} = req.params;

  const q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, taille.taille,marque.nom AS nom_marque, taille.taille,client.nom AS nom_client FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
    WHERE mouvement_stock.id_commande = ?
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
 `;

  db.query(q,[id], (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const mouvementData = data.map(mouvement => {
      let signe = "";
      if (mouvement.id_type_mouvement === 1) {
        signe = "+";
      } else if (mouvement.id_type_mouvement === 2) {
        signe = "-";
      }
      mouvement.quantite = `${signe}${mouvement.quantite}`;
      return mouvement;
    });

    return res.status(200).json(mouvementData);
  });
};

exports.getMouvementOneVente = (req, res) => {
  const id_commande = req.query.id_commande;
  const id_type = req.query.id_type;

  const q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, taille.taille,marque.nom AS nom_marque, taille.taille,client.nom AS nom_client FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
    WHERE mouvement_stock.id_commande = ${id_commande} AND mouvement_stock.id_type_mouvement = ${id_type}
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
 `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementOneRetour = (req, res) => {
  const id_commande = req.query.id_commande;
  const id_type = req.query.id_type;

  const q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, taille.taille,marque.nom AS nom_marque, taille.taille,client.nom AS nom_client FROM mouvement_stock 
  INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit 
  INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement 
  INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
  INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
  INNER JOIN marque ON produit.id_marque = marque.id_marque
  INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
    WHERE mouvement_stock.id_commande = ${id_commande} AND mouvement_stock.id_type_mouvement = ${id_type}
    GROUP BY mouvement_stock.id_mouvement
    ORDER BY mouvement_stock.date_mouvement DESC
 `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.getMouvementLivreur = (req, res) => {
  const { start_date, end_date, userId } = req.query;

  const q = `SELECT mouvement_stock.*, varianteproduit.stock, varianteproduit.img, type_mouvement.type_mouvement, marque.nom AS nom_marque, taille.taille, client.nom AS nom_client, client.id AS id_client1, client.telephone, SUM(detail_commande.quantite) AS total_varianteproduit, commande.id_shop, users.username AS livreur
              FROM mouvement_stock
            INNER JOIN varianteproduit ON mouvement_stock.id_varianteProduit = varianteproduit.id_varianteProduit
            INNER JOIN type_mouvement ON mouvement_stock.id_type_mouvement = type_mouvement.id_type_mouvement
            INNER JOIN detail_commande ON mouvement_stock.id_commande = detail_commande.id_commande AND mouvement_stock.id_varianteProduit = detail_commande.id_varianteProduit
            INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
            INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
            INNER JOIN marque ON produit.id_marque = marque.id_marque
            INNER JOIN commande ON mouvement_stock.id_commande = commande.id_commande
            INNER JOIN client ON commande.id_client = client.id
            INNER JOIN detail_livraison ON detail_commande.id_detail = detail_livraison.id_detail_commande
            INNER JOIN users ON detail_livraison.id_livreur = users.id
            WHERE detail_commande.est_supprime = 0 AND users.id = ${userId}
              ${start_date ? `AND DATE(mouvement_stock.date_mouvement) >= '${start_date}'` : ''}
              ${end_date ? `AND DATE(mouvement_stock.date_mouvement) <= '${end_date}'` : ''}
              GROUP BY mouvement_stock.id_mouvement
              ORDER BY mouvement_stock.date_mouvement DESC
            `;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  });
};

exports.postMouvement = (req, res) => {

  const qStocke = `SELECT stock FROM varianteproduit WHERE id_varianteProduit = ?`;
  const qStockeTaille = `SELECT stock FROM varianteproduit WHERE id_produit = ? AND id_taille = ? AND id_couleur = ?`;
  const qUpdateStock = `UPDATE varianteproduit SET stock = ? WHERE id_varianteProduit = ?`;
  const qInsertMouvement = 'INSERT INTO mouvement_stock(`id_varianteProduit`, `id_type_mouvement`, `quantite`, `id_user_cr`, `id_client`, `id_fournisseur`, `description`) VALUES(?,?,?,?,?,?,?)';

  const values = [ 
    req.body.id_varianteProduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_user_cr,
    req.body.id_client,
    req.body.id_fournisseur,
    req.body.description
  ];

  db.query(qStocke, [req.body.id_varianteProduit], (error, stockData) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      const stockActuel = stockData[0].stock;

      db.query(qStockeTaille, [req.body.id_produit, req.body.id_taille, req.body.id_couleur], (error, stockTailleData) => {
        if (error) {
          res.status(500).json(error);
          console.log(error);
        } else {
          const stockTailleActuel = stockTailleData[0].stock;

          let newStockTaille;

          if (req.body.id_type_mouvement === 1) {
            newStockTaille = stockTailleActuel + parseInt(req.body.quantite);
          } else if (req.body.id_type_mouvement === 2) {
            newStockTaille = stockTailleActuel - parseInt(req.body.quantite);
            if (newStockTaille > stockActuel) {
              res.status(400).json({ error: 'Quantité de stock insuffisante ou taille invalide.' });
              return;
            }
            
            if (newStockTaille < 0) {
              res.status(400).json({ error: 'Quantité de stock insuffisante.' });
              return;
            }
          }

          db.query(qUpdateStock, [newStockTaille, req.body.id_varianteProduit], (error, updateData) => {
            if (error) {
              res.status(500).json(error);
              console.log(error);
            } else {
              db.query(qInsertMouvement, values, (error, mouvementData) => {
                if (error) {
                  res.status(500).json(error);
                  console.log(error);
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
};

exports.deleteMouvement = (req, res) => {
  const {id} = req.params;
  const q = "DELETE FROM mouvement_stock  WHERE id_mouvement = ?"

  db.query(q, [id], (err, data)=>{
      if (err) return res.send(err);
    return res.json(data);
  })
};

exports.putMouvement = (req, res) => {
  const { id } = req.params;
  const q = "UPDATE type_mouvement SET `id_varianteproduit`= ?, `id_type_mouvement`= ?, `quantite`= ?, `id_utilisateur`= ?, `id_client`= ?, `id_fournisseur`= ?, `description`= ? WHERE id_mouvement = ?";
  const values = [
    req.body.id_varianteproduit,
    req.body.id_type_mouvement,
    req.body.quantite,
    req.body.id_utilisateur,
    req.body.id_client,
    req.body.id_fournisseur, 
    req.body.description,
    id
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      return res.send(err);
    }
    return res.json(data);
  });
};