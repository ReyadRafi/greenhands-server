const verifyEmail = (req, res, next) => {
  const queryEmail = req.query.email;
  const bodyEmail = req.body?.userEmail || req.body?.requesterEmail;
  const requestEmail = queryEmail || bodyEmail;

  if (requestEmail && requestEmail !== req.decodedEmail) {
    return res.status(403).json({ message: "Forbidden: email mismatch" });
  }

  next();
};

export default verifyEmail;