const { db } = require("./../config/db.js");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.getLivreurCount = (req, res) => {
    const q = "SELECT COUNT(*) AS total FROM users WHERE role = 'livreur'";
  
    db.query(q ,(error, data)=>{
      if(error) res.status(500).send(error)
  
      return res.status(200).json(data);
  })
}

exports.getLivreur = (req, res) => {
    const q = "SELECT * FROM users WHERE role = 'livreur'";
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}

exports.postLivreur = (req, res) => {
    const q = 'INSERT INTO livreur(`nom`, `prenom`, `telephone`, `adresse`,`email`) VALUES(?,?,?,?,?)';
  
    const values = [
        req.body.nom,
        req.body.prenom,
        req.body.telephone,
        req.body.adresse,
        req.body.email
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

exports.deleteLivreur = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM livreur WHERE id_livreur = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
}

exports.putLivreur = (req, res) => {
    const livreurId = req.params.id;
    const q = "UPDATE livreur SET `nom`= ?, `telephone`= ?, `adresse`= ?, `email`= ? WHERE id_livreur = ?"
    const values = [
        req.body.nom,
        req.body.numero,
        req.body.telephone,
        req.body.email
    ]
  
    db.query(q, [...values,livreurId], (err, data) => {
        if (err) return res.send(err);
        return res.json(data);
      });
}

//statut commande
exports.putStatutCommande = (req, res) => {
    const {id} = req.params;
    const q = "UPDATE commande SET id_livraison = 1 WHERE id_commande = ?";
  
    db.query(q, [id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  };

exports.putStatutCommandeLivre = (req, res) => {
    const {id} = req.params;
    const q = "UPDATE commande SET id_livraison = 2 WHERE id_commande = ?";
  
    db.query(q, [id], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  };

  //province

exports.getProvince = (req, res) => {
  const q = "SELECT * FROM province";
   
  db.query(q, (error, data) => {
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
});
}
//Commune
exports.getCommune = (req, res) => {
const {id} = req.params;

const q = `SELECT * FROM commune WHERE id_province = ?`;
 
db.query(q, [id], (error, data) => {
    if (error) res.status(500).send(error);
    return res.status(200).json(data);
});
}