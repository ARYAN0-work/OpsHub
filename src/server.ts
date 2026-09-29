import app from "./app.js";
import { PORT } from "./config/env.js";

app.listen(PORT, () => {
  console.log(`OpsHub is listening on Server ${PORT}`);
});
