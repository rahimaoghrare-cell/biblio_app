const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');

const app = express();

// DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/livres',   require('./routes/livreRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/emprunts', require('./routes/empruntRoutes'));
app.use('/api/stats',    require('./routes/statsRoutes'));

// Gestion erreurs globale
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.stack);
  res.status(500).json({ message: 'Erreur globale', erreur: err.message });
});

app.listen(5000, () => console.log('Serveur running on port 5000'));