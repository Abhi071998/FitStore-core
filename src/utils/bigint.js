// Postgres bigint columns come back from Prisma as JS BigInt, which
// JSON.stringify can't serialize natively. Patch it once, globally,
// since every table in this schema uses bigint ids.
BigInt.prototype.toJSON = function () {
  return Number(this);
};
