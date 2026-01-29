const bcrypt = require("bcrypt");

bcrypt.hash("KhaledEng2020*", 10).then((hash) => {
  console.log("\n=== BCRYPT HASH FOR PASSWORD ===");
  console.log(hash);
  console.log("\nCopy this hash and use it in Supabase Table Editor");
  console.log("================================\n");
});
