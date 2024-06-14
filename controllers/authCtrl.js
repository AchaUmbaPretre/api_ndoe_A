const { db } = require("./../config/db");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')

dotenv.config();


exports.registerController = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const values = [email];

    db.query(query, values, async (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length > 0) {
        return res.status(200).send({ message: "Utilisateur existe déjà", success: false });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
      const insertValues = [username, email, hashedPassword, role];

      db.query(insertQuery, insertValues, (err, insertResult) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(201).send({ message: "Enregistré avec succès", success: true });
      });
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Erreur dans le contrôleur de registre : ${err.message}`,
    });
  }
};
exports.loginController = async (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    const values = [username];
  
    db.query(query, values, async (err, results) => {
      if (err) {
        res.status(500).json(err);
        console.log(err)
      } else {
        const user = results[0];
  
        if (!user) {
          return res
        .status(200)
        .send({ message: "utilisateur non trouvé", success: false });
        }
  
        try {
          const passwordMatch = await bcrypt.compare(password, user.password);
  
          if (!passwordMatch) {
            return res
            .status(200)
            .send({ message: "Email ou mot de passe invalid", success: false });
          }
  
          const accessToken = jwt.sign(
            {
              id: user.id,
              role: user.role,
            },
            process.env.JWT,
            { expiresIn: "3d" }
          );
  
          const { password: userPassword, ...others } = user;
  
          res.status(200).send({ message: "connexion réussie", success: true, ...others, accessToken });
        } catch (err) {
          res.status(500).json(err);
        }
      }
    });
}

exports.logout = (req, res) => {
  res.clearCookie('access_token', {
    sameTime: 'none',
    secure: true,
  });

  res.status(200).json('Utilisateur est déconnecté');
};