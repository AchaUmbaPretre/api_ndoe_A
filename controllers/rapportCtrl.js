const { db } = require("./../config/db.js");
const dotenv = require('dotenv');

dotenv.config();

exports.getRapportVenteV = (req, res) => {
  const { start_date, end_date, marque_id,couleur_id, taille_id } = req.query;

  let q = `
  SELECT
    m.id_marque,
    taille.taille,
    SUM(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    SUM(vp.stock) AS quantite_en_stock,
    COUNT(DISTINCT v.id_vente) AS nombre_vendu,
    vp.img,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente,
    vp.code_variant
FROM vente v
INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
INNER JOIN produit p ON vp.id_produit = p.id_produit
INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
INNER JOIN marque m ON p.id_marque = m.id_marque
INNER JOIN taille ON vp.id_taille = taille.id_taille
INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
WHERE v.est_supprime = 0
  ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
  ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
  `;

  if (marque_id && marque_id !== 'undefined') {
    q += ` AND m.id_marque = ${marque_id}`;
  }

  if (couleur_id && couleur_id !== 'undefined') {
    q += ` AND couleur.id_couleur = ${couleur_id}`;
  }

  if (taille_id && taille_id !== 'undefined') {
    q += ` AND taille.id_taille = ${taille_id}`;
  }

  q += ' GROUP BY vp.code_variant, couleur.description';
  q += ' ORDER BY v.date_vente DESC';

  try {
    db.query(q, (error, data) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Tous les champs sont requis' });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportDateRecente = (req, res) => {
  const { start_date, end_date,searchValue } = req.query;

  let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          SUM(v.prix_unitaire) AS montant_total,
          COUNT(DISTINCT v.id_commande) AS nbre_commande,
          client.nom
        FROM vente v
        INNER JOIN client ON v.id_client = client.id
        WHERE v.est_supprime = 0
      ${searchValue ? `AND client.nom LIKE '%${searchValue}%'` : ''}
      ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
        `;

    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

exports.getRapportDateRecenteMarque = (req, res) => {
  const { start_date, end_date,searchValue } = req.query;

  let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          SUM(v.prix_unitaire) AS montant_total,
          COUNT(DISTINCT v.id_commande) AS nbre_commande
        FROM vente v
        INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
        INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
        INNER JOIN produit p ON vp.id_produit = p.id_produit
        INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
        INNER JOIN marque m ON p.id_marque = m.id_marque
        WHERE v.est_supprime = 0
      ${searchValue ? `AND m.nom LIKE '%${searchValue}%'` : ''}
      ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
        `;

    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

exports.getRapportDateRecenteJour = (req, res) => {

  let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          COUNT(DISTINCT v.id_commande) AS nbre_commande,
          SUM(v.prix_unitaire) AS montant_total
        FROM vente v
        WHERE v.est_supprime = 0 AND DATE(v.date_vente) = CURDATE()
        `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportDateRecente7Jours = (req, res) => {

  let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          COUNT(DISTINCT v.id_commande) AS nbre_commande
        FROM vente v
        WHERE v.est_supprime = 0 AND DATE(v.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportDateRecenteJour30jours = (req, res) => {

  let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          COUNT(DISTINCT v.id_commande) AS nbre_commande
        FROM vente v
        WHERE v.est_supprime = 0 AND DATE(v.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



exports.getRapportVenteJour = (req, res) => {

  let q = `
    SELECT
      m.id_marque,
      taille.taille,
      SUM(v.quantite) AS quantite_vendue,
      prix_unitaire AS montant_vendu,
      SUM(vp.stock) AS quantite_en_stock,
      vp.img,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description,
      v.date_vente,
      vp.code_variant
  FROM vente v
  INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
  INNER JOIN produit p ON vp.id_produit = p.id_produit
  INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
  INNER JOIN marque m ON p.id_marque = m.id_marque
  INNER JOIN taille ON vp.id_taille = taille.id_taille
  INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0
      AND DATE(v.date_vente) = CURDATE()
  GROUP BY couleur.description
  ORDER BY v.date_vente DESC;
  `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportVente7Jour = (req, res) => {

  let q = `
    SELECT
      m.id_marque,
      taille.taille,
      SUM(v.quantite) AS quantite_vendue,
      prix_unitaire AS montant_vendu,
      MAX(vp.stock) AS quantite_en_stock,
      vp.img,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description,
      v.date_vente,
      vp.code_variant
    FROM vente v
      INNER JOIN detail_livraison ON v.id_detail_commande = detail_livraison.id_detail_commande
      INNER JOIN varianteproduit vp ON detail_livraison.id_varianteProduit = vp.id_varianteProduit
      INNER JOIN produit p ON vp.id_produit = p.id_produit
      INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
      INNER JOIN marque m ON p.id_marque = m.id_marque
      INNER JOIN taille ON vp.id_taille = taille.id_taille
      INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
    WHERE v.est_supprime = 0
          AND DATE(v.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY vp.id_varianteProduit
    ORDER BY v.date_vente DESC
  `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportVente30Jour = (req, res) => {

  let q = `
    SELECT
      m.id_marque,
      taille.taille,
      SUM(v.quantite) AS quantite_vendue,
      prix_unitaire AS montant_vendu,
      MAX(vp.stock) AS quantite_en_stock,
      vp.img,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description,
      v.date_vente,
      vp.code_variant
    FROM vente v
      INNER JOIN detail_livraison ON v.id_detail_commande = detail_livraison.id_detail_commande
      INNER JOIN varianteproduit vp ON detail_livraison.id_varianteProduit = vp.id_varianteProduit
      INNER JOIN produit p ON vp.id_produit = p.id_produit
      INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
      INNER JOIN marque m ON p.id_marque = m.id_marque
      INNER JOIN taille ON vp.id_taille = taille.id_taille
      INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
    WHERE v.est_supprime = 0
          AND DATE(v.date_vente) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY vp.id_varianteProduit
    ORDER BY v.date_vente DESC
  `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRapportVenteVariante = (req, res) => {
  const { code_variant } = req.params;
  const { start_date, end_date } = req.query;

  let q = `
  SELECT
    m.id_marque,
    taille.taille,
    SUM(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    MAX(vp.stock) AS quantite_en_stock,
    vp.img,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente,
    users.username,
    client.nom AS nom_client
FROM vente v
INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
INNER JOIN produit p ON vp.id_produit = p.id_produit
INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
INNER JOIN marque m ON p.id_marque = m.id_marque
INNER JOIN taille ON vp.id_taille = taille.id_taille
INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
INNER JOIN users ON v.id_livreur = users.id
INNER JOIN client ON v.id_client = client.id
WHERE v.est_supprime = 0 AND vp.code_variant = '${code_variant}' 
    ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
  GROUP BY v.id_client, vp.id_varianteProduit
  `;

  try {
    db.query(q, (error, data) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* exports.getRapportVente = (req, res) => {
    const { start_date, end_date, marque_id } = req.query;

    let q = `
  SELECT
    m.id_marque,
    SUM(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    SUM(vp.stock) AS quantite_en_stock,
    vp.img,
    COUNT(vp.id_varianteProduit) AS nombre_vendu,
    m.nom AS nom_marque,
    categorie.nom_categorie
  FROM vente v
    INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
    INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
    INNER JOIN produit p ON vp.id_produit = p.id_produit
    INNER JOIN marque m ON p.id_marque = m.id_marque
    INNER JOIN taille ON vp.id_taille = taille.id_taille
    INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0
        ${start_date ? `AND v.date_vente >= '${start_date}'` : ''}
        ${end_date ? `AND v.date_vente <= '${end_date}'` : ''}
    `;
  
    if (marque_id) {
      q += ` AND m.id_marque = ${marque_id}`;
    }
  
    q += ' GROUP BY m.id_marque';
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: 'Tous les champs sont requis' });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }; */
  
exports.getRapportVente = (req, res) => {
    const { start_date, end_date, marque_id } = req.query;
  
    let q = `
      SELECT
        m.id_marque,
        SUM(v.quantite) AS quantite_vendue,
        SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
        SUM(vp.stock) AS quantite_en_stock,
        vp.img,
        COUNT(DISTINCT v.id_commande) AS nombre_vendu,
        m.nom AS nom_marque,
        categorie.nom_categorie,
        (SELECT SUM(vp.stock) FROM varianteproduit vp
          INNER JOIN produit p ON vp.id_produit = p.id_produit
          INNER JOIN marque m2 ON p.id_marque = m2.id_marque
          WHERE vp.est_supprime = 0 AND m2.id_marque = m.id_marque
          GROUP BY m2.id_marque) AS total_chaussures_en_stock
      FROM vente v
        INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
        INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
        INNER JOIN produit p ON vp.id_produit = p.id_produit
        INNER JOIN marque m ON p.id_marque = m.id_marque
        INNER JOIN taille ON vp.id_taille = taille.id_taille
        INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
      WHERE v.est_supprime = 0
        ${start_date ? `AND v.date_vente >= '${start_date}'` : ''}
        ${end_date ? `AND v.date_vente <= '${end_date}'` : ''}
    `;
  
    if (marque_id) {
      q += ` AND m.id_marque = ${marque_id}`;
    }
  
    q += ' GROUP BY m.id_marque';
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: 'Tous les champs sont requis' });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteAll = (req, res) => {
    const { id_marque } = req.params;
  
    let q = `
    SELECT
    m.id_marque,
    SUM(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    vp.stock AS quantite_en_stock,
    vp.img,
    taille.taille,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente
  FROM vente v
  INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
  INNER JOIN produit p ON vp.id_produit = p.id_produit
  INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
  INNER JOIN marque m ON p.id_marque = m.id_marque
  INNER JOIN taille ON vp.id_taille = taille.id_taille
  INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0 AND m.id_marque = ${id_marque} 
    GROUP BY taille.id_taille, vp.code_variant; 
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteAllCat = (req, res) => {
    const { id_cat } = req.query;
  
    let q = `
    SELECT
    m.id_marque,
    SUM(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    vp.stock AS quantite_en_stock,
    vp.img,
    taille.taille,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente
  FROM vente v
  INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
  INNER JOIN produit p ON vp.id_produit = p.id_produit
  INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
  INNER JOIN marque m ON p.id_marque = m.id_marque
  INNER JOIN taille ON vp.id_taille = taille.id_taille
  INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0 AND categorie.id_categorie = ${id_cat} 
    GROUP BY taille.id_taille, vp.code_variant; 
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteAllRap = (req, res) => {
    const { id_marque } = req.params;
  
    let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          COUNT(DISTINCT v.id_commande) AS nbre_commande
        FROM vente v
         INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
          INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
          INNER JOIN produit p ON vp.id_produit = p.id_produit
          INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
          INNER JOIN marque m ON p.id_marque = m.id_marque
        WHERE v.est_supprime = 0 AND m.id_marque = ${id_marque}
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteAllRapCat = (req, res) => {
    const { id_cat } = req.query;
  
    let q = `
        SELECT
          MIN(v.date_vente) AS date_plus_ancienne,
          MAX(v.date_vente) AS date_plus_recente,
          SUM(v.quantite) AS nbre_article_vendue,
          COUNT(DISTINCT v.id_client) AS nbre_de_vente,
          COUNT(DISTINCT v.id_commande) AS nbre_commande
        FROM vente v
         INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
          INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
          INNER JOIN produit p ON vp.id_produit = p.id_produit
          INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
          INNER JOIN categorie c ON p.id_categorie = c.id_categorie
        WHERE v.est_supprime = 0 AND  c.id_categorie = ${id_cat}
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
exports.getRapportVenteSearch = (req, res) => {
    const { start_date, end_date, id_marque } = req.query;

    let q = `
      SELECT
      m.id_marque,
      SUM(v.quantite) AS quantite_vendue,
      SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
      vp.stock AS quantite_en_stock,
      vp.img,
      taille.taille,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description
    FROM vente v
    INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
    INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
    INNER JOIN produit p ON vp.id_produit = p.id_produit
    INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
    INNER JOIN marque m ON p.id_marque = m.id_marque
    INNER JOIN taille ON vp.id_taille = taille.id_taille
    INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
    WHERE v.est_supprime = 0
      ${id_marque ? `AND m.id_marque = ${id_marque}` : ''}
      ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
    GROUP BY taille.id_taille
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteCat = (req, res) => {
    const { start_date, end_date, id_cat,  filter } = req.query;


    let q = `
      SELECT 
        SUM(v.quantite) AS quantite_vendue,
        SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
        SUM(vp.stock) AS quantite_en_stock,
        COUNT(DISTINCT v.id_commande) AS nombre_vendu,
        (
          SELECT SUM(vp2.stock) 
          FROM varianteproduit vp2
          INNER JOIN produit p2 ON vp2.id_produit = p2.id_produit
          INNER JOIN categorie c2 ON p2.id_categorie = c2.id_categorie
          WHERE vp2.est_supprime = 0 
            AND c2.id_categorie = categorie.id_categorie
        ) AS total_chaussures_en_stock,
        categorie.nom_categorie,
        categorie.id_categorie
      FROM vente v
      INNER JOIN detail_commande dc ON v.id_detail_commande = dc.id_detail
      INNER JOIN varianteproduit vp ON dc.id_varianteProduit = vp.id_varianteProduit
      INNER JOIN produit p ON vp.id_produit = p.id_produit
      INNER JOIN taille t ON vp.id_taille = t.id_taille
      INNER JOIN categorie categorie ON p.id_categorie = categorie.id_categorie
      WHERE v.est_supprime = 0
        ${id_cat ? `AND categorie.id_categorie = ${db.escape(id_cat)}` : ''}
    `;

    if (start_date) {
      q += ` AND DATE(v.date_vente) >= '${start_date}'`;
    }
    if (end_date) {
      q += ` AND DATE(v.date_vente) <= '${end_date}'`;
    }
    if (filter === 'today') {
      q += ` AND DATE(v.date_vente) = CURDATE()`;

    } else if (filter === 'yesterday') {
      q += ` AND DATE(v.date_vente) = CURDATE() - INTERVAL 1 DAY`;
    } else if (filter === 'last7days') {
      q += ` AND DATE(v.date_vente) >= CURDATE() - INTERVAL 7 DAY`;
    } else if (filter === 'last30days') {
      q += ` AND DATE(v.date_vente) >= CURDATE() - INTERVAL 30 DAY`;
    } else if (filter === 'last1year') {
      q += ` AND DATE(v.date_vente) >= CURDATE() - INTERVAL 1 YEAR`;
    } else if (filter === 'year' && year) {
      q += ` AND YEAR(v.date_vente) = ${db.escape(year)}`;
    }
    
    q += `
        GROUP BY categorie.id_categorie, categorie.nom_categorie
        `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };


/* exports.getRapportVenteCouleur = (req, res) => {
    const { start_date, end_date } = req.query;
  
    let q = `
        SELECT
      couleur.id_couleur,
      couleur.description,
      SUM(v.quantite) AS quantite_vendue
    FROM vente v
      INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
      INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
      INNER JOIN produit p ON vp.id_produit = p.id_produit
      INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
    WHERE v.est_supprime = 0
    ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
    `;
  
    q += ' GROUP BY vp.code_variant, couleur.description';
    q += ' ORDER BY quantite_vendue DESC';
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Tous les champs sont requis' });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }; */

exports.getRapportVenteCouleur = (req, res) => {
    const { start_date, end_date } = req.query;
  
    let q = `
    SELECT
      couleur.id_couleur,
      marque.id_marque,
      couleur.description,
      SUM(v.quantite) AS quantite_vendue,
      categorie.nom_categorie AS categorie_plus_vendue,
      MAX(taille.taille) AS taille_plus_vendue,
      marque.nom AS marque_plus_vendue,
      COUNT(taille_pays.id_couleur) AS nombre_vendu
    FROM vente v
      INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
      INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
      INNER JOIN produit p ON vp.id_produit = p.id_produit
      INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
      INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
      INNER JOIN taille_pays ON vp.id_taille = taille_pays.id_taille_pays
      INNER JOIN taille ON taille_pays.id_taille = taille.id_taille
      INNER JOIN marque ON p.id_marque = marque.id_marque
    WHERE v.est_supprime = 0
    ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
    
    `;
  
    q += ' GROUP BY couleur.id_couleur';
    q += ' ORDER BY quantite_vendue DESC';
    try {
      db.query(q, (error, data) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Tous les champs sont requis' });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportCouleurAll = (req, res) => {

    const { start_date, end_date, id_couleur } = req.query;
      let q = `
      SELECT
      m.id_marque,
      taille.taille,
      SUM(v.quantite) AS quantite_vendue,
      SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
      MAX(vp.stock) AS quantite_en_stock,
      vp.img,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description,
      v.date_vente,
      client.nom AS nom_client,
      users.username
  FROM vente v
  INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
  INNER JOIN commande ON detail_commande.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN users ON v.id_livreur = users.id
  INNER JOIN produit p ON vp.id_produit = p.id_produit
  INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
  INNER JOIN marque m ON p.id_marque = m.id_marque
  INNER JOIN taille ON vp.id_taille = taille.id_taille
  INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0
    ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
      `;
      if (id_couleur && id_couleur !== 'undefined') {
        q += ` AND couleur.id_couleur = ${id_couleur}`;
      }
      q += ' GROUP BY vp.id_varianteProduit,m.id_marque,couleur.id_couleur';
      q += ' ORDER BY v.date_vente DESC';
    
      try {
        db.query(q, (error, data) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
    
          return res.status(200).json(data);
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
};

exports.getRapportCouleurTaille = (req, res) => {

  const { start_date, end_date, taille } = req.query;
    let q = `
    SELECT
    m.id_marque,
    taille.taille,
    MAX(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    MAX(vp.stock) AS quantite_en_stock,
    vp.img,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente,
    client.nom AS nom_client,
    users.username
FROM vente v
INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
INNER JOIN commande ON detail_commande.id_commande = commande.id_commande
INNER JOIN client ON commande.id_client = client.id
INNER JOIN users ON v.id_livreur = users.id
INNER JOIN produit p ON vp.id_produit = p.id_produit
INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
INNER JOIN marque m ON p.id_marque = m.id_marque
INNER JOIN taille ON vp.id_taille = taille.id_taille
INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
WHERE v.est_supprime = 0
  ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
  ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
    `;
    if (taille && taille !== 'undefined') {
      q += ` AND taille.taille = ${taille}`;
    }
    q += ' GROUP BY vp.id_varianteProduit,m.id_marque,couleur.id_couleur,client.id ';
    q += ' ORDER BY v.date_vente DESC';
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};


/* exports.getRapportCouleurAll = (req, res) => {

    const { start_date, end_date, id_couleur,id_marque } = req.query;
    
      let q = `
      SELECT
      m.id_marque,
      taille.taille,
      MAX(v.quantite) AS quantite_vendue,
      SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
      MAX(vp.stock) AS quantite_en_stock,
      vp.img,
      m.nom AS nom_marque,
      categorie.nom_categorie,
      couleur.description,
      v.date_vente,
      client.nom AS nom_client,
      users.username
  FROM vente v
  INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
  INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
  INNER JOIN commande ON detail_commande.id_commande = commande.id_commande
  INNER JOIN client ON commande.id_client = client.id
  INNER JOIN users ON v.id_livreur = users.id
  INNER JOIN produit p ON vp.id_produit = p.id_produit
  INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
  INNER JOIN marque m ON p.id_marque = m.id_marque
  INNER JOIN taille ON vp.id_taille = taille.id_taille
  INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
  WHERE v.est_supprime = 0
    ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
    ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
      `;
      if (id_couleur && id_couleur !== 'undefined') {
        q += ` AND couleur.id_couleur = ${id_couleur}`;
      }
      if (id_marque && id_marque !== 'undefined') {
        q += ` AND m.id_marque = ${id_marque}`;
      }
      q += ' GROUP BY vp.id_varianteProduit,m.id_marque,couleur.id_couleur';
    
      try {
        db.query(q, (error, data) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
    
          return res.status(200).json(data);
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    };
 */
/* exports.getRapportMarqueCount = (req, res) => {
  
    let q = `
      SELECT
      m.id_marque,
      m.nom AS nom_marque,
      COUNT(vp.id_varianteProduit) AS total_chaussures_en_stock
  FROM marque m
  INNER JOIN produit p ON m.id_marque = p.id_marque
  INNER JOIN varianteproduit vp ON p.id_produit = vp.id_produit
  WHERE vp.stock > 0
  GROUP BY m.id_marque, m.nom;
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }; */
  
exports.getRapportMarqueCount = (req, res) => {
  
    let q = `
    SELECT m.id_marque,
    m.nom AS nom_marque,
    SUM(vp.stock) AS total_chaussures_en_stock FROM varianteproduit vp
    INNER JOIN produit p ON vp.id_produit = p.id_produit
    INNER JOIN marque m ON p.id_marque = m.id_marque
      WHERE vp.est_supprime = 0
      GROUP BY m.id_marque, m.id_marque
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteClient = (req, res) => {
    const { start_date, end_date, qteOne, qteTwo } = req.query;
  
    let q = `
        SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure,
          statut.nom_statut AS statut,
          COUNT(DISTINCT vente.id_commande) AS nombre_ventes,
          SUM(vente.quantite) AS total_varianteproduit,
          SUM(vente.quantite) / COUNT(DISTINCT vente.id_commande) AS vente_moyenne,
          SUM(vente.prix_unitaire) AS total_prix_vente,
          (
              SELECT MAX(date_vente)
              FROM vente AS v
              INNER JOIN commande AS c ON v.id_commande = c.id_commande
              WHERE c.id_client = client.id
          ) AS derniere_date_achat
        FROM vente
          INNER JOIN users ON vente.id_livreur = users.id
          INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
          INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
          INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
          INNER JOIN marque ON produit.id_marque = marque.id_marque
          INNER JOIN commande ON vente.id_commande = commande.id_commande
          INNER JOIN statut ON commande.statut = statut.id_statut
          INNER JOIN client ON commande.id_client = client.id
          INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      WHERE vente.est_supprime = 0
        ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}
      GROUP BY client.id
    `;
  
    if (qteOne && qteTwo) {
      q += ` HAVING SUM(vente.quantite) BETWEEN ${qteOne} AND ${qteTwo}`;
    }
  
    q += ` ORDER BY vente.date_vente DESC`;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.getRapportVenteClientAll = (req, res) => {

  const { start_date, end_date, id_client } = req.query;
  
    let q = `
    SELECT
    m.id_marque,
    taille.taille,
    MAX(v.quantite) AS quantite_vendue,
    SUM(v.prix_unitaire * v.quantite) AS montant_vendu,
    MAX(vp.stock) AS quantite_en_stock,
    vp.img,
    m.nom AS nom_marque,
    categorie.nom_categorie,
    couleur.description,
    v.date_vente,
    client.nom AS nom_client,
    users.username
FROM vente v
INNER JOIN detail_commande ON v.id_detail_commande = detail_commande.id_detail
INNER JOIN varianteproduit vp ON detail_commande.id_varianteProduit = vp.id_varianteProduit
INNER JOIN commande ON detail_commande.id_commande = commande.id_commande
INNER JOIN client ON commande.id_client = client.id
INNER JOIN users ON v.id_livreur = users.id
INNER JOIN produit p ON vp.id_produit = p.id_produit
INNER JOIN couleur ON vp.id_couleur = couleur.id_couleur
INNER JOIN marque m ON p.id_marque = m.id_marque
INNER JOIN taille ON vp.id_taille = taille.id_taille
INNER JOIN categorie ON p.id_categorie = categorie.id_categorie
WHERE v.est_supprime = 0
  ${start_date ? `AND DATE(v.date_vente) >= '${start_date}'` : ''}
  ${end_date ? `AND DATE(v.date_vente) <= '${end_date}'` : ''}
    `;
    if (id_client && id_client !== 'undefined') {
      q += ` AND client.id = ${id_client}`;
    }
    q += ' GROUP BY vp.id_varianteProduit, client.id';
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  

exports.getRapportVenteClientOne = (req, res) => {
  const { start_date, end_date } = req.query;
    const clientId = req.params.clientId;
  
    let q = `
        SELECT vente.*, users.username, varianteproduit.img, client.nom AS nom_client, client.telephone, marque.nom AS nom_marque, taille.taille AS pointure,
        statut.nom_statut AS statut,
        SUM(vente.quantite) AS total_varianteproduit,
        SUM(vente.prix_unitaire) AS total_prix_vente
      FROM vente
        INNER JOIN users ON vente.id_livreur = users.id
        INNER JOIN detail_commande ON vente.id_detail_commande = detail_commande.id_detail
        INNER JOIN varianteproduit ON varianteproduit.id_varianteProduit = detail_commande.id_varianteProduit
        INNER JOIN produit ON varianteproduit.id_produit = produit.id_produit
        INNER JOIN marque ON produit.id_marque = marque.id_marque
        INNER JOIN commande ON vente.id_commande = commande.id_commande
        INNER JOIN statut ON commande.statut = statut.id_statut
        INNER JOIN client ON commande.id_client = client.id
        INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
      WHERE vente.est_supprime = 0
        AND client.id = ?
        ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
        ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''} 
      GROUP BY taille.id_taille, marque.id_marque, varianteproduit.id_varianteProduit
    `;
  
    try {
      db.query(q, [clientId], (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
exports.getRapportRevenu = (req, res) => {

  const {months} = req.query;
  
    let q = `
        SELECT
          YEAR(date_vente) AS annee,
          (SELECT mois_nom FROM mois WHERE mois_numero = MONTH(date_vente)) AS mois,
          SUM(vente.quantite) AS quantite_vendue,
          SUM(prix_unitaire) AS revenu_total,
          COUNT(DISTINCT vente.id_commande) AS nombre_vente,
          AVG(prix_unitaire) AS revenu_moyen_par_vente
        FROM vente
        WHERE vente.est_supprime = 0
          ${months ? `AND YEAR(vente.date_vente) = '${months}'` : ''}
          GROUP BY YEAR(date_vente), MONTH(date_vente)
          ORDER BY YEAR(date_vente), MONTH(date_vente);
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

/* exports.getRapportRevenuAllDays = (req, res) => {
    const { months } = req.query;
    
    let q = `
      SELECT
        DATE(date_vente) AS date_vente,
        SUM(prix_unitaire) AS revenu_total
      FROM vente
      WHERE vente.est_supprime = 0
        ${months ? `AND YEAR(date_vente) = '${months}'` : ''}
      GROUP BY DATE(date_vente)
      ORDER BY DATE(date_vente);
    `;
    
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }; */

exports.getRapportRevenuAllDays = (req, res) => {
    const { months } = req.query;
  
    let q = `
      SELECT
        DATE_FORMAT(date_vente, '%Y-%m-%d') AS date_vente,
        SUM(quantite) AS quantite_vendue,
        SUM(prix_unitaire) AS revenu_total,
        COUNT(DISTINCT id_commande) AS nombre_vente,
        AVG(prix_unitaire) AS revenu_moyen_par_vente
      FROM vente
      WHERE est_supprime = 0
        ${months ? `AND DATE_FORMAT(date_vente, '%Y-%m') = '${months}'` : ''}
      GROUP BY DATE_FORMAT(date_vente, '%Y-%m-%d')
      ORDER BY DATE_FORMAT(date_vente, '%Y-%m-%d');
    `;
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  

exports.getRapportRevenuRapDuMois = (req, res) => {
    
      let q = `
        SELECT
        YEAR(date_vente) AS annee,
        (SELECT mois_nom FROM mois WHERE mois_numero = MONTH(date_vente)) AS mois,
        SUM(vente.quantite) AS quantite_vendue,
        SUM(prix_unitaire) AS revenu_total,
        COUNT(DISTINCT vente.id_commande) AS nombre_vente,
        AVG(prix_unitaire) AS revenu_moyen_par_vente
      FROM vente
      WHERE vente.est_supprime = 0
        AND YEAR(date_vente) = YEAR(CURRENT_DATE())
        AND MONTH(date_vente) = MONTH(CURRENT_DATE())
      GROUP BY YEAR(date_vente), MONTH(date_vente)
      ORDER BY YEAR(date_vente), MONTH(date_vente);
      `;
    
      try {
        db.query(q, (error, data) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
  
          return res.status(200).json(data);
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    };
  
exports.getRapportAchats = (req, res) => {
  const {start_date,end_date,marque_id} = req.query;
  
    let q = `
    SELECT varianteproduit.id_varianteProduit, varianteproduit.created_at, produit.nom_produit, varianteproduit.stock,varianteproduit.img, taille_pays.prix, couleur.description, marque.nom AS nom_marque, taille.taille
    FROM varianteproduit
    JOIN produit ON varianteproduit.id_produit = produit.id_produit
    INNER JOIN taille_pays ON varianteproduit.code_variant = taille_pays.code_variant
      INNER JOIN couleur ON varianteproduit.id_couleur = couleur.id_couleur
      INNER JOIN marque ON produit.id_marque = marque.id_marque
      INNER JOIN taille ON taille_pays.id_taille = taille.id_taille
    WHERE varianteproduit.est_supprime = 0
      ${start_date ? `AND DATE(varianteproduit.created_at) >= '${start_date}'` : ''}
      ${end_date ? `AND DATE(varianteproduit.created_at) <= '${end_date}'` : ''}
    `;

    if (marque_id && marque_id !== 'undefined') {
      q += ` AND marque.id_marque = ${marque_id}`;
    }

    q += ' GROUP BY produit.id_produit, marque.id_marque';
    q += ' ORDER BY varianteproduit.created_at DESC';
  
  
    try {
      db.query(q, (error, data) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
  
        return res.status(200).json(data);
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
exports.getAchatsTotal = (req, res) => {
    const q = `SELECT SUM(stock * prix) AS montant_total_achats
    FROM taille_pays`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
      return res.status(200).json(data);
  })
  }
  
  
exports.getAchatsTotalDuel = (req, res) => {
    const q = `SELECT SUM(taille_pays.stock * taille_pays.prix) AS montant_total_ventes_dues
    FROM taille_pays;`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

/* exports.getVenteTotal = (req, res) => {
  const { start_date, end_date } = req.query;

  const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
             FROM vente
             WHERE vente.est_supprime = 0
             ${start_date ? `AND DATE(vente.date_vente) >= '${start_date}'` : ''}
             ${end_date ? `AND DATE(vente.date_vente) <= '${end_date}'` : ''}`;

  db.query(q, (error, data) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
    }

    return res.status(200).json(data);
  });
}; */

exports.getVenteTotal = (req, res) => {
  const { start_date, end_date, filter, year } = req.query;

  let q = `SELECT SUM(prix_unitaire * quantite) AS montant_total_vente
              FROM vente
            WHERE est_supprime = 0;
            `;

  if (start_date) {
    q += ` AND DATE(vente.date_vente) >= '${start_date}'`;
  }
  if (end_date) {
    q += ` AND DATE(vente.date_vente) <= '${end_date}'`;
  }
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
  } else if (filter === 'year' && year) {
    q += ` AND YEAR(vente.date_vente) = ${db.escape(year)}`;
  }

  db.query(q, (error, data) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'exécution de la requête.' });
    }

    return res.status(200).json(data);
  });
};


exports.getVenteTotalDuJour = (req, res) => {

    const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
    FROM vente
    WHERE DATE(date_vente) = CURDATE()`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getVenteTotalDHier = (req, res) => {
    const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
    FROM vente
    WHERE DATE(date_vente) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getVenteTotalDuJour7 = (req, res) => {
    const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
                FROM vente
                WHERE DATE(date_vente) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getVenteTotalDuJour30 = (req, res) => {
    const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
    FROM vente
    WHERE DATE(date_vente) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getVenteTotal1an = (req, res) => {
    const q = `SELECT SUM(prix_unitaire) AS montant_total_vente
    FROM vente
    WHERE DATE(date_vente) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getAchatsMois = (req, res) => {
  const {months} = req.query;

    const q = `SELECT MONTH(created_at) AS mois, SUM(prix) AS total_achats
    FROM taille_pays WHERE YEAR(created_at) = '${months}'
    GROUP BY mois`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }

exports.getVenteMois = (req, res) => {
  const {months} = req.query;

    const q = `SELECT MONTH(date_vente) AS mois, SUM(prix_unitaire) AS total_vente
    FROM vente WHERE est_supprime = 0
    ${months ? `AND YEAR(date_vente) = '${months}'` : ''}
    GROUP BY mois`;
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
  }


exports.getDepenseRapportGraphique = (req, res) => {
    const { startDate, endDate } = req.query;

    // Requête pour obtenir les dépenses mensuelles
    const qMonthly = `
      SELECT 
        DATE_FORMAT(depenses.date_depense, '%Y-%m') AS mois,
        ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2) AS total_mensuel
      FROM depenses
      GROUP BY mois
      ORDER BY mois;
    `;

    // Construire la requête SQL pour obtenir le total sur plusieurs mois
    let qTotalPeriod = `
      SELECT 
        DATE(depenses.date_depense) AS date,
        ROUND(SUM(COALESCE(depenses.montant, 0)), 2) + 
        ROUND(SUM(COALESCE(depenses.montant_franc, 0) * 0.00036364), 2) AS total_periode
      FROM depenses
    `;
    
    // Ajouter les conditions de filtrage par date si elles sont présentes
    if (startDate && endDate) {
        qTotalPeriod += `
          WHERE depenses.date_depense BETWEEN ? AND ?
        `;
    }

    qTotalPeriod += `
      GROUP BY DATE(depenses.date_depense);
    `;

    // Requête pour obtenir la moyenne des dépenses journalières
    const qDailyAvg = `
      SELECT 
        ROUND(AVG(daily_total), 2) AS moyenne_journaliere
      FROM (
        SELECT 
          DATE(depenses.date_depense) AS jour,
          ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2) AS daily_total
        FROM depenses
        GROUP BY jour
      ) AS daily_totals;
    `;

    // Requête pour obtenir les dépenses par bénéficiaire
    const qByBeneficiary = `
      SELECT 
          users.username AS beneficiaire,
          ROUND(SUM(COALESCE(depenses.montant, 0)), 2) + ROUND(SUM(COALESCE(depenses.montant_franc, 0) * 0.00036364), 2) AS total_beneficiaire
      FROM depenses
      LEFT JOIN users ON depenses.id_livreur = users.id
      GROUP BY depenses.id_livreur;
    `;

    // Requête pour obtenir les dépenses par type
    const qByType = `
      SELECT 
        categorie_depense.nom AS type,
        ROUND(SUM(depenses.montant), 2) + ROUND(SUM(depenses.montant_franc * 0.00036364), 2) AS total_type
      FROM depenses
      INNER JOIN categorie_depense ON depenses.id_catDepense = categorie_depense.id_catDepense
      GROUP BY depenses.id_catDepense;
    `;

    // Définir les paramètres pour la requête de total par période
    const queryParams = startDate && endDate ? [startDate, endDate] : [];

    // Exécuter les requêtes
    db.query(qMonthly, (error, monthlyData) => {
        if (error) return res.status(500).send(error);

        db.query(qTotalPeriod, queryParams, (error, totalPeriodData) => {
            if (error) return res.status(500).send(error);

            db.query(qDailyAvg, (error, dailyAvgData) => {
                if (error) return res.status(500).send(error);

                db.query(qByBeneficiary, (error, beneficiaryData) => {
                    if (error) return res.status(500).send(error);

                    db.query(qByType, (error, typeData) => {
                        if (error) return res.status(500).send(error);

                        res.status(200).json({
                            monthlyData,
                            totalPeriodData,
                            dailyAvgData,
                            beneficiaryData,
                            typeData,
                        });
                    });
                });
            });
        });
    });
};
  