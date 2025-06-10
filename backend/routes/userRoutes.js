import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Rotas públicas
router.post('/login', authUser);
router.post('/', registerUser);
router.post('/password-reset-request', requestPasswordReset);
router.post('/password-reset', resetPassword);

// Rota para depuração (acessível sem verificar ambiente)
router.get('/debug/clean-users/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    console.log(`Tentando remover usuário com email: ${email}`);
    
    // Primeiro verificar se o usuário existe
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Usuário com email ${email} não encontrado`);
      return res.status(404).json({ message: `Usuário com email ${email} não encontrado` });
    }
    
    // Remover o usuário
    await User.deleteOne({ email });
    console.log(`Usuário com email ${email} removido com sucesso`);
    
    res.json({ message: `Usuário com email ${email} removido com sucesso` });
  } catch (error) {
    console.error(`Erro ao remover usuário: ${error.message}`);
    res.status(500).json({ 
      message: 'Erro ao remover usuário', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rotas protegidas
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/change-password')
  .post(protect, changePassword);

// Rotas de admin
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router; 