/* // Middleware pour vérifier le rôle de l'utilisateur
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      const { role } = req.user;
  
      if (allowedRoles.includes(role)) {
        next();
      } else {
        res.status(403).json("Accès interdit");
      }
    };
  };
  
  // Exemple de route protégée nécessitant une authentification et un rôle spécifique
  router.get("/adminOnly", authenticateToken, checkRole(["admin"]), (req, res) => {
    res.status(200).json("Route accessible aux administrateurs uniquement");
  });
  
  router.get("/secretaireOnly", authenticateToken, checkRole(["secretaire"]), (req, res) => {
    res.status(200).json("Route accessible aux secrétaires uniquement");
  });
  
  router.get("/livreurOnly", authenticateToken, checkRole(["livreur"]), (req, res) => {
    res.status(200).json("Route accessible aux livreurs uniquement");
  });
  
  router.get("/clientOnly", authenticateToken, checkRole(["client"]), (req, res) => {
    res.status(200).json("Route accessible aux clients uniquement");
  }); */