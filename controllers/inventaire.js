 const { db } = require("./../config/db.js");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.getInventaire = (req,res)=> {
    const {id} = req.params;

    const q = `SELECT varianteproduit.id_taille, SUM(stock) AS nombre_de_paires, taille.taille, pays.code_pays, MIN(taille.taille) AS taille_min, MAX(taille.taille) AS taille_max
    FROM varianteproduit
        INNER JOIN taille ON varianteproduit.id_taille = taille.id_taille
        INNER JOIN pays ON taille.id_pays = pays.id_pays
    WHERE varianteproduit.code_variant = ?
    GROUP BY varianteproduit.id_taille;
    `

    db.query(q, id, (error, data) => {
        if (error) return res.status(500).send(error);
    
        return res.status(200).json(data);
      });
}

exports.getInventaireOne = (req,res)=> {
    const {id} = req.params;

    const q = `SELECT SUM(stock) AS nombre_total_de_paires
                    FROM varianteproduit
                WHERE varianteproduit.code_variant = ?`

    db.query(q, id, (error, data) => {
        if (error) return res.status(500).send(error);
    
        return res.status(200).json(data);
      });
}
