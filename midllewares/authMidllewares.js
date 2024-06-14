const jwt = require('jsonwebtoken')

exports.authMid = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        jwt.verify(token, process.env.JWT, (error, decode) => {
            if (error) {
                return res.status(401).send({
                    message: 'Authentification échouée',
                    success: false
                });
            } else {
                req.body.userId = decode.id;
                next();
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).send({
            message: 'Authentification échouée',
            success: false
        });
    }
};

const StatutLivre = "UPDATE commande SET id_livraison = 2, statut = 1 WHERE id_commande = ?";