module.exports = (req, res) => {
  res.status(404).json({
    status: error,
    message: 'Not found',
  });
};
