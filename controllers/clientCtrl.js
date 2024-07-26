const { db } = require("./../config/db.js");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

//Client
exports.getClientCount = (req, res) => {
  const q = "SELECT COUNT(*) AS total FROM client WHERE est_supprime = 0";

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data[0].total);
  });
};

exports.getClientCountJour = (req, res) => {
  const q = `SELECT COUNT(id) AS nbre_client FROM client 
              WHERE est_supprime = 0 AND DATE(created_at) = CURDATE()`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getClientCountHier = (req, res) => {
  const q = `SELECT COUNT(id) AS nbre_client FROM client 
              WHERE est_supprime = 0 AND DATE(created_at)= DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getClientCountJour7 = (req, res) => {
  const q = `SELECT COUNT(id) AS nbre_client FROM client 
              WHERE est_supprime = 0 AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getClientCountJour30 = (req, res) => {
  const q = `SELECT COUNT(id) AS nbre_client FROM client 
              WHERE est_supprime = 0 AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};

exports.getClientCount1an = (req, res) => {
  const q = `SELECT COUNT(id) AS nbre_client FROM client 
              WHERE est_supprime = 0 AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;

  db.query(q, (error, data) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(data);
  });
};


exports.getClient = (req, res) => {
    const q = `
    SELECT client.*, province.nom_province, commune.nom_commune 
        FROM client 
    LEFT JOIN province ON client.id_province = province.id_province 
    LEFT JOIN commune ON client.commune = commune.id_commune
    WHERE est_supprime = 0
    ORDER BY client.nom
    `;
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
}


exports.getClientRapport = (req, res) => {
  const filter = req.query.filter;

  let q = `
  SELECT client.*, province.nom_province, commune.nom_commune 
      FROM client 
  LEFT JOIN province ON client.id_province = province.id_province 
  LEFT JOIN commune ON client.commune = commune.id_commune
  WHERE est_supprime = 0
  `;

  if (filter === 'today') {
    q += ` AND DATE(client.created_at) = CURDATE()`;
  } else if (filter === 'yesterday') {
    q += ` AND DATE(client.created_at) = CURDATE() - INTERVAL 1 DAY`;
  } else if (filter === 'last7days') {
    q += ` AND DATE(client.created_at) >= CURDATE() - INTERVAL 7 DAY`;
  } else if (filter === 'last30days') {
    q += ` AND DATE(client.created_at) >= CURDATE() - INTERVAL 30 DAY`;
  } else if (filter === 'last1year') {
    q += ` AND DATE(client.created_at) >= CURDATE() - INTERVAL 1 YEAR`;
  }

  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getClientOne = (req, res) => {
  const {id} = req.params;

  const q = `
  SELECT client.*, province.nom_province, commune.nom_commune FROM client 
    LEFT JOIN province ON client.id_province = province.id_province 
    LEFT JOIN commune ON client.commune = commune.id_commune
  WHERE est_supprime = 0 AND id = ?
  `;
   
  db.query(q,[id], (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

/* exports.postClient = (req, res) => {
  const q = 'INSERT INTO client(`nom`, `raison_sociale`, `adresse`, `email`, `telephone`, `id_province`,`avenue`, `quartier`, `commune`, `num`) VALUES(?,?,?,?,?,?,?,?,?,?)';

  const values = [
      req.body.nom,
      req.body.raison_sociale,
      req.body.adresse,
      req.body.email,
      req.body.telephone,
      req.body.id_province,
      req.body.avenue,
      req.body.quartier,
      req.body.commune,
      req.body.num
  ]

  db.query(q, values, (error, data) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.json('Processus réussi');
    }
  });
} */

/* exports.postClient = (req, res) => {
  const q = 'INSERT INTO client(`nom`, `raison_sociale`, `adresse`, `email`, `telephone`, `id_province`, `avenue`, `quartier`, `commune`, `num`) VALUES(?,?,?,?,?,?,?,?,?,?)';
  const qAdresse = 'INSERT INTO adresse(`id_client`, `id_ville`, `id_commune`, `avenue`, `quartier`, `num`, `ref`) VALUES(?,?,?,?,?,?,?)';
  const qTelephone = 'INSERT INTO telephone(`id_client`, `numero`) VALUES(?,?)';

  const values = [
    req.body.nom,
    req.body.raison_sociale,
    req.body.adresse,
    req.body.email,
    req.body.telephone,
    req.body.id_province,
    req.body.avenue,
    req.body.quartier,
    req.body.commune,
    req.body.num
  ];

  db.query(q, values, (error, clientData) => {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      const clientId = clientData.insertId;
      const valuesAdresse = [
        clientId,
        req.body.id_province,
        req.body.id_commune,
        req.body.avenue,
        req.body.quartier,
        req.body.num,
        req.body.ref
      ];
      db.query(qAdresse, valuesAdresse, (error, adresseData) => {
        if (error) {
          res.status(500).json(error);
        } else {
          const valuesTelephone = [
            clientId,
            req.body.telephone
          ];
          db.query(qTelephone, valuesTelephone, (error, telephoneData) => {
            if (error) {
              res.status(500).json(error);
            } else {
              res.json('Processus réussi');
            }
          });
        }
      });
    }
  });
}; */

/* 2 */

/* exports.postClient = (req, res) => {
  const checkClientQuery = 'SELECT COUNT(*) AS count FROM client WHERE nom = ? AND telephone = ?';
  const insertClientQuery = 'INSERT INTO client(`nom`, `raison_sociale`, `adresse`, `email`, `telephone`, `id_province`, `avenue`, `quartier`, `commune`, `num`) VALUES(?,?,?,?,?,?,?,?,?,?)';
  const insertAdresseQuery = 'INSERT INTO adresse(`id_client`, `id_ville`, `id_commune`, `avenue`, `quartier`, `num`, `ref`) VALUES(?,?,?,?,?,?,?)';
  const insertTelephoneQuery = 'INSERT INTO telephone(`id_client`, `numero`) VALUES(?,?)';

  const values = [
    req.body.nom,
    req.body.raison_sociale,
    req.body.adresse,
    req.body.email,
    req.body.telephone,
    req.body.id_province,
    req.body.avenue,
    req.body.quartier,
    req.body.commune,
    req.body.num
  ];

  db.query(checkClientQuery, [req.body.nom, req.body.telephone], (error, result) => {
    if (error) {
      console.error("ERROR NETWORK:", error);
      res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
      return;
    }

    const clientExists = result[0].count > 0;

    if (clientExists) {
      res.status(400).json({ message: 'Le client existe déjà avec ce nom et ce numéro de téléphone.' });
    } else {
      db.query(insertClientQuery, values, (error, clientData) => {
        if (error) {
          console.error("ERROR NETWORK:", error);
          res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
          return;
        }

        const clientId = clientData.insertId;
        const valuesAdresse = [
          clientId,
          req.body.id_province,
          req.body.id_commune,
          req.body.avenue,
          req.body.quartier,
          req.body.num,
          req.body.ref
        ];

        db.query(insertAdresseQuery, valuesAdresse, (error, adresseData) => {
          if (error) {
            console.error("ERROR NETWORK:", error);
            res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
            return;
          }

          const valuesTelephone = [
            clientId,
            req.body.telephone
          ];

          db.query(insertTelephoneQuery, valuesTelephone, (error, telephoneData) => {
            if (error) {
              console.error("ERROR NETWORK:", error);
              res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
            } else {
              res.json('Processus réussi');
            }
          });
        });
      });
    }
  });
}; */

exports.postClient = (req, res) => {
  const checkClientQuery = 'SELECT COUNT(*) AS count FROM client WHERE nom = ? AND telephone = ?';
  const insertClientQuery = 'INSERT INTO client(`nom`, `raison_sociale`, `adresse`, `email`, `telephone`, `id_province`, `avenue`, `quartier`, `commune`, `num`) VALUES(?,?,?,?,?,?,?,?,?,?)';
  const insertAdresseQuery = 'INSERT INTO adresse(`id_client`, `id_ville`, `id_commune`, `avenue`, `quartier`, `num`, `ref`) VALUES(?,?,?,?,?,?,?)';
  const insertTelephoneQuery = 'INSERT INTO telephone(`id_client`, `numero`) VALUES(?,?)';

  const values = [
    req.body.nom,
    req.body.raison_sociale,
    req.body.adresse,
    req.body.email,
    req.body.telephone,
    req.body.id_province,
    req.body.avenue,
    req.body.quartier,
    req.body.commune,
    req.body.num
  ];

  db.getConnection((err, connection) => {
    if (err) {
      console.error("ERROR NETWORK:", err);
      res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
      return;
    }

    connection.query(checkClientQuery, [req.body.nom, req.body.telephone], (error, result) => {
      if (error) {
        console.error("ERROR NETWORK:", error);
        res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
        return;
      }

      const clientExists = result[0].count > 0;

      if (clientExists) {
        res.status(400).json({ message: 'Le client existe déjà avec ce nom et ce numéro de téléphone.' });
        connection.release();
      } else {
        connection.beginTransaction((err) => {
          if (err) {
            console.error("ERROR NETWORK:", err);
            res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
            connection.release();
            return;
          }

          connection.query(insertClientQuery, values, (error, clientData) => {
            if (error) {
              console.error("ERROR NETWORK:", error);
              return connection.rollback(() => {
                res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                connection.release();
              });
            }

            const clientId = clientData.insertId;
            console.log('Inserted client ID:', clientId); // Debug log
            const valuesAdresse = [
              clientId,
              req.body.id_province,
              req.body.id_commune,
              req.body.avenue,
              req.body.quartier,
              req.body.num,
              req.body.ref
            ];

            connection.query(insertAdresseQuery, valuesAdresse, (error, adresseData) => {
              if (error) {
                console.error("ERROR NETWORK:", error);
                return connection.rollback(() => {
                  res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                  connection.release();
                });
              }

              const valuesTelephone = [
                clientId,
                req.body.telephone
              ];

              console.log('Telephone values:', valuesTelephone); // Debug log
              connection.query(insertTelephoneQuery, valuesTelephone, (error, telephoneData) => {
                if (error) {
                  console.error("ERROR NETWORK:", error);
                  return connection.rollback(() => {
                    res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                    connection.release();
                  });
                } else {
                  connection.commit((err) => {
                    if (err) {
                      console.error("ERROR NETWORK:", err);
                      return connection.rollback(() => {
                        res.status(500).json({ error: 'Erreur réseau, veuillez réessayer plus tard.' });
                        connection.release();
                      });
                    }
                    res.json('Processus réussi');
                    connection.release();
                  });
                }
              });
            });
          });
        });
      }
    });
  });
};


exports.deleteClient = (req, res) => {
    const clientId = req.params.id;
    console.log(clientId)
    const q = "UPDATE client SET est_supprime = 1 WHERE id = ?";
  
    db.query(q, [clientId], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
}

exports.putClient = (req, res) => {
    const clientId = req.params.id;

  const q = "UPDATE client SET `nom`= ?, `raison_sociale`= ?, `adresse`= ?, `email`= ?, `telephone`= ?, `id_province`= ?, `avenue`= ?, `quartier`= ?, `commune`= ?, `num`= ? WHERE id = ?"
  
  const values = [
    req.body.nom,
    req.body.raison_sociale,
    req.body.adresse,
    req.body.email,
    req.body.telephone,
    req.body.id_province,
    req.body.avenue,
    req.body.quartier,
    req.body.id_commune,
    req.body.num
]

  db.query(q, [...values,clientId], (err, data) => {
    console.log(err)
      if (err) return res.send(err);
      return res.json(data);
    });
}


exports.getClientAdresse = (req, res) => {
  const q = `
  SELECT *
      FROM adresse
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.getClientAdresseOne = (req, res) => {
  const {id_client} = req.params;

  const q = `
      SELECT adresse.*, province.nom_province, commune.nom_commune FROM adresse
      INNER JOIN province ON adresse.id_ville = province.id_province
      INNER JOIN commune ON commune.id_commune = adresse.id_commune
      WHERE adresse.id_client = ?
  `;
   
  db.query(q,[id_client], (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postClientAdresse = (req, res) => {
  const q = 'INSERT INTO adresse(`id_client`,`id_ville`,`id_commune`,`avenue`, `quartier`, `num`, `ref`) VALUES(?,?,?,?,?,?,?)';

  const values = [
      req.body.id_client,
      req.body.id_ville,
      req.body.id_commune,
      req.body.avenue,
      req.body.quartier,
      req.body.num,
      req.body.ref
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

exports.deleteClientAdresse = (req, res) => {
  const adresseId = req.params.id;

  const q = "DELETE adresse WHERE id_adresse = ?";

  db.query(q, [adresseId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });

}


exports.getClientTelephone = (req, res) => {
  const q = `
  SELECT *
      FROM telephone
  `;
   
  db.query(q, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}


exports.getClientTelephoneOne = (req, res) => {
  const {id_client} = req.params;

  const q = `
        SELECT telephone.id_client,telephone.numero, telephone.id_telephone,client.nom FROM telephone
          INNER JOIN client ON telephone.id_client = client.id
        WHERE telephone.id_client = ?
        `;
   
  db.query(q,[id_client], (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });
}

exports.postClientTelephone = (req, res) => {
  const q = 'INSERT INTO telephone(`id_client`,`numero`) VALUES(?,?)';

  const values = [
      req.body.id_client,
      req.body.numero
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

exports.putLocation = (req, res) => {
  const id_adresse = req.params.id;

const q = "UPDATE adresse SET `lat`= ?, `lon`= ?  WHERE id_adresse = ?"

const values = [
  req.body.lat,
  req.body.lon]

db.query(q, [...values,id_adresse], (err, data) => {
  console.log(err)
    if (err) return res.send(err);
    return res.json(data);
  });
}