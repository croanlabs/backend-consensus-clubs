const exp = module.exports;

const aBondingCurve = 0.25;

exp.meritsToTokens = (merits, supply) => {
  const newSupply = Math.sqrt(
    (2 * merits + supply * exp.tokenPrice(supply)) / aBondingCurve,
  );
  return newSupply - supply;
};

exp.tokenPrice = supply => supply * aBondingCurve;
