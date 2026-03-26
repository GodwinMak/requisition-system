const  express = require('express');
const  cors =  require('cors');
const  dotenv = require('dotenv');

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors());
app.use(express.json());


const userRoutes = require("./routes/user");
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
