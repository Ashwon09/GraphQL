const express = require("express");
const app = express();

app.use(express.json());

const data = [
  { id: 1, nutrients: [] },
  { id: 2, nutrients: [] },
  { id: 3, nutrients: [] },
  { id: 4, nutrients: [] },
  { id: 5, nutrients: [{ id: 2 }] },
];
app.get("/test", (req, res) => {
  let bool;
  data.map((d) => {
    console.log(d.nutrients);
  });
});

app.listen(3000, () => {
  console.log("listening to localhost:3000");
});
