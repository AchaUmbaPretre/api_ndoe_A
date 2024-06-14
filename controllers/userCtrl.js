const { db } = require("./../config/db");
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')

dotenv.config();


exports.getUser = (req, res) => {

    const q = `SELECT * FROM users;`
     
    db.query(q, (error, data) => {
        if (error) res.status(500).send(error);
        return res.status(200).json(data);
    });
  
}

exports.getUserOne = (req, res) => {
  const {id} = req.params;

  const q = `SELECT * FROM users WHERE id = ?;`
   
  db.query(q,id, (error, data) => {
      if (error) res.status(500).send(error);
      return res.status(200).json(data);
  });

}

exports.deleteUser = (req, res) => {
    const {id} = req.params;
    const q = "DELETE FROM users WHERE id = ?"
  
    db.query(q, [id], (err, data)=>{
        if (err) return res.send(err);
      return res.json(data);
    })
  }

exports.putUser = async (req, res) => {
    const { id } = req.params;
  
    const q = "UPDATE users SET `username` = ?, `email` = ?, `password` = ?, `role` = ? WHERE id = ?";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash( req.body.password, salt);
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.role,
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

exports.detailForgot = (req, res) => {
    const { email } = req.query;
    const q = `SELECT users.username, users.id, users.email FROM users WHERE email = ?`
  
    db.query(q,[email], (error, data) => {
      if(error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(200).json(data);
    });
  }

exports.forgotUser = async (req, res) => {
    const id = req.params.id
    const { password } = req.query;
  
    if (!id || !password) {
        return res.status(400).json({ error: "L'identifiant et le mot de passe sont requis" });
    }
  
    try {
  
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        const q = `UPDATE users SET password = ? WHERE id = ?`;
  
        db.query(q, [hashedPassword, id], (error, data) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (data.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "Password updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
